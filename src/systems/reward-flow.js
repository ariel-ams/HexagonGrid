// Post-room reward sequencing helpers.
(() => {
function normalizeChoices(choices = []) {
    return (choices || []).filter(Boolean);
}

function normalizePositiveInteger(value, fallback = 1) {
    return Math.max(1, Math.floor(Number(value) || fallback));
}

function createRewardFlowSystem({ equipmentSystem } = {}) {
    function createRelicStep(relicChoices = []) {
        const choices = normalizeChoices(relicChoices);
        if (!choices.length) return null;
        return {
            id: 'relic',
            type: 'relic',
            available: true,
            count: choices.length,
            choices
        };
    }

    function createEquipmentStep(equipmentPlan) {
        if (!equipmentPlan?.available) return null;
        return {
            id: 'equipment',
            type: 'equipment',
            available: true,
            count: equipmentPlan.choices.length,
            choices: equipmentPlan.choices,
            plan: equipmentPlan
        };
    }

    function createPostRoomRewardPlan({
        roomDepth = 1,
        playerLevel = 1,
        loadout = {},
        relicChoices = [],
        equipmentOptions = {},
        language = 'en',
        rng = Math.random
    } = {}) {
        const equipmentPlan = equipmentSystem?.createEquipmentRewardPlan
            ? equipmentSystem.createEquipmentRewardPlan({
                roomDepth,
                playerLevel,
                loadout,
                language,
                rng,
                ...equipmentOptions
            })
            : {
                status: 'missingEquipmentSystem',
                available: false,
                choices: [],
                totalAvailable: 0
            };
        const steps = [
            createRelicStep(relicChoices),
            createEquipmentStep(equipmentPlan)
        ].filter(Boolean);

        return {
            roomDepth: normalizePositiveInteger(roomDepth),
            playerLevel: normalizePositiveInteger(playerLevel),
            hasRewards: steps.length > 0,
            steps,
            relic: {
                available: normalizeChoices(relicChoices).length > 0,
                count: normalizeChoices(relicChoices).length,
                choices: normalizeChoices(relicChoices)
            },
            equipment: equipmentPlan
        };
    }

    function getNextRewardStep(plan, completedStepIds = []) {
        const completed = new Set(completedStepIds || []);
        return (plan?.steps || []).find((step) => !completed.has(step.id)) || null;
    }

    return {
        createPostRoomRewardPlan,
        getNextRewardStep
    };
}

window.HW_REWARD_FLOW = {
    createRewardFlowSystem
};
})();
