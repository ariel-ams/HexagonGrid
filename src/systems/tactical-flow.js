// Small tactical action-economy helpers shared by dungeon input and turn flow.
(() => {
function createTacticalFlow(config) {
    const { startMovePoints, startAttackRange } = config;

    function createPlayerState(overrides = {}) {
        const maxMovePoints = overrides.maxMovePoints ?? startMovePoints;
        return {
            movePoints: overrides.movePoints ?? maxMovePoints,
            maxMovePoints,
            actionAvailable: overrides.actionAvailable ?? true,
            attackRange: overrides.attackRange ?? startAttackRange,
            stamina: overrides.stamina ?? maxMovePoints,
            maxStamina: overrides.maxStamina ?? maxMovePoints
        };
    }

    function startTurn(player) {
        player.movePoints = player.maxMovePoints ?? startMovePoints;
        player.actionAvailable = true;
        syncLegacyStamina(player);
    }

    function syncLegacyStamina(player) {
        player.maxStamina = player.maxMovePoints ?? startMovePoints;
        player.stamina = player.movePoints ?? player.maxStamina;
    }

    function spendMovePoints(player, amount) {
        const cost = Math.max(0, amount);
        if ((player.movePoints ?? 0) < cost) return false;
        player.movePoints -= cost;
        syncLegacyStamina(player);
        return true;
    }

    function consumeAction(game, reason = 'action') {
        if (!game.player.actionAvailable) return false;
        game.player.actionAvailable = false;
        if (game.metrics) {
            game.metrics.lastAction = {
                reason,
                turn: game.metrics.turns,
                q: game.player.q,
                r: game.player.r
            };
        }
        return true;
    }

    return {
        createPlayerState,
        consumeAction,
        spendMovePoints,
        startTurn,
        syncLegacyStamina
    };
}

window.HW_TACTICAL_FLOW = {
    createTacticalFlow
};
})();
