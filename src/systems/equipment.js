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

function hasEquipmentEffectHandler(effectType) {
    return EQUIPMENT_EFFECT_TYPES.includes(effectType);
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
        createStarterEquipment,
        createStartingEquipment,
        getEquippedItems,
        equipItem
    };
}

window.HW_EQUIPMENT = {
    EQUIPMENT_EFFECT_TYPES,
    createEquipmentSystem,
    hasEquipmentEffectHandler
};
})();
