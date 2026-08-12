// Wearable equipment metadata helpers.
(() => {
function createEquipmentSystem({ equipmentSlots, equipmentDefs }) {
    function createStartingEquipment() {
        return Object.fromEntries(equipmentSlots.map((slot) => [slot.id, null]));
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
                if (effect.type === 'maxHealth') {
                    player.maxHealth += effect.amount;
                    player.health = Math.min(player.maxHealth, player.health + effect.amount);
                }
                if (effect.type === 'maxShield') {
                    player.maxShield += effect.amount;
                }
                if (effect.type === 'attackRange') {
                    player.attackRange += effect.amount;
                }
                if (effect.type === 'maxMovePoints') {
                    player.maxMovePoints += effect.amount;
                    player.movePoints = player.maxMovePoints;
                    options.onMovePointsChanged?.(player);
                }
            });
        });
    }

    return {
        applyLoadout,
        createStartingEquipment,
        getEquippedItems,
        equipItem
    };
}

window.HW_EQUIPMENT = {
    createEquipmentSystem
};
})();
