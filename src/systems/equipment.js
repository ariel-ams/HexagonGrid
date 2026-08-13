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
const EQUIPMENT_RARITY_COPY = Object.freeze({
    starter: {
        en: { label: 'Starter' },
        'es-419': { label: 'Inicial' }
    },
    common: {
        en: { label: 'Common' },
        'es-419': { label: 'Comun' }
    },
    rare: {
        en: { label: 'Rare' },
        'es-419': { label: 'Raro' }
    },
    epic: {
        en: { label: 'Epic' },
        'es-419': { label: 'Epico' }
    },
    legendary: {
        en: { label: 'Legendary' },
        'es-419': { label: 'Legendario' }
    }
});
const EQUIPMENT_EFFECT_COPY = Object.freeze({
    maxHealth: {
        en: { label: '+{amount} max health', description: 'Raises the bee health limit.' },
        'es-419': { label: '+{amount} salud max.', description: 'Aumenta el limite de salud de la abeja.' }
    },
    maxShield: {
        en: { label: '+{amount} max shield', description: 'Raises the bee shield limit.' },
        'es-419': { label: '+{amount} escudo max.', description: 'Aumenta el limite de escudo de la abeja.' }
    },
    attackRange: {
        en: { label: '+{amount} attack range', description: 'Lets the bee sting from farther away.' },
        'es-419': { label: '+{amount} alcance', description: 'Permite atacar desde mas lejos.' }
    },
    maxMovePoints: {
        en: { label: '+{amount} movement', description: 'Adds movement points each turn.' },
        'es-419': { label: '+{amount} movimiento', description: 'Suma puntos de movimiento por turno.' }
    },
    futureAttackRange: {
        en: { label: 'Future attack +{amount}', description: 'Reserved for future sting upgrade rules.' },
        'es-419': { label: 'Ataque futuro +{amount}', description: 'Reservado para futuras reglas del aguijon.' }
    },
    futureHazardBlock: {
        en: { label: 'Future hazard block +{amount}', description: 'Reserved for future hazard defense rules.' },
        'es-419': { label: 'Bloqueo futuro +{amount}', description: 'Reservado para futuras defensas contra peligros.' }
    },
    futureMovePoint: {
        en: { label: 'Future movement +{amount}', description: 'Reserved for future route-control rules.' },
        'es-419': { label: 'Movimiento futuro +{amount}', description: 'Reservado para futuras reglas de rutas.' }
    },
    futureRevealHint: {
        en: { label: 'Future reveal +{amount}', description: 'Reserved for future room-reading rules.' },
        'es-419': { label: 'Revelado futuro +{amount}', description: 'Reservado para futuras reglas de exploracion.' }
    },
    futureRoomHoney: {
        en: { label: 'Future honey +{amount}', description: 'Reserved for future room resource rules.' },
        'es-419': { label: 'Miel futura +{amount}', description: 'Reservado para futuras reglas de recursos.' }
    }
});
const EQUIPMENT_REWARD_OFFER_COPY = Object.freeze({
    available: {
        en: { label: 'Gear reward ready', description: 'Choose one piece of wearable gear.' },
        'es-419': { label: 'Recompensa lista', description: 'Elige una pieza de equipo.' }
    },
    noChoices: {
        en: { label: 'No gear choices', description: 'There is no new gear available for this level yet.' },
        'es-419': { label: 'Sin opciones de equipo', description: 'Todavia no hay equipo nuevo para este nivel.' }
    }
});

function hasEquipmentEffectHandler(effectType) {
    return EQUIPMENT_EFFECT_TYPES.includes(effectType);
}

function getEquipmentRewardWeight(equipment) {
    return Math.max(0, Number(equipment.rewardWeight ?? EQUIPMENT_RARITY_WEIGHTS[equipment.rarity] ?? 1) || 0);
}

function formatEquipmentEffectText(template, effect) {
    return String(template || '').replaceAll('{amount}', effect.amount);
}

function getEquipmentEffectCopy(effect, language = 'en') {
    const copy = EQUIPMENT_EFFECT_COPY[effect.type] || {};
    const localized = copy[language] || copy.en || {};
    return {
        label: formatEquipmentEffectText(localized.label || `${effect.type} +{amount}`, effect),
        description: formatEquipmentEffectText(localized.description || '', effect)
    };
}

function getEquipmentRarityLabel(rarity, language = 'en') {
    const copy = EQUIPMENT_RARITY_COPY[rarity] || {};
    return (copy[language] || copy.en || {}).label || rarity;
}

function getEquipmentRewardOfferCopy(status, language = 'en') {
    const copy = EQUIPMENT_REWARD_OFFER_COPY[status] || EQUIPMENT_REWARD_OFFER_COPY.noChoices;
    return copy[language] || copy.en;
}

