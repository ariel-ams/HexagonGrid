// Shared camp and trader-market action data helpers.
(() => {
function createCampMarketController(context) {
    const { getText, getPlayerLevel } = context;

    const ACTIONS = [
        { id: 'heal', market: true, minLevel: 1 },
        { id: 'shield', market: true, minLevel: 1 },
        { id: 'map', market: true, minLevel: 2 },
        { id: 'guard', market: true, minLevel: 2 },
        { id: 'scout', market: true, minLevel: 3 },
        { id: 'rush', market: true, minLevel: 3 },
        { id: 'reroll', market: false, minLevel: 99 }
    ];

    function getActions(state) {
        const missingHealth = Math.max(0, state.maxHealth - state.health);
        const missingShield = Math.max(0, state.maxShield - state.shield);
        return ACTIONS.map((action) => ({
            ...action,
            ...getText(action.id),
            available: isAvailable(action.id, state, missingHealth, missingShield)
        }));
    }

    function getMarketChoices(actions, random) {
        const unlocked = actions.filter((action) => action.market && getPlayerLevel() >= action.minLevel);
        const available = unlocked.filter((action) => action.available);
        const pool = available.length >= 3 ? available : unlocked;
        return [...pool].sort(() => random() - 0.5).slice(0, 3);
    }

    function isAvailable(id, state, missingHealth, missingShield) {
        if (id === 'heal') return state.water > 0 && missingHealth > 0;
        if (id === 'shield') return state.pollen > 0 && missingShield > 0;
        if (id === 'map') return state.honey > 0;
        if (id === 'guard') return state.pollen > 0 && state.water > 0;
        if (id === 'scout') return state.roomDepth >= 2 && state.pollen > 0 && state.water > 0;
        if (id === 'rush') return state.roomDepth >= 2 && state.honey > 0;
        if (id === 'reroll') return state.honey > 0;
        return false;
    }

    return {
        getActions,
        getMarketChoices
    };
}

window.HW_CAMP_MARKET = {
    createCampMarketController
};
})();
