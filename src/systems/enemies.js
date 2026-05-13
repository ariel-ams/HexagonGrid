// Data-driven enemy behavior helpers.
(() => {
function createEnemySystem(context) {
    const { game, enemyDefs, directions, helpers } = context;

    function hasBehavior(object, type) {
        return Boolean(getBehavior(object, type));
    }

    function getBehavior(object, type) {
        return enemyDefs[object]?.behaviors?.find((behavior) => behavior.type === type);
    }

    function hasTimedThreat(object) {
        return Boolean(enemyDefs[object]?.behaviors?.some((behavior) => (
            behavior.type === 'damageAura'
            || behavior.type === 'refogAura'
            || behavior.type === 'stealResourceAura'
            || behavior.type === 'spawnEnemyAura'
            || behavior.type === 'spawnTerrainAura'
            || behavior.type === 'buffEnemiesAura'
            || behavior.type === 'waterDrainAura'
            || behavior.type === 'burrowAmbush'
            || behavior.type === 'weakPointWindow'
            || behavior.type === 'markCellsAura'
        )));
    }

    function handleTimedThreat(enemyCell, enemy, now) {
        const behaviors = enemy.behaviors || [];

        for (const behavior of behaviors) {
            if (behavior.type === 'refogAura') {
                const hidden = refogNearEnemy(enemyCell);
                if (hidden > 0) {
                    helpers.addLog(enemy.name, `Fog moth folded ${hidden} revealed cell${hidden === 1 ? '' : 's'} back into mist.`);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'refog', count: hidden });
                }
                return true;
            }

            if (behavior.type === 'stealResourceAura') {
                if ((game.player[behavior.resource] || 0) >= behavior.amount) {
                    game.player[behavior.resource] -= behavior.amount;
                    helpers.addStatPopups(enemyCell.q, enemyCell.r, [{ stat: behavior.resource, amount: -behavior.amount }]);
                    helpers.addLog(enemy.name, `${enemy.name} stole ${behavior.amount} ${behavior.resource}.`);
                    if (hasBehavior(enemyCell.object, 'fleeFromPlayer')) fleeFromPlayer(enemyCell);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'stealResource' });
                }
                return true;
            }

            if (behavior.type === 'spawnEnemyAura') {
                const spawned = spawnEnemyNear(enemyCell, behavior.object);
                if (spawned) {
                    helpers.addLog(enemy.name, `${enemy.name} spawned ${behavior.object}.`);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'spawnEnemy' });
                    return true;
                }
                const fallback = behaviors.find((candidate) => candidate.type === 'damageAura' && candidate.fallbackOnly);
                if (fallback && enemy.attack > 0) {
                    helpers.applyDamage(enemy.attack, enemyCell.q, enemyCell.r, `${enemy.name} Attack`);
                    helpers.recordReplayEvent('enemyDamage', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, amount: enemy.attack });
                    return true;
                }
            }

            if (behavior.type === 'spawnTerrainAura') {
                const placed = spawnTerrainNear(enemyCell, behavior.object);
                if (placed) {
                    helpers.addLog(enemy.name, `${enemy.name} spread ${behavior.object}.`);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'spawnTerrain' });
                }
                return true;
            }

            if (behavior.type === 'buffEnemiesAura') {
                const buffed = buffNearbyEnemies(enemyCell, behavior);
                if (buffed > 0) {
                    helpers.addLog(enemy.name, `${enemy.name} signaled ${buffed} nearby threat${buffed === 1 ? '' : 's'}.`);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'buffEnemies', count: buffed });
                }
                return true;
            }

            if (behavior.type === 'waterDrainAura') {
                helpers.addLog(enemy.name, `${enemy.name} is draining nearby water utility.`);
                helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'waterDrain' });
                return true;
            }

            if (behavior.type === 'burrowAmbush') {
                const marked = markBurrowWarning(enemyCell, behavior);
                if (marked) {
                    helpers.addLog(enemy.name, `${enemy.name} burrowed and marked a warning cell.`);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'burrowWarning' });
                }
                return true;
            }

            if (behavior.type === 'weakPointWindow') {
                enemyCell.weakPointUntil = now + (behavior.openMs || 1600);
                helpers.addLog(enemy.name, `${enemy.name} exposed its weak point.`);
                helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'weakPoint' });
                return true;
            }

            if (behavior.type === 'markCellsAura') {
                const marked = markBomberCells(enemyCell, behavior);
                if (marked > 0) {
                    helpers.addLog(enemy.name, `${enemy.name} marked ${marked} blast cell${marked === 1 ? '' : 's'}.`);
                    helpers.recordReplayEvent('enemySpecial', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, effect: 'markCells', count: marked });
                }
                return true;
            }
        }

        return false;
    }

    function refogNearEnemy(enemyCell) {
        let hidden = 0;
        game.cells.forEach((cell) => {
            const protectedCell = (
                cell.q === game.player.q && cell.r === game.player.r
            ) || cell.object === 'entry' || cell.object === 'exit' || cell.object === 'finalExit';
            if (
                !protectedCell
                && cell.revealed
                && helpers.hexDistance(enemyCell.q, enemyCell.r, cell.q, cell.r) <= 2
                && helpers.hexDistance(game.player.q, game.player.r, cell.q, cell.r) > game.revealRadius
            ) {
                cell.revealed = false;
                hidden += 1;
            }
        });
        return hidden;
    }

    function fleeFromPlayer(enemyCell) {
        const target = directions
            .map((direction) => helpers.getCell(enemyCell.q + direction.q, enemyCell.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && !(cell.q === game.player.q && cell.r === game.player.r))
            .sort((a, b) => (
                helpers.hexDistance(b.q, b.r, game.player.q, game.player.r)
                - helpers.hexDistance(a.q, a.r, game.player.q, game.player.r)
            ))[0];
        if (!target) return false;
        target.object = enemyCell.object;
        target.hits = enemyCell.hits || 0;
        target.revealed = enemyCell.revealed;
        target.nextAuraAt = 0;
        enemyCell.object = 'empty';
        enemyCell.hits = 0;
        enemyCell.nextAuraAt = 0;
        return true;
    }

    function spawnEnemyNear(enemyCell, object) {
        const target = directions
            .map((direction) => helpers.getCell(enemyCell.q + direction.q, enemyCell.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && !(cell.q === game.player.q && cell.r === game.player.r))
            .sort(() => helpers.seededRandom() - 0.5)[0];
        if (!target) return false;
        target.object = object;
        target.revealed = enemyCell.revealed;
        target.nextAuraAt = 0;
        target.hits = 0;
        return true;
    }

    function spawnTerrainNear(enemyCell, object) {
        const target = directions
            .map((direction) => helpers.getCell(enemyCell.q + direction.q, enemyCell.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && !(cell.q === game.player.q && cell.r === game.player.r))
            .sort(() => helpers.seededRandom() - 0.5)[0];
        if (!target) return false;
        target.object = object;
        target.revealed = enemyCell.revealed;
        return true;
    }

    function buffNearbyEnemies(enemyCell, behavior) {
        let count = 0;
        game.cells.forEach((cell) => {
            if (
                cell !== enemyCell
                && enemyDefs[cell.object]
                && helpers.hexDistance(enemyCell.q, enemyCell.r, cell.q, cell.r) <= (behavior.range || 2)
            ) {
                const acceleration = behavior.accelerateMs || 250;
                if (cell.nextAuraAt) cell.nextAuraAt = Math.max(0, cell.nextAuraAt - acceleration);
                if (cell.nextAttackAt) cell.nextAttackAt = Math.max(0, cell.nextAttackAt - acceleration);
                cell.signalBuffUntil = performance.now() + (behavior.visualMs || 700);
                count += 1;
            }
        });
        return count;
    }

    function markBurrowWarning(enemyCell, behavior) {
        const target = directions
            .map((direction) => helpers.getCell(game.player.q + direction.q, game.player.r + direction.r))
            .filter((cell) => cell && (cell.object === 'empty' || cell.object === 'burrowWarningCell') && !(cell.q === game.player.q && cell.r === game.player.r))
            .sort(() => helpers.seededRandom() - 0.5)[0];
        if (!target) return false;
        enemyCell.object = 'empty';
        enemyCell.hits = 0;
        enemyCell.nextAuraAt = 0;
        target.object = 'burrowWarningCell';
        target.revealed = true;
        target.emergeObject = 'burrowBeetle';
        target.emergeAt = performance.now() + (behavior.warningMs || 900);
        return true;
    }

    function markBomberCells(enemyCell, behavior) {
        let marked = 0;
        directions
            .map((direction) => helpers.getCell(game.player.q + direction.q, game.player.r + direction.r))
            .filter((cell) => cell && (cell.object === 'empty' || cell.object === behavior.object))
            .sort(() => helpers.seededRandom() - 0.5)
            .slice(0, 3)
            .forEach((cell) => {
                cell.object = behavior.object || 'bomberMarkedCell';
                cell.revealed = true;
                cell.detonateAt = performance.now() + (behavior.detonateMs || 1100);
                cell.detonateDamage = 1;
                marked += 1;
            });
        return marked;
    }

    return {
        getBehavior,
        hasBehavior,
        hasTimedThreat,
        handleTimedThreat
    };
}

window.HW_ENEMIES = {
    createEnemySystem
};
})();
