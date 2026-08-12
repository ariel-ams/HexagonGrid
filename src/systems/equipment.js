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

    return {
        createStartingEquipment,
        getEquippedItems,
        equipItem
    };
}

window.HW_EQUIPMENT = {
    createEquipmentSystem
};
})();
