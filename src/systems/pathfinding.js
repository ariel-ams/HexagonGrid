// Multi-cell path preview, memoization, and route risk annotation.
(() => {
function createPathfindingSystem(context) {
    const {
        directions,
        getCell,
        cellKey,
        hexDistance,
        getGame,
        isEnemyObject,
        getThreatAtCell,
        getMoveBudget,
        vineDamage
    } = context;

    function getPathPreview(cell) {
        const game = getGame();
        if (!cell || game.mode !== 'dungeon') return null;
        const riskTick = Math.floor(performance.now() / 300);
        const key = `${game.player.q},${game.player.r}->${cell.q},${cell.r}:${game.player.steps}:${game.cells.length}:${game.player.health}:${game.player.upgrades}:${game.player.water}:${game.player.movePoints}:${game.player.actionAvailable}:${riskTick}`;
        if (game.pathCache[key]) return game.pathCache[key];
        const preview = annotatePathRisk(findPathToCell(cell));
        game.pathCache[key] = preview;
        return preview;
    }

    function findPathToCell(target) {
        const game = getGame();
        const startKey = cellKey(game.player.q, game.player.r);
        const targetKey = cellKey(target.q, target.r);
        const targetIsBlocked = isPathBlockedTarget(target);
        const queue = [{ q: game.player.q, r: game.player.r, path: [] }];
        const visited = new Set([startKey]);
        let best = null;

        while (queue.length) {
            const current = queue.shift();
            if (cellKey(current.q, current.r) === targetKey) {
                return { path: current.path, complete: true };
            }
            if (targetIsBlocked && current.path.length && isAdjacentTo(current, target)) {
                return {
                    path: current.path,
                    complete: false,
                    blockedTarget: { q: target.q, r: target.r, object: target.object }
                };
            }
            directions.forEach((direction) => {
                const next = getCell(current.q + direction.q, current.r + direction.r);
                if (!next) return;
                const key = cellKey(next.q, next.r);
                if (visited.has(key)) return;
                visited.add(key);
                if (!isPathWalkable(next, target)) {
                    const blockedPath = [...current.path];
                    if (!best || blockedPath.length > best.path.length) {
                        best = { path: blockedPath, complete: false };
                    }
                    return;
                }
                const nextPath = [...current.path, next];
                const bestEnd = best?.path?.at(-1);
                if (!best || nextPath.length > best.path.length || hexDistance(next.q, next.r, target.q, target.r) < hexDistance(bestEnd?.q ?? game.player.q, bestEnd?.r ?? game.player.r, target.q, target.r)) {
                    best = { path: nextPath, complete: false };
                }
                queue.push({ q: next.q, r: next.r, path: nextPath });
            });
        }

        return best || { path: [], complete: false };
    }

    function isPathWalkable(cell, target) {
        const game = getGame();
        if (cell.object === 'wall' || cell.object === 'waxDoor') return false;
        if ((cell.object === 'vine' || cell.object === 'burningCell' || isEnemyObject(cell.object)) && cell !== target) return false;
        if (isEnemyObject(cell.object) && cell === target && !game.player.actionAvailable) return false;
        return true;
    }

    function isPathBlockedTarget(cell) {
        return cell?.object === 'wall' || cell?.object === 'waxDoor';
    }

    function annotatePathRisk(preview) {
        const game = getGame();
        if (!preview?.path) return preview;
        let health = game.player.health;
        let shield = game.player.upgrades;
        let water = game.player.water;
        let totalDamage = 0;
        let totalBlocked = 0;
        let waterSpent = 0;
        let deathCell = null;

        preview.path.forEach((cell) => {
            if (deathCell) return;
            let damage = 0;
            if (cell.object === 'vine') damage += vineDamage;
            if (cell.object === 'burningCell') {
                if (water > 0) {
                    water -= 1;
                    waterSpent += 1;
                } else {
                    damage += 1;
                }
            }
            const threat = getThreatAtCell(cell.q, cell.r);
            if (threat?.imminent && threat.damage > 0) damage += threat.damage;
            const blocked = Math.min(shield, damage);
            shield -= blocked;
            health -= Math.max(0, damage - blocked);
            totalDamage += damage;
            totalBlocked += blocked;
            if (health <= 0) deathCell = { q: cell.q, r: cell.r };
        });

        const budget = getMoveBudget();
        return {
            ...preview,
            fullLength: preview.path.length,
            reachablePath: preview.path.slice(0, budget),
            reachableLength: Math.min(preview.path.length, budget),
            risk: { totalDamage, totalBlocked, waterSpent, lethal: Boolean(deathCell) },
            deathCell
        };
    }

    function isAdjacentTo(a, b) {
        return hexDistance(a.q, a.r, b.q, b.r) === 1;
    }

    function getRouteMoveCost(path = []) {
        return path.length;
    }

    return {
        getPathPreview,
        findPathToCell,
        isPathWalkable,
        isPathBlockedTarget,
        annotatePathRisk,
        getRouteMoveCost
    };
}

window.HW_PATHFINDING = {
    createPathfindingSystem
};
})();
