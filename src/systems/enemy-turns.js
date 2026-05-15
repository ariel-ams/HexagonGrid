// Turn-order dispatcher for enemies. Individual behavior implementations remain owned by the game runtime/systems.
(() => {
function createEnemyTurns(steps) {
    function resolve(reason = 'action') {
        steps.updateSleepingEnemies();
        steps.moveBats();
        steps.moveMites();
        steps.moveMirrorWasps();
        steps.resolveTurnEnemyPressure();
        steps.tickSpecialEnemyTelegraphs();
        steps.resolveBossAntiKite(reason);
    }

    return { resolve };
}

window.HW_ENEMY_TURNS = {
    createEnemyTurns
};
})();