function localizeEquipmentContent(entity, language = 'en') {
    if (!entity) return null;
    const localized = entity.i18n?.[language] || entity.i18n?.en || {};
    return {
        ...entity,
        name: localized.name || entity.name,
        description: localized.description || entity.description
    };
}

function createEquipmentSystem({ equipmentSlots, equipmentDefs }) {
    const slotDefs = new Map(equipmentSlots.map((slot) => [slot.id, slot]));

    function createEquipmentEffectSummaries(equipment, { language = 'en' } = {}) {
        return (equipment?.effects || []).map((effect) => ({
            type: effect.type,
            amount: effect.amount,
            ...getEquipmentEffectCopy(effect, language),
            isActive: Boolean(EQUIPMENT_EFFECT_HANDLERS[effect.type]),
            isFuture: !EQUIPMENT_EFFECT_HANDLERS[effect.type]
        }));
    }

    function createEquipmentEffectTotals(loadout = {}, { language = 'en' } = {}) {
        const totals = new Map();
        getEquippedItems(loadout).forEach((equipment) => {
            equipment.effects?.forEach((effect) => {
                const current = totals.get(effect.type) || {
                    type: effect.type,
                    amount: 0,
                    itemIds: [],
                    itemNames: [],
                    isActive: Boolean(EQUIPMENT_EFFECT_HANDLERS[effect.type]),
                    isFuture: !EQUIPMENT_EFFECT_HANDLERS[effect.type]
                };
                current.amount += effect.amount;
                current.itemIds.push(equipment.id);
                current.itemNames.push(localizeEquipmentContent(equipment, language).name);
                totals.set(effect.type, current);
            });
        });
        return Array.from(totals.values())
            .map((effect) => ({
                ...effect,
                ...getEquipmentEffectCopy(effect, language)
            }))
            .sort((a, b) => a.type.localeCompare(b.type));
    }

    function createEquipmentEffectDeltas(loadout = {}, equipmentId, { language = 'en' } = {}) {
        const equipped = equipItem(loadout, equipmentId);
        if (!equipped) return null;
        const beforeTotals = createEquipmentEffectTotals(loadout, { language });
        const afterTotals = createEquipmentEffectTotals(equipped.loadout, { language });
        const beforeByType = new Map(beforeTotals.map((effect) => [effect.type, effect]));
        const afterByType = new Map(afterTotals.map((effect) => [effect.type, effect]));
        const effectTypes = new Set([...beforeByType.keys(), ...afterByType.keys()]);
        return Array.from(effectTypes)
            .map((type) => {
                const before = beforeByType.get(type) || null;
                const after = afterByType.get(type) || null;
                const beforeAmount = before?.amount || 0;
                const afterAmount = after?.amount || 0;
                const delta = afterAmount - beforeAmount;
                const copySource = after || before || { type, amount: Math.abs(delta) };
                return {
                    type,
                    beforeAmount,
                    afterAmount,
                    delta,
                    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same',
                    beforeItemIds: before?.itemIds || [],
                    afterItemIds: after?.itemIds || [],
                    beforeItemNames: before?.itemNames || [],
                    afterItemNames: after?.itemNames || [],
                    label: copySource.label,
                    description: copySource.description,
                    isActive: Boolean(EQUIPMENT_EFFECT_HANDLERS[type]),
                    isFuture: !EQUIPMENT_EFFECT_HANDLERS[type],
                    changed: delta !== 0
                };
            })
            .sort((a, b) => (
                Number(b.changed) - Number(a.changed)
                || Math.abs(b.delta) - Math.abs(a.delta)
                || a.type.localeCompare(b.type)
            ));
    }

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

    function getLocalizedSlot(slotId, language = 'en') {
        return localizeEquipmentContent(slotDefs.get(slotId), language);
    }

    function getLocalizedEquipment(equipmentId, language = 'en') {
        return localizeEquipmentContent(equipmentDefs[equipmentId], language);
    }

    function getLocalizedRarity(rarity, language = 'en') {
        return {
            id: rarity,
            rank: EQUIPMENT_RARITY_ORDER[rarity] ?? 99,
            label: getEquipmentRarityLabel(rarity, language),
            rewardWeight: EQUIPMENT_RARITY_WEIGHTS[rarity] ?? 1
        };
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

    function hasEquipmentRewardsAvailable({ playerLevel = 1, loadout = {} } = {}) {
        return getEquipmentRewardPool({ playerLevel, loadout }).length > 0;
    }

    function getEquipmentRewardPool({ playerLevel = 1, loadout = {} } = {}) {
        const equippedIds = new Set(Object.values(loadout || {}).filter(Boolean));
        return getAvailableEquipment(playerLevel)
            .filter((equipment) => !equippedIds.has(equipment.id) && getEquipmentRewardWeight(equipment) > 0);
    }

    function createEquipmentRewardChoices({
        playerLevel = 1,
        loadout = {},
        count = 3,
        rng = Math.random
    } = {}) {
        const pool = getEquipmentRewardPool({ playerLevel, loadout });
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

    function getEquipmentChoiceDetails(loadout, equipmentId, { language = 'en' } = {}) {
        const equipment = equipmentDefs[equipmentId];
        if (!equipment) return null;
        const currentId = loadout?.[equipment.slot] || null;
        const current = currentId ? equipmentDefs[currentId] || null : null;
        return {
            equipment: localizeEquipmentContent(equipment, language),
            slot: equipment.slot,
            slotDef: getLocalizedSlot(equipment.slot, language),
            rarity: equipment.rarity,
            rarityDef: getLocalizedRarity(equipment.rarity, language),
            rarityLabel: getEquipmentRarityLabel(equipment.rarity, language),
            rarityRank: EQUIPMENT_RARITY_ORDER[equipment.rarity] ?? 99,
            rewardWeight: getEquipmentRewardWeight(equipment),
            effects: createEquipmentEffectSummaries(equipment, { language }),
            effectDeltas: createEquipmentEffectDeltas(loadout, equipment.id, { language }),
            current: localizeEquipmentContent(current, language),
            currentEffects: createEquipmentEffectSummaries(current, { language }),
            currentId,
            isEmptySlot: !current,
            isEquipped: currentId === equipment.id,
            isReplacement: Boolean(current && current.id !== equipment.id)
        };
    }

    function createEquipmentLoadoutDetails(loadout = {}, { language = 'en' } = {}) {
        return equipmentSlots.map((slot) => {
            const equipmentId = loadout?.[slot.id] || null;
            const equipment = equipmentId ? equipmentDefs[equipmentId] || null : null;
            return {
                slot: slot.id,
                slotDef: getLocalizedSlot(slot.id, language),
                equipment: localizeEquipmentContent(equipment, language),
                equipmentId: equipment?.id || null,
                rarity: equipment?.rarity || null,
                rarityDef: equipment ? getLocalizedRarity(equipment.rarity, language) : null,
                rarityLabel: equipment ? getEquipmentRarityLabel(equipment.rarity, language) : null,
                effects: createEquipmentEffectSummaries(equipment, { language }),
                isEmpty: !equipment
            };
        });
    }

    function createEquipmentRewardChoiceDetails(options = {}) {
        const loadout = options.loadout || {};
        return createEquipmentRewardChoices(options)
            .map((equipment) => getEquipmentChoiceDetails(loadout, equipment.id, options))
            .filter(Boolean);
    }

    function createEquipmentRewardOffer(options = {}) {
        const {
            language = 'en',
            playerLevel = 1,
            loadout = {},
            count = 3
        } = options;
        const choices = createEquipmentRewardChoiceDetails(options);
        const status = choices.length > 0 ? 'available' : 'noChoices';
        return {
            status,
            available: choices.length > 0,
            playerLevel: Math.max(1, Math.floor(Number(playerLevel) || 1)),
            requestedCount: Math.max(0, Math.floor(Number(count) || 0)),
            totalAvailable: getEquipmentRewardPool({ playerLevel, loadout }).length,
            choices,
            ...getEquipmentRewardOfferCopy(status, language)
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

    function selectEquipmentReward(loadout, equipmentId, options = {}) {
        const details = getEquipmentChoiceDetails(loadout, equipmentId, options);
        if (!details || details.isEquipped) return null;
        const result = equipItem(loadout, equipmentId);
        if (!result) return null;
        return {
            ...details,
            loadout: result.loadout
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
        createEquipmentEffectDeltas,
        createEquipmentEffectSummaries,
        createEquipmentEffectTotals,
        createEquipmentLoadoutDetails,
        createEquipmentRewardOffer,
        createEquipmentRewardChoiceDetails,
        createEquipmentRewardChoices,
        createStarterEquipment,
        createStartingEquipment,
        getAvailableEquipment,
        getEquipmentChoiceDetails,
        getEquippedItems,
        getLocalizedEquipment,
        getLocalizedRarity,
        getLocalizedSlot,
        hasEquipmentRewardsAvailable,
        equipItem,
        selectEquipmentReward
    };
}

window.HW_EQUIPMENT = {
    EQUIPMENT_EFFECT_COPY,
    EQUIPMENT_REWARD_OFFER_COPY,
    EQUIPMENT_RARITY_COPY,
    EQUIPMENT_EFFECT_TYPES,
    EQUIPMENT_RARITY_ORDER,
    EQUIPMENT_RARITY_WEIGHTS,
    createEquipmentSystem,
    hasEquipmentEffectHandler
};
})();
