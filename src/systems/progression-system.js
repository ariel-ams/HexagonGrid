// Progression persistence and level math for Honeycomb Wayfinder.
(() => {
function createProgressionSystem(options = {}) {
    const {
        storageKey,
        baseXpToLevel,
        storage = window.localStorage
    } = options;

    function createDefaultProgression() {
        return {
            lifetimePollen: 0,
            lifetimeHoney: 0,
            xp: 0,
            level: 1,
            bestRoom: 1,
            encyclopedia: [],
            tutorialsSeen: []
        };
    }

    function load() {
        try {
            return {
                ...createDefaultProgression(),
                ...JSON.parse(storage.getItem(storageKey) || '{}')
            };
        } catch {
            return createDefaultProgression();
        }
    }

    function save(progression) {
        storage.setItem(storageKey, JSON.stringify(progression));
    }

    function reset() {
        const progression = createDefaultProgression();
        save(progression);
        return progression;
    }

    function getPlayerLevel(progression) {
        return Math.max(1, Number(progression?.level) || 1);
    }

    function getXpForNextLevel(level = 1) {
        return Math.round(baseXpToLevel + Math.pow(level, 1.7) * 18);
    }

    function awardXp(progression, amount, callbacks = {}) {
        if (!amount || amount <= 0) return { leveled: false, levelsGained: 0 };
        progression.xp = Math.max(0, (progression.xp || 0) + amount);
        let levelsGained = 0;
        while (progression.xp >= getXpForNextLevel(getPlayerLevel(progression))) {
            progression.xp -= getXpForNextLevel(getPlayerLevel(progression));
            progression.level = getPlayerLevel(progression) + 1;
            levelsGained += 1;
            callbacks.onLevelUp?.(progression.level);
        }
        save(progression);
        return { leveled: levelsGained > 0, levelsGained };
    }

    return {
        createDefaultProgression,
        load,
        save,
        reset,
        getPlayerLevel,
        getXpForNextLevel,
        awardXp
    };
}

window.HW_PROGRESSION_SYSTEM = {
    createProgressionSystem
};
})();
