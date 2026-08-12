const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sandbox = {
    window: {},
    console
};
sandbox.window.window = sandbox.window;

function runBrowserScript(relativePath) {
    const absolutePath = path.join(root, relativePath);
    const code = fs.readFileSync(absolutePath, 'utf8');
    vm.runInNewContext(code, sandbox, { filename: relativePath });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertFile(relativePath) {
    assert(fs.existsSync(path.join(root, relativePath)), `Missing asset: ${relativePath}`);
}

runBrowserScript('src/data/content.js');
runBrowserScript('src/data/art.js');
runBrowserScript('src/data/progression.js');
runBrowserScript('src/systems/run-summary.js');
runBrowserScript('src/systems/equipment.js');
runBrowserScript('src/systems/cell-interactions.js');
runBrowserScript('src/systems/items.js');
runBrowserScript('src/systems/enemies.js');
runBrowserScript('src/systems/inspect-stats.js');
runBrowserScript('src/systems/room-templates.js');

const { HW_CONTENT, HW_ART, HW_PROGRESSION } = sandbox.window;
const languageIds = ['en', 'es-419'];
const resourceIds = new Set(['pollen', 'water', 'honey', 'stingCharges']);
const relicRarities = new Set(['common', 'rare', 'epic', 'legendary']);
const relicHooks = new Set(['apply', 'onRoomStart']);
const finalRoomDepth = 5;
const relicChoiceCount = 3;
const equipmentRarities = new Set(['starter', 'common', 'rare', 'epic', 'legendary']);
const equipmentEffectTypes = sandbox.window.HW_EQUIPMENT.EQUIPMENT_EFFECT_TYPES || [];
const roomWeightTokens = new Set(['discovery']);
const roomTemplateKeys = new Set([
    'minLevel',
    'random',
    'requiredObjects',
    'requiredEnemies',
    'synergyEnemies'
]);

assert(HW_CONTENT?.OBJECTS, 'HW_CONTENT.OBJECTS was not registered');
assert(HW_CONTENT?.SPRITE_DEFS, 'HW_CONTENT.SPRITE_DEFS was not registered');
assert(HW_ART?.UI_ART_DEFS, 'HW_ART.UI_ART_DEFS was not registered');
assert(HW_ART?.TILE_ART_DEFS, 'HW_ART.TILE_ART_DEFS was not registered');
assert(HW_ART?.THEME_TILE_SHEET_DEFS, 'HW_ART.THEME_TILE_SHEET_DEFS was not registered');
assert(HW_ART?.HUD_ICON_ROWS, 'HW_ART.HUD_ICON_ROWS was not registered');
assert(HW_PROGRESSION?.ROOM_PROFILES?.length >= 5, 'Expected at least 5 room profiles');
assert(HW_PROGRESSION?.XP_REWARDS?.room > 0, 'Room XP reward must be positive');
assert(HW_PROGRESSION?.DUNGEON_THEMES?.forest, 'Expected dungeon theme definitions');
assert(HW_CONTENT?.EQUIPMENT_SLOTS?.length >= 5, 'Expected wearable equipment slots');
assert(HW_CONTENT?.EQUIPMENT_DEFS, 'Expected wearable equipment definitions');
assert(sandbox.window.HW_RUN_SUMMARY?.createRunSummarySystem, 'Expected run summary system');
assert(sandbox.window.HW_EQUIPMENT?.createEquipmentSystem, 'Expected equipment system');
assert(sandbox.window.HW_EQUIPMENT?.hasEquipmentEffectHandler, 'Expected equipment effect metadata');
assert(sandbox.window.HW_CELL_INTERACTIONS?.createCellInteractionSystem, 'Expected cell interaction system');
assert(sandbox.window.HW_ITEMS?.hasItemEffectHandler, 'Expected item effect handler metadata');
assert(sandbox.window.HW_ENEMIES?.hasEnemyBehaviorHandler, 'Expected enemy behavior handler metadata');
assert(sandbox.window.HW_INSPECT_STATS?.createInspectStatsSystem, 'Expected inspect stats system');
assert(sandbox.window.HW_ROOM_TEMPLATES?.ROOM_OBJECTIVES, 'Expected room objective metadata');
assert(sandbox.window.HW_ROOM_TEMPLATES?.ROOM_TEMPLATE_DEFS, 'Expected room template metadata');

Object.values(HW_ART.UI_ART_DEFS).forEach(assertFile);
Object.values(HW_ART.TILE_ART_DEFS).forEach(assertFile);
Object.values(HW_ART.THEME_TILE_SHEET_DEFS).forEach(assertFile);
assertFile('assets/ui/alpha/hud-icons.png');

const hudRows = Object.values(HW_ART.HUD_ICON_ROWS);
hudRows.forEach((row) => {
    assert(Number.isInteger(row) && row >= 0 && row <= 12, `HUD icon row out of range: ${row}`);
});

HW_PROGRESSION.ROOM_PROFILES.forEach((profile, index) => {
    assert(profile.depth === index + 1, `Room profile depth mismatch at index ${index}`);
    assert(profile.targetCells > 0, `Room ${profile.depth} must have targetCells`);
    assert(profile.itemWeights?.length, `Room ${profile.depth} must have itemWeights`);
    assert(Array.isArray(profile.allowedEnemies), `Room ${profile.depth} needs allowedEnemies`);
    assert(Array.isArray(profile.allowedDiscovery), `Room ${profile.depth} needs allowedDiscovery`);
    assert(Array.isArray(profile.allowedUtility), `Room ${profile.depth} needs allowedUtility`);
    profile.allowedEnemies.forEach((enemyId) => {
        assert(HW_CONTENT.ENEMY_DEFS[enemyId], `Room ${profile.depth} allowedEnemies references missing enemy ${enemyId}`);
    });
    [...profile.allowedDiscovery, ...profile.allowedUtility].forEach((objectId) => {
        assert(HW_CONTENT.OBJECTS[objectId], `Room ${profile.depth} allowed item list references missing object ${objectId}`);
    });
    profile.itemWeights.forEach((entry) => {
        assert(entry.weight > 0, `Room ${profile.depth} has non-positive weight for ${entry.object}`);
        assert(HW_CONTENT.OBJECTS[entry.object] || roomWeightTokens.has(entry.object), `Room ${profile.depth} itemWeights references missing object/token ${entry.object}`);
    });
});

HW_CONTENT.DISCOVERY_OBJECT_WEIGHTS.forEach((entry) => {
    assert(HW_CONTENT.OBJECTS[entry.object], `Discovery weights reference missing object ${entry.object}`);
    assert(entry.weight > 0, `Discovery weights have non-positive weight for ${entry.object}`);
});

HW_CONTENT.ENEMY_SPAWN_WEIGHTS.forEach((entry) => {
    assert(HW_CONTENT.ENEMY_DEFS[entry.object], `Enemy spawn weights reference missing enemy ${entry.object}`);
    assert(Number.isInteger(entry.minDepth) && entry.minDepth >= 1, `Enemy spawn weight ${entry.object} needs positive integer minDepth`);
    assert(entry.weight > 0, `Enemy spawn weights have non-positive weight for ${entry.object}`);
    const appearsInEligibleProfile = HW_PROGRESSION.ROOM_PROFILES.some((profile) => (
        profile.depth >= entry.minDepth && profile.allowedEnemies.includes(entry.object)
    ));
    assert(appearsInEligibleProfile, `Enemy spawn weight ${entry.object} is not allowed by any eligible room profile`);
});

const roomObjectiveIds = new Set();
sandbox.window.HW_ROOM_TEMPLATES.ROOM_OBJECTIVES.forEach((objective) => {
    assert(objective.id && !roomObjectiveIds.has(objective.id), `Room objective ${objective.id || '(missing id)'} needs a unique id`);
    roomObjectiveIds.add(objective.id);
    assert(Number.isInteger(objective.minDepth) && objective.minDepth >= 1, `Room objective ${objective.id} needs a positive integer minDepth`);
    assert(typeof objective.isComplete === 'function', `Room objective ${objective.id} needs an isComplete function`);
    languageIds.forEach((language) => {
        assert(objective.label?.[language]?.trim(), `Room objective ${objective.id} needs ${language} label text`);
        assert(objective.hint?.[language]?.trim(), `Room objective ${objective.id} needs ${language} hint text`);
    });
});

Object.entries(sandbox.window.HW_ROOM_TEMPLATES.ROOM_TEMPLATE_DEFS).forEach(([templateId, template]) => {
    Object.keys(template).forEach((key) => {
        assert(roomTemplateKeys.has(key), `Room template ${templateId} uses unsupported metadata key ${key}`);
    });
    assert(Number.isInteger(template.minLevel) && template.minLevel >= 1, `Room template ${templateId} needs a positive integer minLevel`);
    if (template.random != null) {
        assert(typeof template.random === 'boolean', `Room template ${templateId} random must be boolean`);
    }
    ['requiredObjects', 'requiredEnemies', 'synergyEnemies'].forEach((listName) => {
        if (template[listName] != null) {
            assert(Array.isArray(template[listName]), `Room template ${templateId} ${listName} must be an array`);
        }
    });
    if (template.random) {
        const hasRequiredContent = Boolean(
            template.requiredObjects?.length
            || template.requiredEnemies?.length
            || template.synergyEnemies?.length
        );
        assert(hasRequiredContent, `Random room template ${templateId} needs required or synergy content metadata`);
        const requiredContent = [
            ...(template.requiredObjects || []),
            ...(template.requiredEnemies || []),
            ...(template.synergyEnemies || [])
        ];
        requiredContent.forEach((objectId) => {
            const unlockLevel = HW_PROGRESSION.OBJECT_UNLOCK_LEVELS[objectId] || 1;
            assert(unlockLevel <= template.minLevel, `Room template ${templateId} unlocks at level ${template.minLevel} before required content ${objectId} at level ${unlockLevel}`);
        });
        const compatibleTheme = Object.values(HW_PROGRESSION.DUNGEON_THEMES)
            .find((theme) => requiredContent.every((objectId) => isTemplateObjectAllowedByTheme(theme, objectId)));
        assert(compatibleTheme, `Random room template ${templateId} has no compatible dungeon theme for its required content`);
    }
    template.requiredObjects?.forEach((objectId) => {
        assert(HW_CONTENT.OBJECTS[objectId], `Room template ${templateId} references missing object ${objectId}`);
    });
    [...(template.requiredEnemies || []), ...(template.synergyEnemies || [])].forEach((enemyId) => {
        assert(HW_CONTENT.ENEMY_DEFS[enemyId], `Room template ${templateId} references missing enemy ${enemyId}`);
        assert(HW_CONTENT.OBJECTS[enemyId], `Room template ${templateId} enemy ${enemyId} needs a matching object`);
    });
});

Object.entries(HW_PROGRESSION.DUNGEON_THEMES).forEach(([themeId, theme]) => {
    ['enemies', 'items', 'hazards'].forEach((listName) => {
        assert(Array.isArray(theme[listName]), `Theme ${themeId} is missing ${listName}`);
        theme[listName].forEach((objectId) => {
            assert(HW_CONTENT.OBJECTS[objectId] || HW_CONTENT.ENEMY_DEFS[objectId], `Theme ${themeId} references missing object ${objectId}`);
            assert(HW_PROGRESSION.OBJECT_UNLOCK_LEVELS[objectId], `Theme ${themeId} references ${objectId} without an unlock level`);
        });
    });
    ['pollen', 'water', 'upgrade'].forEach((objectId) => {
        assert(theme.items.includes(objectId), `Theme ${themeId} must include core supply ${objectId}`);
    });
    if (theme.boardBackground) assertFile(theme.boardBackground);

    HW_PROGRESSION.ROOM_PROFILES
        .filter((profile) => profile.depth >= 3 && profile.maxEnemies > 0)
        .forEach((profile) => {
            const eligibleEnemies = theme.enemies.filter((enemyId) => {
                const unlockLevel = HW_PROGRESSION.OBJECT_UNLOCK_LEVELS[enemyId];
                return unlockLevel <= profile.depth && profile.allowedEnemies.includes(enemyId);
            });
            assert(eligibleEnemies.length > 0, `Theme ${themeId} has no eligible enemy for room depth ${profile.depth}`);
        });

    const compatibleRandomTemplates = Object.entries(sandbox.window.HW_ROOM_TEMPLATES.ROOM_TEMPLATE_DEFS)
        .filter(([, template]) => template.random)
        .filter(([, template]) => {
            const requiredContent = [
                ...(template.requiredObjects || []),
                ...(template.requiredEnemies || []),
                ...(template.synergyEnemies || [])
            ];
            return requiredContent.every((objectId) => isTemplateObjectAllowedByTheme(theme, objectId));
        });
    assert(compatibleRandomTemplates.length > 0, `Theme ${themeId} has no compatible random room template`);
});

function assertLocalizedTuple(section, id, expectedLength = 2) {
    languageIds.forEach((language) => {
        const value = HW_CONTENT.I18N?.[language]?.[section]?.[id];
        assert(Array.isArray(value), `${language}.${section}.${id} must be localized`);
        assert(value.length >= expectedLength, `${language}.${section}.${id} must have at least ${expectedLength} text entries`);
        value.slice(0, expectedLength).forEach((text, index) => {
            assert(typeof text === 'string' && text.trim(), `${language}.${section}.${id}[${index}] must be readable text`);
        });
    });
}

function assertBehaviorPayload(enemyId, behavior) {
    const object = behavior.object;
    if (behavior.type === 'spawnEnemyAura') {
        assert(object && HW_CONTENT.ENEMY_DEFS[object], `Enemy ${enemyId} ${behavior.type} must reference a valid enemy object`);
        return;
    }
    if (behavior.type === 'spawnTerrainAura' || behavior.type === 'markCellsAura' || behavior.type === 'chargeLane') {
        assert(object && HW_CONTENT.OBJECTS[object], `Enemy ${enemyId} ${behavior.type} must reference a valid terrain/effect object`);
        return;
    }
    if (behavior.type === 'disguiseAs') {
        assert(object && HW_CONTENT.OBJECTS[object], `Enemy ${enemyId} ${behavior.type} must reference a valid disguise object`);
    }
}

function assertPositiveNumber(value, message) {
    assert(Number.isFinite(value) && value > 0, message);
}

function assertNonNegativeNumber(value, message) {
    assert(Number.isFinite(value) && value >= 0, message);
}

function assertItemEffectPayload(objectId, effect) {
    if (effect.type === 'gainResource') {
        assert(resourceIds.has(effect.resource), `Object ${objectId} gainResource must use a known resource`);
        assertPositiveNumber(effect.amount, `Object ${objectId} gainResource amount must be positive`);
        return;
    }
    if (effect.type === 'gainShield' || effect.type === 'heal') {
        assertPositiveNumber(effect.amount, `Object ${objectId} ${effect.type} amount must be positive`);
        return;
    }
    if (effect.type === 'revealAround') {
        assertPositiveNumber(effect.radius, `Object ${objectId} revealAround radius must be positive`);
        return;
    }
    if (effect.type === 'pauseEnemyTimers' || effect.type === 'slowNearbyEnemies') {
        assertPositiveNumber(effect.durationMs, `Object ${objectId} ${effect.type} durationMs must be positive`);
        assertNonNegativeNumber(effect.radius, `Object ${objectId} ${effect.type} radius must be non-negative`);
        return;
    }
    if (effect.type === 'transformCell') {
        assert(effect.object && HW_CONTENT.OBJECTS[effect.object], `Object ${objectId} transformCell must reference a valid object`);
        return;
    }
    if (effect.type === 'royalNectar') {
        assertPositiveNumber(effect.heal, `Object ${objectId} royalNectar heal must be positive`);
        return;
    }
    if (effect.type === 'tradeCooldown') {
        assertNonNegativeNumber(effect.pollen, `Object ${objectId} tradeCooldown pollen cost must be non-negative`);
        assertNonNegativeNumber(effect.water, `Object ${objectId} tradeCooldown water cost must be non-negative`);
        if (effect.attackRange != null) {
            assertPositiveNumber(effect.attackRange, `Object ${objectId} tradeCooldown attackRange must be positive`);
        }
    }
}

function isTemplateObjectAllowedByTheme(theme, objectId) {
    if (['empty', 'entry', 'exit', 'finalExit', 'wall'].includes(objectId)) return true;
    if (HW_CONTENT.ENEMY_DEFS[objectId]) return theme.enemies.includes(objectId);
    if (['vine', 'burningCell', 'stickyTrap', 'waxDoor', 'burrowWarningCell', 'bomberMarkedCell'].includes(objectId)) {
        return theme.hazards.includes(objectId);
    }
    return theme.items.includes(objectId);
}

const internalObjectIds = new Set(['empty', 'entry', 'exit', 'finalExit']);
const objectUsageSources = new Map(Object.keys(HW_CONTENT.OBJECTS).map((objectId) => [objectId, []]));

function addObjectUsage(objectId, source) {
    if (objectUsageSources.has(objectId)) objectUsageSources.get(objectId).push(source);
}

HW_PROGRESSION.ROOM_PROFILES.forEach((profile) => {
    profile.allowedDiscovery.forEach((objectId) => addObjectUsage(objectId, 'room allowedDiscovery'));
    profile.allowedUtility.forEach((objectId) => addObjectUsage(objectId, 'room allowedUtility'));
    profile.allowedEnemies.forEach((objectId) => addObjectUsage(objectId, 'room allowedEnemies'));
    profile.itemWeights.forEach((entry) => addObjectUsage(entry.object, 'room itemWeights'));
});
HW_CONTENT.DISCOVERY_OBJECT_WEIGHTS.forEach((entry) => addObjectUsage(entry.object, 'discovery weights'));
HW_CONTENT.ENEMY_SPAWN_WEIGHTS.forEach((entry) => addObjectUsage(entry.object, 'enemy spawn weights'));
Object.values(HW_PROGRESSION.DUNGEON_THEMES).forEach((theme) => {
    theme.enemies.forEach((objectId) => addObjectUsage(objectId, 'theme enemies'));
    theme.items.forEach((objectId) => addObjectUsage(objectId, 'theme items'));
    theme.hazards.forEach((objectId) => addObjectUsage(objectId, 'theme hazards'));
});
Object.values(sandbox.window.HW_ROOM_TEMPLATES.ROOM_TEMPLATE_DEFS).forEach((template) => {
    [...(template.requiredObjects || []), ...(template.requiredEnemies || []), ...(template.synergyEnemies || [])]
        .forEach((objectId) => addObjectUsage(objectId, 'room template'));
});
Object.values(HW_CONTENT.ENEMY_DEFS).forEach((enemy) => {
    enemy.behaviors?.forEach((behavior) => addObjectUsage(behavior.object, 'enemy behavior payload'));
});

Object.entries(HW_CONTENT.OBJECTS).forEach(([objectId, object]) => {
    assert(object.name && object.description, `Object ${objectId} needs name and description`);
    assert(/^#[0-9a-f]{6}$/i.test(object.color), `Object ${objectId} needs a hex color`);
    object.effects?.forEach((effect) => {
        assert(sandbox.window.HW_ITEMS.hasItemEffectHandler(effect.type), `Object ${objectId} uses unsupported item effect ${effect.type}`);
        assertItemEffectPayload(objectId, effect);
    });
    if (objectId !== 'empty') {
        assert(HW_PROGRESSION.OBJECT_UNLOCK_LEVELS[objectId], `Object ${objectId} needs an unlock level`);
        if (!HW_CONTENT.ENEMY_DEFS[objectId]) assertLocalizedTuple('objects', objectId);
        const spriteId = HW_CONTENT.ENEMY_DEFS[objectId]?.sprite || objectId;
        assert(HW_CONTENT.SPRITE_DEFS[spriteId], `Object ${objectId} references missing sprite metadata ${spriteId}`);
        if (!internalObjectIds.has(objectId)) {
            assert(objectUsageSources.get(objectId)?.length > 0, `Object ${objectId} has no spawn, theme, template, or behavior usage path`);
        }
    }
});

Object.entries(HW_CONTENT.ENEMY_DEFS).forEach(([enemyId, enemy]) => {
    assert(HW_CONTENT.OBJECTS[enemyId], `Enemy ${enemyId} needs a matching OBJECTS entry`);
    assertLocalizedTuple('enemies', enemyId, 3);
    assert(enemy.name && enemy.behavior && enemy.lesson, `Enemy ${enemyId} needs name, behavior, and lesson text`);
    assert(/^#[0-9a-f]{6}$/i.test(enemy.color), `Enemy ${enemyId} needs a hex color`);
    assert(Number.isFinite(enemy.hp) && enemy.hp > 0, `Enemy ${enemyId} needs positive hp`);
    assert(Number.isFinite(enemy.attack) && enemy.attack >= 0, `Enemy ${enemyId} needs non-negative attack`);
    assert(Number.isFinite(enemy.range) && enemy.range >= 0, `Enemy ${enemyId} needs non-negative range`);
    assert(enemy.sprite && HW_CONTENT.SPRITE_DEFS[enemy.sprite], `Enemy ${enemyId} references missing sprite ${enemy.sprite}`);
    enemy.behaviors?.forEach((behavior) => {
        assert(sandbox.window.HW_ENEMIES.hasEnemyBehaviorHandler(behavior.type), `Enemy ${enemyId} uses unsupported behavior ${behavior.type}`);
        assertBehaviorPayload(enemyId, behavior);
    });
});

Object.entries(HW_PROGRESSION.OBJECT_UNLOCK_LEVELS).forEach(([objectId, level]) => {
    assert(Number.isInteger(level) && level >= 1, `Unlock level for ${objectId} must be a positive integer`);
    assert(HW_CONTENT.OBJECTS[objectId] || HW_CONTENT.ENEMY_DEFS[objectId], `Unlock level references missing object ${objectId}`);
});

Object.entries(HW_CONTENT.SPRITE_DEFS).forEach(([spriteId, definition]) => {
    assert(Number.isInteger(definition.columns) && definition.columns >= 1, `Sprite ${spriteId} needs columns`);
    assert(Number.isInteger(definition.rows) && definition.rows >= 1, `Sprite ${spriteId} needs rows`);
    assert(Number.isInteger(definition.row) && definition.row >= 0 && definition.row < definition.rows, `Sprite ${spriteId} needs row within sheet rows`);
    assert(Number.isFinite(definition.frameMs) && definition.frameMs > 0, `Sprite ${spriteId} needs positive frameMs`);
    assert(definition.src || definition.fallback || definition.plannedAsset, `Sprite ${spriteId} needs src, fallback, or plannedAsset`);
});

const slotIds = new Set(HW_CONTENT.EQUIPMENT_SLOTS.map((slot) => slot.id));
const starterEquipmentBySlot = new Map(HW_CONTENT.EQUIPMENT_SLOTS.map((slot) => [slot.id, []]));
assert(slotIds.size === HW_CONTENT.EQUIPMENT_SLOTS.length, 'Equipment slot ids must be unique');
HW_CONTENT.EQUIPMENT_SLOTS.forEach((slot) => {
    assert(slot.id && slot.name && slot.description, `Equipment slot ${slot.id || '(missing id)'} needs id, name, and description`);
    assert(slot.i18n?.en?.name && slot.i18n.en.description, `Equipment slot ${slot.id} needs English localized text`);
    assert(slot.i18n?.['es-419']?.name && slot.i18n['es-419'].description, `Equipment slot ${slot.id} needs Latin American Spanish localized text`);
});
Object.entries(HW_CONTENT.EQUIPMENT_DEFS).forEach(([equipmentId, equipment]) => {
    assert(equipment.id === equipmentId, `Equipment ${equipmentId} id must match its key`);
    assert(slotIds.has(equipment.slot), `Equipment ${equipment.id} uses unknown slot ${equipment.slot}`);
    assert(equipment.name && equipment.description, `Equipment ${equipment.id} needs name and description`);
    assert(equipment.i18n?.en?.name && equipment.i18n.en.description, `Equipment ${equipment.id} needs English localized text`);
    assert(equipment.i18n?.['es-419']?.name && equipment.i18n['es-419'].description, `Equipment ${equipment.id} needs Latin American Spanish localized text`);
    assert(equipmentRarities.has(equipment.rarity), `Equipment ${equipment.id} uses unknown rarity ${equipment.rarity}`);
    assert(Number.isInteger(equipment.minLevel) && equipment.minLevel >= 1, `Equipment ${equipment.id} needs a positive integer minLevel`);
    if (equipment.rarity === 'starter') {
        assert(equipment.minLevel === 1, `Starter equipment ${equipment.id} must unlock at level 1`);
    }
    assert(Array.isArray(equipment.effects) && equipment.effects.length > 0, `Equipment ${equipment.id} needs at least one future effect`);
    equipment.effects.forEach((effect) => {
        assert(sandbox.window.HW_EQUIPMENT.hasEquipmentEffectHandler(effect.type), `Equipment ${equipment.id} uses unsupported effect ${effect.type}`);
        assertPositiveNumber(effect.amount, `Equipment ${equipment.id} ${effect.type} amount must be positive`);
    });
    if (equipment.rewardWeight != null) {
        assertPositiveNumber(equipment.rewardWeight, `Equipment ${equipment.id} rewardWeight must be positive when provided`);
    }
    if (equipment.rarity === 'starter') {
        starterEquipmentBySlot.get(equipment.slot).push(equipment.id);
    }
});
equipmentEffectTypes.forEach((effectType) => {
    const copy = sandbox.window.HW_EQUIPMENT.EQUIPMENT_EFFECT_COPY?.[effectType];
    assert(copy?.en?.label && copy.en.description, `Equipment effect ${effectType} needs English reward copy`);
    assert(copy?.['es-419']?.label && copy['es-419'].description, `Equipment effect ${effectType} needs Latin American Spanish reward copy`);
});
equipmentRarities.forEach((rarity) => {
    const copy = sandbox.window.HW_EQUIPMENT.EQUIPMENT_RARITY_COPY?.[rarity];
    assert(copy?.en?.label, `Equipment rarity ${rarity} needs English reward copy`);
    assert(copy?.['es-419']?.label, `Equipment rarity ${rarity} needs Latin American Spanish reward copy`);
});
starterEquipmentBySlot.forEach((starterEquipment, slotId) => {
    assert(starterEquipment.length === 1, `Equipment slot ${slotId} needs exactly one starter item`);
});

const equipmentSystem = sandbox.window.HW_EQUIPMENT.createEquipmentSystem({
    equipmentSlots: HW_CONTENT.EQUIPMENT_SLOTS,
    equipmentDefs: HW_CONTENT.EQUIPMENT_DEFS
});
assert(equipmentSystem.getLocalizedSlot('helmet', 'es-419')?.name === 'Casco', 'Equipment system should localize slot display text');
assert(equipmentSystem.getLocalizedEquipment('longSting', 'es-419')?.name === 'Aguijon largo', 'Equipment system should localize gear display text');
assert(equipmentSystem.getLocalizedRarity('common', 'es-419')?.label === 'Comun', 'Equipment system should localize rarity labels');
const emptyLoadout = equipmentSystem.createStartingEquipment();
HW_CONTENT.EQUIPMENT_SLOTS.forEach((slot) => {
    assert(Object.hasOwn(emptyLoadout, slot.id), `Starting equipment is missing slot ${slot.id}`);
    assert(emptyLoadout[slot.id] === null, `Starting equipment slot ${slot.id} should start empty`);
});
const starterLoadout = equipmentSystem.createStarterEquipment();
HW_CONTENT.EQUIPMENT_SLOTS.forEach((slot) => {
    const starterEquipment = starterEquipmentBySlot.get(slot.id)[0];
    assert(starterLoadout[slot.id] === starterEquipment, `Starter equipment should equip ${starterEquipment} in ${slot.id}`);
});
const starterLoadoutDetails = equipmentSystem.createEquipmentLoadoutDetails(starterLoadout, { language: 'es-419' });
assert(starterLoadoutDetails.length === HW_CONTENT.EQUIPMENT_SLOTS.length, 'Equipment loadout details should include every slot');
assert(starterLoadoutDetails.every((details) => !details.isEmpty && details.equipment && details.slotDef), 'Equipment loadout details should include equipped gear and slot metadata');
assert(starterLoadoutDetails.some((details) => details.slot === 'helmet' && details.slotDef.name === 'Casco' && details.equipment.name === 'Casco explorador de cera'), 'Equipment loadout details should localize equipped starter gear');
assert(starterLoadoutDetails.every((details) => details.rarityLabel && details.effects.length > 0), 'Equipment loadout details should include rarity labels and effect summaries');
const emptyLoadoutDetails = equipmentSystem.createEquipmentLoadoutDetails(emptyLoadout, { language: 'en' });
assert(emptyLoadoutDetails.every((details) => details.isEmpty && !details.equipment && details.effects.length === 0), 'Equipment loadout details should mark empty slots');
Object.values(HW_CONTENT.EQUIPMENT_DEFS).forEach((equipment) => {
    const equipped = equipmentSystem.equipItem(emptyLoadout, equipment.id);
    assert(equipped?.loadout?.[equipment.slot] === equipment.id, `Equipment system should equip ${equipment.id} into ${equipment.slot}`);
    assert(equipmentSystem.getEquippedItems(equipped.loadout).some((item) => item.id === equipment.id), `Equipment system should list ${equipment.id} as equipped`);
    const availableAtUnlock = equipmentSystem.getAvailableEquipment(equipment.minLevel);
    assert(availableAtUnlock.some((item) => item.id === equipment.id), `Equipment system should unlock ${equipment.id} at level ${equipment.minLevel}`);
    if (equipment.minLevel > 1) {
        const availableBeforeUnlock = equipmentSystem.getAvailableEquipment(equipment.minLevel - 1);
        assert(!availableBeforeUnlock.some((item) => item.id === equipment.id), `Equipment system should keep ${equipment.id} locked before level ${equipment.minLevel}`);
    }
});
const rewardChoices = equipmentSystem.createEquipmentRewardChoices({
    playerLevel: 1,
    loadout: emptyLoadout,
    count: 3,
    rng: () => 0
});
assert(equipmentSystem.hasEquipmentRewardsAvailable({ playerLevel: 1, loadout: emptyLoadout }), 'Equipment rewards should be available for an empty level 1 loadout');
assert(rewardChoices.length === Math.min(3, equipmentSystem.getAvailableEquipment(1).length), 'Equipment reward choices should offer up to three available items');
assert(new Set(rewardChoices.map((equipment) => equipment.id)).size === rewardChoices.length, 'Equipment reward choices should not repeat items');
rewardChoices.forEach((equipment) => {
    assert(equipment.minLevel <= 1, `Equipment reward choice ${equipment.id} should respect player level`);
});
const rewardOffer = equipmentSystem.createEquipmentRewardOffer({
    playerLevel: 2,
    loadout: starterLoadout,
    count: 3,
    rng: () => 0,
    language: 'es-419'
});
assert(rewardOffer.available && rewardOffer.status === 'available', 'Equipment reward offer should mark available choices');
assert(rewardOffer.label === 'Recompensa lista', 'Equipment reward offer should localize available status');
assert(rewardOffer.totalAvailable >= rewardOffer.choices.length, 'Equipment reward offer should report available pool size');
assert(rewardOffer.choices.every((details) => details.equipment && details.slotDef && details.effects.length > 0), 'Equipment reward offer should include localized choice details');
const emptyRewardOffer = equipmentSystem.createEquipmentRewardOffer({
    playerLevel: 1,
    loadout: starterLoadout,
    count: 3,
    language: 'en'
});
assert(!emptyRewardOffer.available && emptyRewardOffer.status === 'noChoices', 'Equipment reward offer should explain when no gear is available');
assert(emptyRewardOffer.label === 'No gear choices', 'Equipment reward offer should localize empty status');
const emptyChoiceDetails = equipmentSystem.getEquipmentChoiceDetails(emptyLoadout, rewardChoices[0].id);
assert(emptyChoiceDetails?.equipment?.id === rewardChoices[0].id, 'Equipment choice details should include the candidate item');
assert(emptyChoiceDetails.slotDef?.id === emptyChoiceDetails.slot, 'Equipment choice details should include the slot definition');
assert(emptyChoiceDetails.slotDef?.name, 'Equipment choice details should include the slot display name');
assert(emptyChoiceDetails.rarity === emptyChoiceDetails.equipment.rarity, 'Equipment choice details should include candidate rarity');
assert(emptyChoiceDetails.rarityLabel === 'Starter', 'Equipment choice details should include localized rarity label');
assert(emptyChoiceDetails.rarityDef?.id === emptyChoiceDetails.rarity, 'Equipment choice details should include localized rarity metadata');
assert(Number.isInteger(emptyChoiceDetails.rarityRank), 'Equipment choice details should include a rarity rank');
assert(emptyChoiceDetails.rewardWeight > 0, 'Equipment choice details should include a reward weight');
assert(emptyChoiceDetails.effects.length === emptyChoiceDetails.equipment.effects.length, 'Equipment choice details should include candidate effect summaries');
assert(emptyChoiceDetails.effects.every((effect) => effect.isFuture && !effect.isActive), 'Starter equipment choice effect summaries should mark future effects');
assert(emptyChoiceDetails.effects.every((effect) => effect.label && effect.description), 'Equipment choice details should include readable effect copy');
assert(emptyChoiceDetails.isEmptySlot && !emptyChoiceDetails.isReplacement && !emptyChoiceDetails.isEquipped, 'Equipment choice details should flag empty slots');
const rewardChoiceDetails = equipmentSystem.createEquipmentRewardChoiceDetails({
    playerLevel: 1,
    loadout: emptyLoadout,
    count: 3,
    rng: () => 0
});
assert(rewardChoiceDetails.length === rewardChoices.length, 'Equipment reward choice details should match the raw reward choice count');
assert(rewardChoiceDetails.every((details) => details.equipment && details.slot), 'Equipment reward choice details should include candidate and slot metadata');
const equippedIds = new Set(Object.values(starterLoadout).filter(Boolean));
const replacementChoices = equipmentSystem.createEquipmentRewardChoices({
    playerLevel: 1,
    loadout: starterLoadout,
    count: 3,
    rng: () => 0
});
replacementChoices.forEach((equipment) => {
    assert(!equippedIds.has(equipment.id), `Equipment reward choices should not offer already equipped item ${equipment.id}`);
});
assert(!equipmentSystem.hasEquipmentRewardsAvailable({ playerLevel: 1, loadout: starterLoadout }), 'Equipment rewards should report unavailable when every level 1 item is equipped');
assert(equipmentSystem.hasEquipmentRewardsAvailable({ playerLevel: 2, loadout: starterLoadout }), 'Equipment rewards should become available after starter-only level 2 unlocks');
const levelTwoRewardChoices = equipmentSystem.createEquipmentRewardChoices({
    playerLevel: 2,
    loadout: starterLoadout,
    count: 3,
    rng: () => 0
});
assert(levelTwoRewardChoices.length === 3, 'Equipment reward choices should offer three unlocked replacements at level 2');
assert(levelTwoRewardChoices.every((equipment) => equipment.rarity !== 'starter'), 'Equipment reward choices should not offer equipped starter gear as replacements');
const levelFourRewards = equipmentSystem.getAvailableEquipment(4).filter((equipment) => equipment.rarity === 'rare');
assert(levelFourRewards.length >= HW_CONTENT.EQUIPMENT_SLOTS.length, 'Equipment rewards should include a rare tier with at least one item per slot by level 4');
HW_CONTENT.EQUIPMENT_SLOTS.forEach((slot) => {
    assert(levelFourRewards.some((equipment) => equipment.slot === slot.id), `Rare equipment tier should include a ${slot.id} reward`);
});
const equippedChoiceDetails = equipmentSystem.getEquipmentChoiceDetails(starterLoadout, starterLoadout.helmet);
assert(equippedChoiceDetails?.isEquipped && !equippedChoiceDetails.isReplacement, 'Equipment choice details should flag already equipped gear');
assert(equipmentSystem.getEquipmentChoiceDetails(starterLoadout, 'missingGear') === null, 'Equipment choice details should return null for unknown gear');
const weightedEquipmentSystem = sandbox.window.HW_EQUIPMENT.createEquipmentSystem({
    equipmentSlots: HW_CONTENT.EQUIPMENT_SLOTS,
    equipmentDefs: {
        commonHelmet: {
            id: 'commonHelmet',
            slot: 'helmet',
            name: 'Common Helmet',
            description: 'Synthetic common gear.',
            rarity: 'common',
            minLevel: 1,
            effects: [{ type: 'futureRevealHint', amount: 1 }]
        },
        rareHelmet: {
            id: 'rareHelmet',
            slot: 'helmet',
            name: 'Rare Helmet',
            description: 'Synthetic rare gear.',
            rarity: 'rare',
            minLevel: 1,
            effects: [{ type: 'futureRevealHint', amount: 1 }]
        },
        legendaryHelmet: {
            id: 'legendaryHelmet',
            slot: 'helmet',
            name: 'Legendary Helmet',
            description: 'Synthetic legendary gear.',
            rarity: 'legendary',
            minLevel: 1,
            effects: [{ type: 'futureRevealHint', amount: 1 }]
        },
        lockedWings: {
            id: 'lockedWings',
            slot: 'wings',
            name: 'Locked Wings',
            description: 'Synthetic locked gear.',
            rarity: 'common',
            minLevel: 2,
            effects: [{ type: 'futureMovePoint', amount: 1 }]
        },
        activeJacket: {
            id: 'activeJacket',
            slot: 'jacket',
            name: 'Active Jacket',
            description: 'Synthetic active gear.',
            rarity: 'common',
            minLevel: 1,
            effects: [{ type: 'maxShield', amount: 1 }]
        }
    }
});
const lowRollWeightedChoice = weightedEquipmentSystem.createEquipmentRewardChoices({ playerLevel: 1, count: 1, rng: () => 0 })[0];
assert(lowRollWeightedChoice.id === 'commonHelmet', 'Weighted equipment choices should select from the common-weight band on low rolls');
const highRollWeightedChoice = weightedEquipmentSystem.createEquipmentRewardChoices({ playerLevel: 1, count: 1, rng: () => 0.99 })[0];
assert(highRollWeightedChoice.id === 'legendaryHelmet', 'Weighted equipment choices should still allow rare high-roll rewards');
assert(!weightedEquipmentSystem.createEquipmentRewardChoices({ playerLevel: 1, count: 3, rng: () => 0 }).some((equipment) => equipment.id === 'lockedWings'), 'Weighted equipment choices should respect minLevel filtering');
const replacementChoiceDetails = weightedEquipmentSystem.getEquipmentChoiceDetails({ helmet: 'commonHelmet' }, 'rareHelmet');
assert(replacementChoiceDetails?.current?.id === 'commonHelmet', 'Equipment choice details should include the currently equipped item in the same slot');
assert(replacementChoiceDetails.slotDef?.id === 'helmet', 'Equipment replacement details should include the replaced slot definition');
assert(replacementChoiceDetails.rarity === 'rare' && replacementChoiceDetails.rewardWeight === sandbox.window.HW_EQUIPMENT.EQUIPMENT_RARITY_WEIGHTS.rare, 'Equipment replacement details should include rarity reward metadata');
assert(replacementChoiceDetails.isReplacement && !replacementChoiceDetails.isEmptySlot && !replacementChoiceDetails.isEquipped, 'Equipment choice details should flag slot replacements');
const weightedRewardChoiceDetails = weightedEquipmentSystem.createEquipmentRewardChoiceDetails({
    playerLevel: 1,
    loadout: { helmet: 'commonHelmet' },
    count: 1,
    rng: () => 0.7
})[0];
assert(weightedRewardChoiceDetails?.current?.id === 'commonHelmet', 'Equipment reward choice details should include replacement metadata');
const localizedChoiceDetails = equipmentSystem.getEquipmentChoiceDetails(starterLoadout, 'longSting', { language: 'es-419' });
assert(localizedChoiceDetails?.equipment?.name === 'Aguijon largo', 'Equipment choice details should localize candidate gear');
assert(localizedChoiceDetails?.slotDef?.name === 'Aguijon', 'Equipment choice details should localize slot metadata');
assert(localizedChoiceDetails?.current?.name === 'Aguijon dentado', 'Equipment choice details should localize current gear');
assert(localizedChoiceDetails?.effects?.[0]?.label === '+1 alcance', 'Equipment choice details should localize effect summaries');
assert(localizedChoiceDetails?.rarityLabel === 'Comun', 'Equipment choice details should localize rarity labels');
const selectedEquipmentReward = equipmentSystem.selectEquipmentReward(starterLoadout, 'longSting', { language: 'es-419' });
assert(selectedEquipmentReward?.loadout?.sting === 'longSting', 'Equipment reward selection should equip the chosen item');
assert(selectedEquipmentReward.currentId === 'barbedSting' && selectedEquipmentReward.isReplacement, 'Equipment reward selection should include replacement details');
assert(selectedEquipmentReward.equipment.name === 'Aguijon largo', 'Equipment reward selection should preserve localized candidate details');
assert(equipmentSystem.selectEquipmentReward(selectedEquipmentReward.loadout, 'longSting') === null, 'Equipment reward selection should reject already equipped items');
const activeEffectSummary = weightedEquipmentSystem.createEquipmentEffectSummaries({
    effects: [{ type: 'maxShield', amount: 1 }]
})[0];
assert(activeEffectSummary.isActive && !activeEffectSummary.isFuture, 'Equipment effect summaries should mark active effects');
assert(activeEffectSummary.label === '+1 max shield', 'Equipment effect summaries should include active effect labels');
const testPlayer = { health: 7, maxHealth: 7, maxShield: 5, attackRange: 1, maxMovePoints: 2, movePoints: 2 };
equipmentSystem.applyLoadout(testPlayer, {
    helmet: 'waxScoutHelmet',
    jacket: 'leafJacket',
    abdomen: 'nectarPouch',
    sting: 'barbedSting',
    wings: 'scoutWings'
});
assert(testPlayer.equipment?.sting === 'barbedSting', 'Equipment system should mirror applied loadout on player state');
assert(testPlayer.maxHealth === 7 && testPlayer.maxShield === 5 && testPlayer.attackRange === 1 && testPlayer.maxMovePoints === 2, 'Future equipment effects should not change active combat stats yet');

Object.entries(HW_CONTENT.SPRITE_DEFS)
    .filter(([, definition]) => definition.src)
    .forEach(([, definition]) => assertFile(definition.src));

const relicIds = new Set();
HW_CONTENT.RELICS.forEach((relic) => {
    assert(relic.id && !relicIds.has(relic.id), `Relic ${relic.id || '(missing id)'} needs a unique id`);
    relicIds.add(relic.id);
    assert(relic.name && relic.description, `Relic ${relic.id} needs name and description`);
    assertLocalizedTuple('relics', relic.id);
    assert(Number.isInteger(relic.minDepth) && relic.minDepth >= 1, `Relic ${relic.id} needs a positive integer minDepth`);
    assert(relicRarities.has(relic.rarity), `Relic ${relic.id} uses unknown rarity ${relic.rarity}`);
    Object.entries(relic).forEach(([key, value]) => {
        if (typeof value === 'function') {
            assert(relicHooks.has(key), `Relic ${relic.id} uses unsupported hook ${key}`);
        }
    });
});

for (let rewardDepth = 1; rewardDepth < finalRoomDepth; rewardDepth += 1) {
    const availableAtDepth = HW_CONTENT.RELICS.filter((relic) => relic.minDepth <= rewardDepth).length;
    const priorRelicChoices = rewardDepth - 1;
    assert(
        availableAtDepth - priorRelicChoices >= relicChoiceCount,
        `Relic reward at depth ${rewardDepth} needs at least ${relicChoiceCount} choices after prior picks`
    );
}

function createRunSummary(language) {
    return sandbox.window.HW_RUN_SUMMARY.createRunSummarySystem({
        getLanguage: () => language
    });
}

function assertIncludes(value, expected, message) {
    assert(value.includes(expected), `${message}: expected "${value}" to include "${expected}"`);
}

const defaultMetrics = { damageBySource: {}, attacksMade: 4, turns: 8, repeatedAttackRetreatPatterns: 0 };
const defaultPlayer = { pollen: 0, water: 0, honey: 0 };
const defaultRunStats = { kills: 2 };
const englishSummary = createRunSummary('en');
assertIncludes(englishSummary.getDeathTip('Bat Bite'), 'Bats punish', 'English bat death tip should be specific');
assertIncludes(englishSummary.getDeathTip('Wasp Aura'), 'Wasp pressure', 'English wasp death tip should be specific');
assertIncludes(englishSummary.getRunRecommendation({
    reason: 'death',
    metrics: { ...defaultMetrics, damageBySource: { 'Wasp Aura': 2 } },
    player: defaultPlayer,
    runStats: defaultRunStats
}), 'wasp rings', 'English wasp recommendation should be specific');
assertIncludes(englishSummary.getRunRecommendation({
    reason: 'death',
    metrics: { ...defaultMetrics, damageBySource: { 'Burning Cell': 2 } },
    player: defaultPlayer,
    runStats: defaultRunStats
}), 'Reserve water', 'English burning recommendation should be specific');
assertIncludes(englishSummary.getRunRecommendation({
    reason: 'boss-defeated',
    metrics: defaultMetrics,
    player: { pollen: 2, water: 2, honey: 1 },
    runStats: defaultRunStats
}), 'many resources', 'English unspent resource recommendation should be specific');
assertIncludes(englishSummary.getRunRecommendation({
    reason: 'boss-defeated',
    metrics: { ...defaultMetrics, repeatedAttackRetreatPatterns: 2 },
    player: defaultPlayer,
    runStats: defaultRunStats
}), 'Hit-and-run', 'English anti-kite recommendation should be specific');

const spanishSummary = createRunSummary('es-419');
assertIncludes(spanishSummary.getDeathTip('Vines'), 'enredaderas', 'Spanish vine death tip should be localized');
assertIncludes(spanishSummary.getRunRecommendation({
    reason: 'death',
    metrics: { ...defaultMetrics, damageBySource: { Bat: 2 } },
    player: defaultPlayer,
    runStats: defaultRunStats
}), 'murcielagos', 'Spanish bat recommendation should be localized');

const cellInteractions = sandbox.window.HW_CELL_INTERACTIONS.createCellInteractionSystem({
    objects: HW_CONTENT.OBJECTS
});

function assertInteractionRule(objectId, expected) {
    const rule = cellInteractions.getInteractionRule(objectId);
    Object.entries(expected).forEach(([key, value]) => {
        if (key === 'cursor') {
            Object.entries(value).forEach(([cursorKey, cursorValue]) => {
                assert(rule.cursor?.[cursorKey] === cursorValue, `${objectId} cursor.${cursorKey} should be ${cursorValue}`);
            });
            return;
        }
        assert(rule[key] === value, `${objectId}.${key} should be ${value}`);
    });
}

assertInteractionRule('exit', { role: 'route', action: 'nextRoom', cursor: { symbol: '>' } });
assertInteractionRule('waxDoor', { role: 'blocker', action: 'waxDoor', cursor: { symbol: 'D' } });
assertInteractionRule('vine', { role: 'hazard', detail: 'vine', action: 'crossHazard' });
assertInteractionRule('burningCell', { role: 'hazard', detail: 'burningCell', action: 'crossHazard' });
assertInteractionRule('npc', { role: 'trade', action: 'trade', cursor: { symbol: '$' } });
assertInteractionRule('pollen', { role: 'item', action: 'collect', cursor: { symbol: '+' } });

assert(cellInteractions.isFreeWalkoverObject('lampCell'), 'Lamp cells should be free walkover reveal cells');
assert(cellInteractions.isFreeWalkoverObject('entry'), 'Entry cells should be free walkover cells');
assert(!cellInteractions.isFreeWalkoverObject('waxDoor'), 'Wax doors should not be free walkover cells');
assert(cellInteractions.isCollectOnMoveObject('pollen', () => false), 'Pollen should collect on move');
assert(!cellInteractions.isCollectOnMoveObject('waxDoor', () => false), 'Wax doors should not collect on move');
assert(!cellInteractions.isCollectOnMoveObject('enemy', (object) => object === 'enemy'), 'Enemy objects should not collect on move');

const enemyInspectExpectations = {
    armoredFacing: { kind: 'guard', en: 'Front', es: 'Frente' },
    chargeLane: { kind: 'danger', en: 'Lane', es: 'Carril' },
    markCellsAura: { kind: 'danger', en: 'Marks', es: 'Marca' },
    spawnEnemyAura: { kind: 'spawn', en: 'Spawns', es: 'Invoca' },
    stealResourceAura: { en: 'Steals', es: 'Roba', tone: 'cost' },
    waterDrainAura: { kind: 'water', en: 'Drains', es: 'Drena', tone: 'cost' },
    refogAura: { kind: 'reveal', en: 'Fog', es: 'Niebla' },
    spawnTerrainAura: { en: 'Terrain', es: 'Terreno' },
    weakPointWindow: { kind: 'attack', en: 'Core', es: 'Nucleo' }
};

function createInspectStats(language) {
    return sandbox.window.HW_INSPECT_STATS.createInspectStatsSystem({
        hudRows: HW_ART.HUD_ICON_ROWS,
        getLanguage: () => language,
        vineDamage: 1,
        hasEnemyBehavior: (objectId, behaviorType) => Boolean(HW_CONTENT.ENEMY_DEFS[objectId]?.behaviors?.some((behavior) => behavior.type === behaviorType)),
        getEnemyBehavior: (objectId, behaviorType) => HW_CONTENT.ENEMY_DEFS[objectId]?.behaviors?.find((behavior) => behavior.type === behaviorType)
    });
}

function assertEnemyInspectExpectations(language, labelKey) {
    const inspectStats = createInspectStats(language);
    Object.entries(HW_CONTENT.ENEMY_DEFS).forEach(([enemyId, enemy]) => {
        const stats = inspectStats.getEnemyStats(enemyId, { object: enemyId, hits: 0 }, enemy);
        enemy.behaviors?.forEach((behavior) => {
            const expected = enemyInspectExpectations[behavior.type];
            if (!expected) return;
            const hasExpectedStat = stats.some((stat) => (
                stat.label === expected[labelKey]
                && (expected.kind == null || stat.kind === expected.kind)
                && (expected.tone == null || stat.tone === expected.tone)
            ));
            assert(hasExpectedStat, `${language} enemy ${enemyId} ${behavior.type} should expose inspect stat ${expected[labelKey]}`);
        });
    });
}

assertEnemyInspectExpectations('en', 'en');
assertEnemyInspectExpectations('es-419', 'es');

const itemEffectInspectExpectations = {
    revealAround: {
        kind: 'reveal',
        en: (effect) => `Radius ${effect.radius}`,
        es: (effect) => `Radio ${effect.radius}`
    },
    pauseEnemyTimers: {
        kind: 'pause',
        en: (effect) => `${Math.round(effect.durationMs / 1000)}s`,
        es: (effect) => `${Math.round(effect.durationMs / 1000)}s`
    },
    revealEnemies: { kind: 'reveal', en: 'Reveal', es: 'Revela' },
    revealExitHint: { kind: 'reveal', en: 'Reveal', es: 'Revela' },
    revealExitRoute: { kind: 'reveal', en: 'Reveal', es: 'Revela' },
    slowNearbyEnemies: { kind: 'slow', en: 'Slow', es: 'Lento' },
    transformCell: { kind: 'terrain', en: 'Trap', es: 'Trampa' }
};

function expectedLabel(expected, labelKey, effect) {
    const label = expected[labelKey];
    return typeof label === 'function' ? label(effect) : label;
}

function assertItemEffectInspectExpectations(language, labelKey) {
    const inspectStats = createInspectStats(language);
    Object.entries(HW_CONTENT.OBJECTS).forEach(([objectId, object]) => {
        const stats = inspectStats.getObjectEffectStats(objectId, HW_CONTENT.OBJECTS);
        object.effects?.forEach((effect) => {
            const expected = itemEffectInspectExpectations[effect.type];
            if (!expected) return;
            const label = expectedLabel(expected, labelKey, effect);
            const hasExpectedStat = stats.some((stat) => (
                stat.label === label
                && (expected.kind == null || stat.kind === expected.kind)
                && (expected.tone == null || stat.tone === expected.tone)
            ));
            assert(hasExpectedStat, `${language} object ${objectId} ${effect.type} should expose inspect stat ${label}`);
        });
    });
}

assertItemEffectInspectExpectations('en', 'en');
assertItemEffectInspectExpectations('es-419', 'es');

function assertInspectStat(stats, expected, message) {
    const hasExpectedStat = stats.some((stat) => (
        stat.label === expected.label
        && (expected.kind == null || stat.kind === expected.kind)
        && (expected.tone == null || stat.tone === expected.tone)
    ));
    assert(hasExpectedStat, message);
}

function assertTerrainVisibilityAndRouteStats(language, labels) {
    const inspectStats = createInspectStats(language);

    assertInspectStat(
        inspectStats.getObjectEffectStats('vine', HW_CONTENT.OBJECTS),
        { kind: 'damage', label: '1', tone: 'danger' },
        `${language} vine should expose terrain damage inspect stat`
    );
    assertInspectStat(
        inspectStats.getObjectEffectStats('burningCell', HW_CONTENT.OBJECTS),
        { kind: 'damage', label: '1', tone: 'danger' },
        `${language} burning cell should expose damage inspect stat`
    );
    assertInspectStat(
        inspectStats.getObjectEffectStats('burningCell', HW_CONTENT.OBJECTS),
        { kind: 'water', label: '1', tone: 'cost' },
        `${language} burning cell should expose water cost inspect stat`
    );
    assertInspectStat(
        inspectStats.getObjectEffectStats('waxDoor', HW_CONTENT.OBJECTS),
        { kind: 'pollen', label: '1', tone: 'cost' },
        `${language} wax door should expose pollen cost inspect stat`
    );
    assertInspectStat(
        inspectStats.getObjectEffectStats('wall', HW_CONTENT.OBJECTS),
        { kind: 'blocked', label: labels.path, tone: 'cost' },
        `${language} wall should expose blocked path inspect stat`
    );
    assertInspectStat(
        inspectStats.getObjectEffectStats('exit', HW_CONTENT.OBJECTS),
        { kind: 'action', label: labels.action, tone: 'route' },
        `${language} exit should expose action inspect stat`
    );

    assertInspectStat(
        inspectStats.getVisibilityStats({ revealed: false, litByLamp: false }, false),
        { kind: 'hidden', label: labels.hidden, tone: 'route' },
        `${language} hidden mist cells should expose visibility inspect stat`
    );
    assertInspectStat(
        inspectStats.getVisibilityStats({ revealed: false, litByLamp: true }, false),
        { kind: 'reveal', label: labels.lit, tone: 'route' },
        `${language} lamp-lit mist cells should expose visibility inspect stat`
    );

    const riskyRouteStats = inspectStats.getRouteStats({
        path: [{}, {}],
        complete: false,
        blockedTarget: true,
        risk: { totalDamage: 1, totalBlocked: 1, waterSpent: 1 }
    }, 1);
    assertInspectStat(
        riskyRouteStats,
        { kind: 'move', label: '1/2', tone: 'cost' },
        `${language} route preview should expose reachable movement inspect stat`
    );
    assertInspectStat(
        riskyRouteStats,
        { kind: 'damage', label: '1', tone: 'danger' },
        `${language} route preview should expose damage risk inspect stat`
    );
    assertInspectStat(
        riskyRouteStats,
        { kind: 'shield', label: '1', tone: 'route' },
        `${language} route preview should expose shield block inspect stat`
    );
    assertInspectStat(
        riskyRouteStats,
        { kind: 'water', label: '1', tone: 'cost' },
        `${language} route preview should expose water spend inspect stat`
    );
    assertInspectStat(
        riskyRouteStats,
        { kind: 'blocked', label: labels.blocked, tone: 'cost' },
        `${language} route preview should expose blocked inspect stat`
    );

    assertInspectStat(
        inspectStats.getRouteStats({
            path: [{}],
            complete: true,
            deathCell: {},
            risk: {}
        }, 1),
        { kind: 'lethal', label: labels.lethal, tone: 'danger' },
        `${language} route preview should expose lethal inspect stat`
    );
}

assertTerrainVisibilityAndRouteStats('en', {
    action: 'Action',
    blocked: 'Blocked',
    hidden: 'Hidden',
    lethal: 'Lethal',
    lit: 'Lit',
    path: 'Path'
});
assertTerrainVisibilityAndRouteStats('es-419', {
    action: 'Accion',
    blocked: 'Bloqueado',
    hidden: 'Oculto',
    lethal: 'Letal',
    lit: 'Iluminada',
    path: 'Paso'
});

console.log('Data smoke checks passed');
