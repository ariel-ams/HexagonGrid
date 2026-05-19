// Dungeon shape and portal generation for Honeycomb Wayfinder.
(() => {
function createDungeonGenerator(context) {
    const { directions, helpers } = context;
    const CENTER_SPACING = 6;

    function generateCaveBlob(targetCount) {
        const cells = new Map();
        const frontier = [{ q: 0, r: 0 }];
        cells.set(helpers.cellKey(0, 0), { q: 0, r: 0 });

        while (cells.size < targetCount) {
            const origin = randomFrom(frontier);
            const shuffled = [...directions].sort(() => helpers.seededRandom() - 0.5);

            shuffled.forEach((direction) => {
                if (cells.size >= targetCount) return;
                const q = origin.q + direction.q;
                const r = origin.r + direction.r;
                const key = helpers.cellKey(q, r);
                if (cells.has(key)) return;

                const neighborCount = directions.filter((neighbor) => (
                    cells.has(helpers.cellKey(q + neighbor.q, r + neighbor.r))
                )).length;
                const acceptance = neighborCount >= 2 ? 0.92 : 0.58;

                if (helpers.seededRandom() < acceptance) {
                    const cell = { q, r };
                    cells.set(key, cell);
                    frontier.push(cell);
                }
            });

            if (helpers.seededRandom() < 0.12) {
                frontier.push(randomFrom([...cells.values()]));
            }
        }

        return [...cells.values()];
    }

    function choosePortalCells(cells) {
        const centerSorted = [...cells].sort((a, b) => (
            helpers.hexDistance(0, 0, b.q, b.r) - helpers.hexDistance(0, 0, a.q, a.r)
        ));
        const outerCells = centerSorted.slice(0, Math.max(12, Math.floor(cells.length * 0.22)));
        const entry = randomFrom(outerCells);
        const exit = [...outerCells]
            .filter((cell) => cell !== entry)
            .sort((a, b) => (
                helpers.hexDistance(entry.q, entry.r, b.q, b.r) - helpers.hexDistance(entry.q, entry.r, a.q, a.r)
            ))[0];
        return { entry, exit };
    }

    function generateCaveDungeon(options = {}) {
        const depth = options.depth || 1;
        const targetCells = options.targetCells || 80;
        const bossRoom = Boolean(options.bossRoom);
        const roomCount = options.roomCount || getRoomCountForDepth(depth, bossRoom);
        const centers = generateRoomCenters(roomCount);
        const edges = connectRoomGraph(centers, depth);
        const roomTargets = distributeRoomCellTargets(targetCells, centers.length);
        const cellMap = new Map();
        const roomCells = centers.map((center, index) => {
            const room = growOrganicRoom(center, roomTargets[index], depth);
            room.forEach((cell) => addCell(cellMap, cell.q, cell.r, {
                roomIndex: index,
                kind: 'room'
            }));
            return room;
        });

        edges.forEach((edge) => {
            const corridor = carveCorridor(centers[edge.from], centers[edge.to], depth);
            corridor.forEach((cell) => addCell(cellMap, cell.q, cell.r, {
                roomIndex: null,
                kind: 'corridor'
            }));
        });

        smoothCave(cellMap, depth);
        const graphDistances = getGraphDistances(edges, centers.length, 0);
        const farthestRoomIndex = graphDistances.reduce((best, distance, index) => (
            distance > graphDistances[best] ? index : best
        ), 0);
        const entry = chooseRoomPortalCell(roomCells[0], centers[0], centers[1] || centers[0], false);
        const exit = chooseRoomPortalCell(
            roomCells[farthestRoomIndex] || [...cellMap.values()],
            centers[farthestRoomIndex] || centers[0],
            centers[0],
            true
        );

        return {
            cells: [...cellMap.values()].map(({ q, r, roomIndex, kind }) => ({ q, r, roomIndex, kind })),
            entry,
            exit,
            metadata: {
                roomCount: centers.length,
                centers,
                edges,
                startRoomIndex: 0,
                farthestRoomIndex,
                bossRoom,
                graphDistances
            }
        };
    }

    function getRoomCountForDepth(depth, bossRoom = false) {
        if (bossRoom) return 8 + Math.floor(helpers.seededRandom() * 3);
        if (depth <= 1) return 3 + Math.floor(helpers.seededRandom() * 3);
        if (depth <= 3) return 5 + Math.floor(helpers.seededRandom() * 4);
        return 8 + Math.floor(helpers.seededRandom() * 4);
    }

    function generateRoomCenters(roomCount) {
        const centers = [{ q: 0, r: 0 }];
        const occupied = new Set([helpers.cellKey(0, 0)]);
        const frontier = [centers[0]];

        while (centers.length < roomCount) {
            const origin = randomFrom(frontier) || centers[centers.length - 1];
            const shuffled = [...directions].sort(() => helpers.seededRandom() - 0.5);
            let added = false;
            for (const direction of shuffled) {
                const q = origin.q + direction.q * CENTER_SPACING;
                const r = origin.r + direction.r * CENTER_SPACING;
                const key = helpers.cellKey(q, r);
                if (occupied.has(key)) continue;
                const center = { q, r };
                occupied.add(key);
                centers.push(center);
                frontier.push(center);
                added = true;
                break;
            }
            if (!added) {
                frontier.splice(0, 1);
                if (!frontier.length) frontier.push(...centers);
            }
        }

        return centers;
    }

    function connectRoomGraph(centers, depth) {
        const edges = [];
        const connected = new Set([0]);
        const remaining = new Set(centers.slice(1).map((_, index) => index + 1));

        while (remaining.size) {
            let best = null;
            connected.forEach((from) => {
                remaining.forEach((to) => {
                    const distance = helpers.hexDistance(centers[from].q, centers[from].r, centers[to].q, centers[to].r);
                    if (!best || distance < best.distance) best = { from, to, distance };
                });
            });
            edges.push({ from: best.from, to: best.to, critical: true });
            connected.add(best.to);
            remaining.delete(best.to);
        }

        const loopChance = depth <= 1 ? 0.15 : depth <= 3 ? 0.32 : 0.48;
        for (let from = 0; from < centers.length; from++) {
            for (let to = from + 1; to < centers.length; to++) {
                if (edges.some((edge) => connects(edge, from, to))) continue;
                const distance = helpers.hexDistance(centers[from].q, centers[from].r, centers[to].q, centers[to].r);
                if (distance <= CENTER_SPACING * 1.25 && helpers.seededRandom() < loopChance) {
                    edges.push({ from, to, critical: false });
                }
            }
        }

        return edges;
    }

    function connects(edge, from, to) {
        return (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from);
    }

    function distributeRoomCellTargets(targetCells, roomCount) {
        const corridorBudget = Math.max(12, Math.floor(targetCells * 0.18));
        const roomBudget = Math.max(roomCount * 9, targetCells - corridorBudget);
        const base = Math.max(9, Math.floor(roomBudget / roomCount));
        return Array.from({ length: roomCount }, (_, index) => {
            const variance = Math.floor((helpers.seededRandom() - 0.5) * 6);
            const startRoomBonus = index === 0 ? 2 : 0;
            return Math.max(8, base + variance + startRoomBonus);
        });
    }

    function growOrganicRoom(center, targetCount, depth) {
        const room = new Map();
        const frontier = [{ ...center }];
        room.set(helpers.cellKey(center.q, center.r), { ...center });
        const compactness = depth <= 1 ? 0.72 : depth <= 3 ? 0.64 : 0.56;

        while (room.size < targetCount) {
            const origin = randomFrom(frontier) || randomFrom([...room.values()]);
            const shuffled = [...directions].sort(() => helpers.seededRandom() - 0.5);
            shuffled.forEach((direction) => {
                if (room.size >= targetCount) return;
                const q = origin.q + direction.q;
                const r = origin.r + direction.r;
                const key = helpers.cellKey(q, r);
                if (room.has(key)) return;
                const distance = helpers.hexDistance(center.q, center.r, q, r);
                const neighborCount = directions.filter((neighbor) => (
                    room.has(helpers.cellKey(q + neighbor.q, r + neighbor.r))
                )).length;
                const acceptance = Math.max(0.18, compactness + neighborCount * 0.08 - distance * 0.045);
                if (helpers.seededRandom() < acceptance) {
                    const cell = { q, r };
                    room.set(key, cell);
                    frontier.push(cell);
                }
            });

            if (helpers.seededRandom() < 0.18) {
                frontier.push(randomFrom([...room.values()]));
            }
        }

        return [...room.values()];
    }

    function carveCorridor(from, to, depth) {
        const path = findAxialPath(from, to);
        const cells = new Map();
        path.forEach((step, index) => {
            addCell(cells, step.q, step.r, { kind: 'corridor' });
            getCorridorShoulders(path, index, depth).forEach((shoulder) => {
                addCell(cells, shoulder.q, shoulder.r, { kind: 'corridor' });
            });
        });
        return [...cells.values()];
    }

    function findAxialPath(from, to) {
        const open = [{ q: from.q, r: from.r, cost: 0, priority: 0 }];
        const cameFrom = new Map();
        const costSoFar = new Map([[helpers.cellKey(from.q, from.r), 0]]);
        const targetKey = helpers.cellKey(to.q, to.r);

        while (open.length) {
            open.sort((a, b) => a.priority - b.priority);
            const current = open.shift();
            const currentKey = helpers.cellKey(current.q, current.r);
            if (currentKey === targetKey) break;

            directions.forEach((direction) => {
                const next = { q: current.q + direction.q, r: current.r + direction.r };
                const key = helpers.cellKey(next.q, next.r);
                const newCost = costSoFar.get(currentKey) + 1;
                if (costSoFar.has(key) && newCost >= costSoFar.get(key)) return;
                costSoFar.set(key, newCost);
                cameFrom.set(key, current);
                open.push({
                    ...next,
                    cost: newCost,
                    priority: newCost + helpers.hexDistance(next.q, next.r, to.q, to.r)
                });
            });
        }

        const path = [];
        let cursor = { ...to };
        let guard = 0;
        while (helpers.cellKey(cursor.q, cursor.r) !== helpers.cellKey(from.q, from.r) && guard < 200) {
            path.push(cursor);
            cursor = cameFrom.get(helpers.cellKey(cursor.q, cursor.r));
            if (!cursor) break;
            guard += 1;
        }
        path.push(from);
        return path.reverse();
    }

    function getCorridorShoulders(path, index, depth) {
        const direction = getPathDirection(path, index) || randomFrom(directions);
        if (!direction) return [];
        const directionIndex = directions.findIndex((candidate) => candidate.q === direction.q && candidate.r === direction.r);
        const shoulderDirections = [directions[(directionIndex + 2) % directions.length]];
        if (depth >= 4 || helpers.seededRandom() < 0.18) {
            shoulderDirections.push(directions[(directionIndex + 4) % directions.length]);
        }
        const step = path[index];
        return shoulderDirections
            .filter(Boolean)
            .map((shoulder) => ({ q: step.q + shoulder.q, r: step.r + shoulder.r }));
    }

    function getPathDirection(path, index) {
        const current = path[index];
        const next = path[index + 1];
        const previous = path[index - 1];
        const neighbor = next || previous;
        if (!current || !neighbor) return null;
        const delta = next
            ? { q: next.q - current.q, r: next.r - current.r }
            : { q: current.q - previous.q, r: current.r - previous.r };
        return directions.find((direction) => direction.q === delta.q && direction.r === delta.r) || null;
    }

    function smoothCave(cellMap, depth) {
        const additions = [];
        const threshold = depth <= 1 ? 5 : 4;
        cellMap.forEach((cell) => {
            directions.forEach((direction) => {
                const q = cell.q + direction.q;
                const r = cell.r + direction.r;
                const key = helpers.cellKey(q, r);
                if (cellMap.has(key)) return;
                const neighborCount = directions.filter((neighbor) => (
                    cellMap.has(helpers.cellKey(q + neighbor.q, r + neighbor.r))
                )).length;
                if (neighborCount >= threshold && helpers.seededRandom() < 0.7) {
                    additions.push({ q, r });
                }
            });
        });
        additions.forEach((cell) => addCell(cellMap, cell.q, cell.r, { roomIndex: null, kind: 'fill' }));
    }

    function getGraphDistances(edges, roomCount, start) {
        const adjacency = Array.from({ length: roomCount }, () => []);
        edges.forEach((edge) => {
            adjacency[edge.from].push(edge.to);
            adjacency[edge.to].push(edge.from);
        });
        const distances = Array.from({ length: roomCount }, () => Infinity);
        distances[start] = 0;
        const queue = [start];
        while (queue.length) {
            const current = queue.shift();
            adjacency[current].forEach((next) => {
                if (distances[next] <= distances[current] + 1) return;
                distances[next] = distances[current] + 1;
                queue.push(next);
            });
        }
        return distances;
    }

    function chooseRoomPortalCell(roomCells, roomCenter, awayFrom, preferAway) {
        const cells = roomCells?.length ? roomCells : [{ ...roomCenter }];
        const sorted = [...cells].sort((a, b) => {
            const aDistance = helpers.hexDistance(a.q, a.r, awayFrom.q, awayFrom.r);
            const bDistance = helpers.hexDistance(b.q, b.r, awayFrom.q, awayFrom.r);
            return preferAway ? bDistance - aDistance : aDistance - bDistance;
        });
        const pool = sorted.slice(0, Math.max(3, Math.ceil(sorted.length * 0.3)));
        return { ...randomFrom(pool) };
    }

    function addCell(map, q, r, metadata = {}) {
        const key = helpers.cellKey(q, r);
        if (!map.has(key)) {
            map.set(key, { q, r, ...metadata });
            return;
        }
        Object.assign(map.get(key), metadata.kind === 'room' ? metadata : { kind: map.get(key).kind || metadata.kind });
    }

    function randomFrom(items) {
        if (!items?.length) return null;
        return items[Math.floor(helpers.seededRandom() * items.length)];
    }

    return {
        generateCaveBlob,
        generateCaveDungeon,
        choosePortalCells,
        randomFrom
    };
}

window.HW_DUNGEON_GENERATION = {
    createDungeonGenerator
};
})();
