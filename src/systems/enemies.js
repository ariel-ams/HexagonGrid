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

    return {
        hasBehavior,
        hasTimedThreat,
        handleTimedThreat
    };
}

window.HW_ENEMIES = {
    createEnemySystem
};
})();
