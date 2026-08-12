// Wearable equipment metadata helpers.
(() => {
const EQUIPMENT_EFFECT_HANDLERS = {
    maxHealth(effect, { player }) {
        player.maxHealth += effect.amount;
        player.health = Math.min(player.maxHealth, player.health + effect.amount);
    },
    maxShield(effect, { player }) {
        player.maxShield += effect.amount;
    },
    attackRange(effect, { player }) {
        player.attackRange += effect.amount;
    },
    maxMovePoints(effect, { player, options }) {
        player.maxMovePoints += effect.amount;
        player.movePoints = player.maxMovePoints;
        options.onMovePointsChanged?.(player);
    }
};
const FUTURE_EQUIPMENT_EFFECT_TYPES = [
    'futureAttackRange',
    'futureHazardBlock',
    'futureMovePoint',
    'futureRevealHint',
    'futureRoomHoney'
];
const EQUIPMENT_EFFECT_TYPES = Object.freeze([
    ...Object.keys(EQUIPMENT_EFFECT_HANDLERS),
    ...FUTURE_EQUIPMENT_EFFECT_TYPES
]);
const EQUIPMENT_RARITY_WEIGHTS = Object.freeze({
    starter: 1,
    common: 8,
    rare: 4,
    epic: 2,
    legendary: 1
});
const EQUIPMENT_RARITY_ORDER = Object.freeze({
    starter: 0,
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4
});

function hasEquipmentEffectHandler(effectType) {
    return EQUIPMENT_EFFECT_TYPES.includes(effectType);
}

function getEquipmentRewardWeight(equipment) {
    return Math.max(0, Number(equipment.rewardWeight ?? EQUIPMENT_RARITY_WEIGHTS[equipment.rarity] ?? 1) || 0);
}

function createEquipmentSystem({ equipmentSlots, equipmentDefs }) {
    function createStartingEquipment() {
        return Object.fromEntries(equipmentSlots.map((slot) => [slot.id, null]));
    }

    function createStarterEquipment() {
        const loadout = createStartingEquipment();
        Object.values(equipmentDefs).forEach((equipment) => {
            if (equipment.rarity === 'starter' && loadout[equipment.slot] == null) {
                loadout[equipment.slot] = equipment.id;
            }
        });
        return loadout;
    }

    function getEquippedItems(loadout) {
        return Object.values(loadout || {})
            .filter(Boolean)
            .map((id) => equipmentDefs[id])
            .filter(Boolean);
    }

    function getAvailableEquipment(playerLevel = 1) {
        const level = Math.max(1, Math.floor(Number(playerLevel) || 1));
        return Object.values(equipmentDefs)
            .filter((equipment) => (equipment.minLevel || 1) <= level)
            .sort((a, b) => (
                (a.minLevel || 1) - (b.minLevel || 1)
                || (EQUIPMENT_RARITY_ORDER[a.rarity] ?? 99) - (EQUIPMENT_RARITY_ORDER[b.rarity] ?? 99)
                || a.slot.localeCompare(b.slot)
                || a.id.localeCompare(b.id)
            ));
    }

    function createEquipmentRewardChoices({
        playerLevel = 1,
        loadout = {},
        count = 3,
        rng = Math.random
    } = {}) {
        const equippedIds = new Set(Object.values(loadout || {}).filter(Boolean));
        const pool = getAvailableEquipment(playerLevel)
            .filter((equipment) => !equippedIds.has(equipment.id) && getEquipmentRewardWeight(equipment) > 0);
        const choices = [];
        const choiceCount = Math.max(0, Math.floor(Number(count) || 0));
        while (choices.length < choiceCount && pool.length > 0) {
            const totalWeight = pool.reduce((sum, equipment) => sum + getEquipmentRewardWeight(equipment), 0);
            const roll = Math.max(0, Math.min(0.999999, Number(rng()) || 0));
            let cursor = roll * totalWeight;
            let index = pool.length - 1;
            for (let i = 0; i < pool.length; i += 1) {
                cursor -= getEquipmentRewardWeight(pool[i]);
                if (cursor <= 0) {
                    index = i;
                    break;
                }
            }
            choices.push(pool.splice(index, 1)[0]);
        }
        return choices;
    }

    function getEquipmentChoiceDetails(loadout, equipmentId) {
        const equipment = equipmentDefs[equipmentId];
        if (!equipment) return null;
        const currentId = loadout?.[equipment.slot] || null;
        const current = currentId ? equipmentDefs[currentId] || null : null;
        return {
            equipment,
            slot: equipment.slot,
            current,
            currentId,
            isEmptySlot: !current,
            isEquipped: currentId === equipment.id,
            isReplacement: Boolean(current && current.id !== equipment.id)
        };
    }

    function equipItem(loadout, equipmentId) {
        const equipment = equipmentDefs[equipmentId];
        if (!equipment) return null;
        return {
            equipment,
            loadout: {
                ...createStartingEquipment(),
                ...(loadout || {}),
                [equipment.slot]: equipmentId
            }
        };
    }

    function applyLoadout(player, loadout, options = {}) {
        if (!player) return;
        player.equipment = { ...(loadout || {}) };
        getEquippedItems(loadout).forEach((equipment) => {
            equipment.effects?.forEach((effect) => {
                EQUIPMENT_EFFECT_HANDLERS[effect.type]?.(effect, { player, options });
            });
        });
    }

    return {
        applyLoadout,
        createEquipmentRewardChoices,
        createStarterEquipment,
        createStartingEquipment,
        getAvailableEquipment,
        getEquipmentChoiceDetails,
        getEquippedItems,
        equipItem
    };
}

window.HW_EQUIPMENT = {
    EQUIPMENT_EFFECT_TYPES,
    EQUIPMENT_RARITY_ORDER,
    EQUIPMENT_RARITY_WEIGHTS,
    createEquipmentSystem,
    hasEquipmentEffectHandler
};
})();
