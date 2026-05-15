// Tactical combat turn orchestration helpers. Enemy-specific behavior still lives in enemies.js/index dispatch.
(() => {
function createTacticalCombat(context) {
    const {
        finalRoom,
        revealAroundPlayer,
        updateObjectiveProgress,
        resolveEnemyTurn,
        startPlayerTurn
    } = context;

    function endPlayerTurn(game, reason = 'action') {
        if (game.replay || game.ended || game.mode !== 'dungeon' || game.resolvingTurn) return false;
        game.resolvingTurn = true;
        game.metrics.turns += 1;
        if (game.roomDepth >= finalRoom) game.metrics.bossTurns += 1;
        if (reason === 'wait') game.metrics.turnsWithoutAction += 1;
        revealAroundPlayer();
        updateObjectiveProgress();
        resolveEnemyTurn(reason);
        if (!game.ended && game.mode === 'dungeon') {
            startPlayerTurn();
        }
        game.resolvingTurn = false;
        return true;
    }

    function getActionRange(game, cell, isEnemyObject, defaultRange) {
        return isEnemyObject(cell?.object) ? (game.player.attackRange || defaultRange) : 1;
    }

    return {
        endPlayerTurn,
        getActionRange
    };
}

window.HW_TACTICAL_COMBAT = {
    createTacticalCombat
};
})();
