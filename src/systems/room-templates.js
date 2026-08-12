// Room objectives and teaching/gating placement for Honeycomb Wayfinder.
(() => {
const ROOM_OBJECTIVES = [
    {
        id: 'findExit',
        minDepth: 1,
        label: { en: 'Reach the exit', 'es-419': 'Llega a la salida' },
        hint: { en: 'The exit is visible. Plan a route and step onto it.', 'es-419': 'La salida esta visible. Planea una ruta y pisa esa celda.' },
        isComplete: ({ game }) => game.objectiveProgress.exitReached
    },
    {
        id: 'collectTwo',
        minDepth: 1,
        label: { en: 'Collect 2 supplies', 'es-419': 'Junta 2 suministros' },
        hint: { en: 'Pollen and water fuel camp choices.', 'es-419': 'El polen y el agua activan opciones de campamento.' },
        isComplete: ({ game }) => game.objectiveProgress.supplies >= 2
    },
    {
        id: 'keepShield',
        minDepth: 2,
        label: { en: 'Reach the exit with shield', 'es-419': 'Llega a la salida con escudo' },
        hint: { en: 'Shield blocks the next mistake.', 'es-419': 'El escudo bloquea el proximo error.' },
        isComplete: ({ game }) => game.objectiveProgress.exitReached && game.player.upgrades > 0
    },
    {
        id: 'avoidDamage',
        minDepth: 2,
        label: { en: 'Avoid damage this room', 'es-419': 'Evita dano en esta sala' },
        hint: { en: 'Leave danger rings before timers fill.', 'es-419': 'Sal de los anillos de peligro antes de que se llenen.' },
        isComplete: ({ game }) => game.objectiveProgress.exitReached && !game.objectiveProgress.tookDamage
    },
    {
        id: 'defeatEnemy',
        minDepth: 3,
        label: { en: 'Defeat 1 enemy', 'es-419': 'Derrota 1 enemigo' },
        hint: { en: 'Sting, retreat, then sting again if needed.', 'es-419': 'Pica, retrocede y vuelve a picar si hace falta.' },
        isComplete: ({ game }) => game.objectiveProgress.kills >= 1
    }
];

const ROOM_TEMPLATE_DEFS = {
    onboardingPath: {
        minLevel: 1,
        requiredObjects: ['pollen', 'water', 'lampCell', 'upgrade']
    },
    introSupplies: {
        minLevel: 1,
        requiredObjects: ['pollen', 'water', 'upgrade']
    },
    waxDoorPollen: {
        minLevel: 1,
        requiredObjects: ['waxDoor', 'pollen']
    },
    enemyGate: {
        minLevel: 1,
        requiredEnemies: ['thornBeetle']
    },
    mixedGate: {
        minLevel: 3,
        random: true,
        requiredObjects: ['waxDoor'],
        requiredEnemies: ['enemy', 'guardWasp']
    },
    fireWater: {
        minLevel: 3,
        random: true,
        requiredObjects: ['burningCell', 'water']
    },
    revealRoute: {
        minLevel: 3,
        random: true,
        requiredObjects: ['compassPollen', 'wall']
    },
    hiveQueen: {
        minLevel: 5,
        random: true,
        synergyEnemies: ['waspHive', 'queenSignaler']
    },
    fireLeech: {
        minLevel: 4,
        random: true,
        synergyEnemies: ['crawlingFire', 'waterLeech']
    },
    sentinelThief: {
        minLevel: 5,
        random: true,
        synergyEnemies: ['waxSentinel', 'pollenThiefMoth']
    },
    fogBurrow: {
        minLevel: 5,
        random: true,
        synergyEnemies: ['fogShepherd', 'burrowBeetle']
    }
};

function createRoomTemplateSystem(context) {
    const {
        game,
        directions,
        seededRandom,
        randomFrom,
        getCell,
        hexDistance,
        isEnemyObject,
        isObjectAllowedByTheme,
        getPlayerLevel,
        getObjectUnlockLevel,
        getRoomProfile,
        chooseWeightedObject,
        cellKey,
        awardObjectiveXp,
        addObjectivePopup,
        getLanguage
    } = context;

    function chooseRoomObjective() {
        const options = ROOM_OBJECTIVES.filter((objective) => game.roomDepth >= objective.minDepth);
        if (getPlayerLevel() === 1 && game.roomDepth === 1) return decorateObjective(ROOM_OBJECTIVES.find((objective) => objective.id === 'collectTwo'));
        if (game.roomDepth === 1) return decorateObjective(ROOM_OBJECTIVES.find((objective) => objective.id === 'findExit'));
        return decorateObjective(randomFrom(options));
    }

    function decorateObjective(objective) {
        return objective ? {
            ...objective,
            isComplete: () => objective.isComplete({ game })
        } : null;
    }

    function chooseRoomTemplate() {
        if (game.roomDepth === 1 && getPlayerLevel() === 1) return 'onboardingPath';
        if (game.roomDepth === 1) return 'introSupplies';
        if (game.roomDepth === 2) return 'waxDoorPollen';
        if (game.roomDepth === 3) return 'enemyGate';
        const candidates = Object.entries(ROOM_TEMPLATE_DEFS)
            .filter(([, template]) => template.random)
            .map(([template]) => template)
            .filter((template) => isRoomTemplateUnlocked(template) && isRoomTemplateAllowedByTheme(template));
        return randomFrom(candidates.length ? candidates : ['mixedGate']);
    }

    function isRoomTemplateUnlocked(template) {
        return getPlayerLevel() >= (ROOM_TEMPLATE_DEFS[template]?.minLevel || 1);
    }

    function isRoomTemplateAllowedByTheme(template) {
        if (typeof isObjectAllowedByTheme !== 'function') return true;
        const metadata = ROOM_TEMPLATE_DEFS[template];
        const requiredContent = [
            ...(metadata?.requiredObjects || []),
            ...(metadata?.requiredEnemies || []),
            ...(metadata?.synergyEnemies || [])
        ];
        return requiredContent.every((object) => isObjectAllowedByTheme(object));
    }

    function updateObjectiveProgress() {
        if (!game.roomObjective || game.objectiveProgress.rewarded) return;
        const exit = game.exitCell ? getCell(game.exitCell.q, game.exitCell.r) : null;
        game.objectiveProgress.exitSeen = Boolean(exit?.revealed);
        if (!game.roomObjective.isComplete()) return;

        game.objectiveProgress.rewarded = true;
        awardObjectiveXp();
        addObjectivePopup();
    }

    function revealExitCell() {
        const exit = game.exitCell ? getCell(game.exitCell.q, game.exitCell.r) : null;
        if (exit) exit.revealed = true;
    }

    function applyFirstRunOnboardingTemplate() {
        if (game.roomDepth !== 1 || getPlayerLevel() > 1 || !game.entryCell || !game.exitCell) return;
        const route = findRoomPathBetween(game.entryCell, game.exitCell);
        game.roomTemplate = 'onboardingPath';
        game.roomSpawnCounts.enemies = 0;
        game.roomSpawnCounts.hazards = 0;
        game.cells.forEach((cell) => {
            if (cell.object !== 'entry' && cell.object !== 'exit' && cell.object !== 'finalExit') {
                cell.object = 'empty';
                cell.hits = 0;
                cell.nextAuraAt = 0;
                cell.nextAttackAt = 0;
            }
        });
        route.forEach((step) => {
            const cell = getCell(step.q, step.r);
            if (cell && cell.object !== 'entry' && cell.object !== 'exit') cell.object = 'empty';
        });
        const routeCells = route
            .map((step) => getCell(step.q, step.r))
            .filter((cell) => cell && cell.object === 'empty' && cell.object !== 'exit');
        const placementCells = [...routeCells, ...findOffRouteCells(route)]
            .filter((cell, index, cells) => (
                cell.object === 'empty'
                && !(cell.q === game.player.q && cell.r === game.player.r)
                && !(cell.q === game.exitCell.q && cell.r === game.exitCell.r)
                && cells.findIndex((candidate) => cellKey(candidate.q, candidate.r) === cellKey(cell.q, cell.r)) === index
            ))
            .sort((a, b) => {
                const routeA = routeCells.includes(a) ? 0 : 1;
                const routeB = routeCells.includes(b) ? 0 : 1;
                if (routeA !== routeB) return routeA - routeB;
                return hexDistance(a.q, a.r, game.player.q, game.player.r) - hexDistance(b.q, b.r, game.player.q, game.player.r);
            });
        ['pollen', 'water', 'lampCell', 'upgrade'].forEach((object, index) => {
            const cell = placementCells[index];
            if (cell) cell.object = object;
        });
        const offRoute = findOffRouteCells(route)
            .filter((cell) => hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 3);
        offRoute.slice(0, 2).forEach((cell) => {
            if (cell.object === 'empty') cell.object = seededRandom() < 0.5 ? 'pollen' : 'water';
        });
    }

    function placeFirstRoomTeachingPickups() {
        if (game.roomDepth !== 1) return;
        if (game.roomTemplate === 'onboardingPath') return;
        const candidates = game.cells
            .filter((cell) => (
                cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 2
                && !(cell.q === game.player.q && cell.r === game.player.r)
                && !(cell.q === game.exitCell.q && cell.r === game.exitCell.r)
            ))
            .sort((a, b) => hexDistance(a.q, a.r, game.player.q, game.player.r) - hexDistance(b.q, b.r, game.player.q, game.player.r));

        ['pollen', 'water', 'upgrade'].forEach((object, index) => {
            const cell = candidates[index];
            if (cell) cell.object = object;
        });
    }

    function placeRoomLessonGate(template = 'mixedGate') {
        if (!game.exitCell || game.roomDepth <= 1) return;
        const route = findRoomPathBetween(game.entryCell, game.exitCell);
        if (template === 'waxDoorPollen') {
            placeWaxDoorRouteLesson(route);
            placeResourceNearPlayer('pollen');
            return;
        }
        if (template === 'enemyGate') {
            placeEnemyRouteLesson(route, 'thornBeetle');
            placeResourceNearPlayer('pollen');
            return;
        }
        if (template === 'fireWater') {
            placeFireWaterExitGate();
            placeResourceNearPlayer('water');
            return;
        }
        if (template === 'revealRoute') {
            placeRevealRouteLesson();
            return;
        }
        placeMixedExitGate();
    }

    function clearRouteForLesson(route) {
        route.forEach((step) => {
            const cell = getCell(step.q, step.r);
            if (!cell || cell.object === 'entry' || cell.object === 'exit' || cell.object === 'finalExit') return;
            cell.object = 'empty';
            cell.hits = 0;
            cell.nextAuraAt = 0;
            cell.nextAttackAt = 0;
            cell.facingDir = null;
            cell.lessonSafe = false;
        });
    }

    function findOffRouteCells(route) {
        const routeKeys = new Set(route.map((step) => cellKey(step.q, step.r)));
        return game.cells
            .filter((cell) => cell.object === 'empty'
                && !routeKeys.has(cellKey(cell.q, cell.r))
                && cell.object !== 'entry'
                && cell.object !== 'exit')
            .sort((a, b) => hexDistance(a.q, a.r, game.player.q, game.player.r) - hexDistance(b.q, b.r, game.player.q, game.player.r));
    }

    function placeEnemySynergy(template) {
        const pair = ROOM_TEMPLATE_DEFS[template]?.synergyEnemies;
        if (!pair || pair.some((object) => getObjectUnlockLevel(object) > getPlayerLevel())) return;
        const anchor = game.cells
            .filter((cell) => cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 4
                && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 1)
            .sort((a, b) => hexDistance(a.q, a.r, game.exitCell.q, game.exitCell.r) - hexDistance(b.q, b.r, game.exitCell.q, game.exitCell.r))[0];
        if (!anchor) return;
        anchor.object = pair[0];
        anchor.nextAuraAt = performance.now() + 900;
        anchor.hits = 0;
        game.roomSpawnCounts.enemies += 1;

        const partner = directions
            .map((direction) => getCell(anchor.q + direction.q, anchor.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 3)[0];
        if (!partner) return;
        partner.object = pair[1];
        partner.nextAuraAt = performance.now() + 900;
        partner.hits = 0;
        game.roomSpawnCounts.enemies += 1;
    }

    function placeWaxDoorExitGate() {
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        const gate = neighbors[0];
        if (!gate) return;
        gate.object = 'waxDoor';
        game.roomSpawnCounts.hazards += 1;
        neighbors.slice(1, 4).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeWaxDoorRouteLesson(route) {
        if (!Array.isArray(route) || route.length < 4) {
            placeWaxDoorExitGate();
            return;
        }
        clearRouteForLesson(route);
        const doorStep = route[route.length - 2];
        const door = getCell(doorStep.q, doorStep.r);
        if (!door || !isGateCandidateCell(door)) {
            placeWaxDoorExitGate();
            return;
        }
        door.object = 'waxDoor';
        game.roomSpawnCounts.hazards += 1;

        const supplyStep = route[Math.max(0, Math.min(1, route.length - 4))];
        const supply = getCell(supplyStep.q, supplyStep.r);
        if (supply && supply.object === 'empty') supply.object = 'pollen';

        getExitNeighborCells()
            .filter((cell) => cell !== door && isGateCandidateCell(cell))
            .slice(0, 2)
            .forEach((cell) => {
                cell.object = 'wall';
            });
    }

    function placeEnemyExitGate(enemyObject = 'enemy') {
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        const guard = neighbors[0];
        if (!guard) return;
        guard.object = enemyObject;
        guard.nextAuraAt = 0;
        guard.nextAttackAt = 0;
        guard.hits = 0;
        game.roomSpawnCounts.enemies += 1;
        neighbors.slice(1, 3).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeEnemyRouteLesson(route, enemyObject = 'enemy') {
        if (!Array.isArray(route) || route.length < 5) {
            placeEnemyExitGate(enemyObject);
            return;
        }
        clearRouteForLesson(route);
        const guardIndex = Math.max(2, route.length - 3);
        const guardStep = route[guardIndex];
        const guard = getCell(guardStep.q, guardStep.r);
        if (!guard || !isGateCandidateCell(guard) || hexDistance(guard.q, guard.r, game.entryCell.q, game.entryCell.r) <= 2) {
            placeEnemyExitGate(enemyObject);
            return;
        }
        const lessonEnemy = getObjectUnlockLevel(enemyObject) <= Math.max(2, getPlayerLevel())
            ? enemyObject
            : 'enemy';
        guard.object = lessonEnemy;
        guard.nextAuraAt = 0;
        guard.nextAttackAt = 0;
        guard.hits = 0;
        guard.revealed = true;
        guard.litByLamp = true;
        game.roomSpawnCounts.enemies += 1;

        const routeKeys = new Set(route.map((step) => cellKey(step.q, step.r)));
        let safeCells = directions
            .map((direction) => getCell(guard.q + direction.q, guard.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && cell.object !== 'exit' && !routeKeys.has(cellKey(cell.q, cell.r)))
            .slice(0, 3);
        if (!safeCells.length) {
            safeCells = directions
                .map((direction) => getCell(guard.q + direction.q, guard.r + direction.r))
                .filter((cell) => cell && cell.object === 'empty' && cell.object !== 'exit')
                .slice(0, 2);
        }
        safeCells.forEach((cell) => {
            cell.revealed = true;
            cell.litByLamp = true;
            cell.lessonSafe = true;
        });
    }

    function placeMixedExitGate() {
        const profile = getRoomProfile();
        const enemy = profile.allowedEnemies.includes('guardWasp') && getObjectUnlockLevel('guardWasp') <= getPlayerLevel()
            ? 'guardWasp'
            : 'enemy';
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        const guard = neighbors[0];
        if (guard) {
            guard.object = enemy;
            guard.nextAuraAt = 0;
            guard.nextAttackAt = 0;
            guard.hits = 0;
            game.roomSpawnCounts.enemies += 1;
        }
        const door = neighbors[1];
        if (door) {
            door.object = 'waxDoor';
            game.roomSpawnCounts.hazards += 1;
            placeResourceNearPlayer('pollen');
        }
        neighbors.slice(2, 4).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeFireWaterExitGate() {
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        neighbors.slice(0, 2).forEach((cell) => {
            cell.object = 'burningCell';
            game.roomSpawnCounts.hazards += 1;
        });
        neighbors.slice(2, 4).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeRevealRouteLesson() {
        placeResourceNearPlayer('compassPollen');
        const routeCells = game.cells
            .filter((cell) => cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 3
                && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 2)
            .sort((a, b) => hexDistance(a.q, a.r, game.exitCell.q, game.exitCell.r) - hexDistance(b.q, b.r, game.exitCell.q, game.exitCell.r));
        routeCells.slice(0, 2).forEach((cell) => {
            cell.object = 'wall';
        });
    }

    function isGateCandidateCell(cell) {
        return Boolean(cell
            && cell.object !== 'entry'
            && cell.object !== 'exit'
            && cell.object !== 'finalExit'
            && !(cell.q === game.player.q && cell.r === game.player.r));
    }

    function getExitNeighborCells() {
        if (!game.exitCell) return [];
        return directions.map((direction) => getCell(game.exitCell.q + direction.q, game.exitCell.r + direction.r)).filter(Boolean);
    }

    function placeResourceNearPlayer(object) {
        const target = game.cells
            .filter((cell) => (
                cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 3
                && !(cell.q === game.player.q && cell.r === game.player.r)
            ))
            .sort((a, b) => hexDistance(a.q, a.r, game.player.q, game.player.r) - hexDistance(b.q, b.r, game.player.q, game.player.r))[0];
        if (target) target.object = object;
    }

    function findRoomPathBetween(start, target) {
        const available = new Set(game.currentRoomCells.map((cell) => cellKey(cell.q, cell.r)));
        const queue = [{ q: start.q, r: start.r, path: [] }];
        const visited = new Set([cellKey(start.q, start.r)]);
        while (queue.length) {
            const current = queue.shift();
            if (current.q === target.q && current.r === target.r) return current.path;
            directions.forEach((direction) => {
                const next = { q: current.q + direction.q, r: current.r + direction.r };
                const key = cellKey(next.q, next.r);
                if (!available.has(key) || visited.has(key)) return;
                visited.add(key);
                queue.push({ q: next.q, r: next.r, path: [...current.path, next] });
            });
        }
        return [];
    }

    function getRoomObjectiveText() {
        if (!game.roomObjective) return '';
        const language = getLanguage() === 'es-419' ? 'es-419' : 'en';
        const status = game.roomObjective.isComplete() ? 'OK ' : '';
        return `${status}${game.roomObjective.label[language]} - ${game.roomObjective.hint[language]}`;
    }

    return {
        chooseRoomObjective,
        chooseRoomTemplate,
        updateObjectiveProgress,
        getRoomObjectiveText,
        revealExitCell,
        applyFirstRunOnboardingTemplate,
        placeFirstRoomTeachingPickups,
        placeRoomLessonGate,
        placeEnemySynergy,
        findRoomPathBetween
    };
}

window.HW_ROOM_TEMPLATES = {
    createRoomTemplateSystem,
    ROOM_OBJECTIVES,
    ROOM_TEMPLATE_DEFS
};
})();
