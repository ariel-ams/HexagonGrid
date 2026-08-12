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
const equipmentRarities = new Set(['starter', 'common', 'rare', 'epic', 'legendary']);
const equipmentEffectTypes = new Set([
    'futureAttackRange',
    'futureHazardBlock',
    'futureMovePoint',
    'futureRevealHint',
    'futureRoomHoney'
]);
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
    }
});

Object.entries(HW_CONTENT.ENEMY_DEFS).forEach(([enemyId, enemy]) => {
    assert(HW_CONTENT.OBJECTS[enemyId], `Enemy ${enemyId} needs a matching OBJECTS entry`);
    assertLocalizedTuple('enemies', enemyId, 3);
    assert(enemy.name && enemy.behavior && enemy.lesson, `Enemy ${enemyId} needs name, behavior, and lesson text`);
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
    assert(definition.src || definition.fallback || definition.plannedAsset, `Sprite ${spriteId} needs src, fallback, or plannedAsset`);
});

const slotIds = new Set(HW_CONTENT.EQUIPMENT_SLOTS.map((slot) => slot.id));
HW_CONTENT.EQUIPMENT_SLOTS.forEach((slot) => {
    assert(slot.id && slot.name && slot.description, `Equipment slot ${slot.id || '(missing id)'} needs id, name, and description`);
});
Object.entries(HW_CONTENT.EQUIPMENT_DEFS).forEach(([equipmentId, equipment]) => {
    assert(equipment.id === equipmentId, `Equipment ${equipmentId} id must match its key`);
    assert(slotIds.has(equipment.slot), `Equipment ${equipment.id} uses unknown slot ${equipment.slot}`);
    assert(equipment.name && equipment.description, `Equipment ${equipment.id} needs name and description`);
    assert(equipmentRarities.has(equipment.rarity), `Equipment ${equipment.id} uses unknown rarity ${equipment.rarity}`);
    assert(Array.isArray(equipment.effects) && equipment.effects.length > 0, `Equipment ${equipment.id} needs at least one future effect`);
    equipment.effects.forEach((effect) => {
        assert(equipmentEffectTypes.has(effect.type), `Equipment ${equipment.id} uses unsupported future effect ${effect.type}`);
        assertPositiveNumber(effect.amount, `Equipment ${equipment.id} ${effect.type} amount must be positive`);
    });
});

Object.entries(HW_CONTENT.SPRITE_DEFS)
    .filter(([, definition]) => definition.src)
    .forEach(([, definition]) => assertFile(definition.src));

const relicIds = new Set();
HW_CONTENT.RELICS.forEach((relic) => {
    assert(relic.id && !relicIds.has(relic.id), `Relic ${relic.id || '(missing id)'} needs a unique id`);
    relicIds.add(relic.id);
    assert(relic.name && relic.description, `Relic ${relic.id} needs name and description`);
    assert(Number.isInteger(relic.minDepth) && relic.minDepth >= 1, `Relic ${relic.id} needs a positive integer minDepth`);
    assert(relicRarities.has(relic.rarity), `Relic ${relic.id} uses unknown rarity ${relic.rarity}`);
    Object.entries(relic).forEach(([key, value]) => {
        if (typeof value === 'function') {
            assert(relicHooks.has(key), `Relic ${relic.id} uses unsupported hook ${key}`);
        }
    });
});

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

const inspectStats = sandbox.window.HW_INSPECT_STATS.createInspectStatsSystem({
    hudRows: HW_ART.HUD_ICON_ROWS,
    getLanguage: () => 'en',
    vineDamage: 1,
    hasEnemyBehavior: (objectId, behaviorType) => Boolean(HW_CONTENT.ENEMY_DEFS[objectId]?.behaviors?.some((behavior) => behavior.type === behaviorType)),
    getEnemyBehavior: (objectId, behaviorType) => HW_CONTENT.ENEMY_DEFS[objectId]?.behaviors?.find((behavior) => behavior.type === behaviorType)
});
const hiveEnemy = HW_CONTENT.ENEMY_DEFS.waspHive;
const hiveStats = inspectStats.getEnemyStats('waspHive', { object: 'waspHive', hits: 0 }, hiveEnemy);
assert(hiveStats.some((stat) => stat.kind === 'spawn' && stat.label === 'Spawns'), 'Wasp Hive inspect stats should advertise spawned enemies');
const leechStats = inspectStats.getEnemyStats('waterLeech', { object: 'waterLeech', hits: 0 }, HW_CONTENT.ENEMY_DEFS.waterLeech);
assert(leechStats.some((stat) => stat.kind === 'water' && stat.label === 'Drains' && stat.tone === 'cost'), 'Water Leech inspect stats should show non-red water drain pressure');
const thiefStats = inspectStats.getEnemyStats('pollenThiefMoth', { object: 'pollenThiefMoth', hits: 0 }, HW_CONTENT.ENEMY_DEFS.pollenThiefMoth);
assert(thiefStats.some((stat) => stat.kind === 'pollen' && stat.label === 'Steals'), 'Pollen Thief Moth inspect stats should show stolen resource pressure');
const fogStats = inspectStats.getEnemyStats('fogShepherd', { object: 'fogShepherd', hits: 0 }, HW_CONTENT.ENEMY_DEFS.fogShepherd);
assert(fogStats.some((stat) => stat.kind === 'reveal' && stat.label === 'Fog'), 'Fog Shepherd inspect stats should show refog pressure');
const fireStats = inspectStats.getEnemyStats('crawlingFire', { object: 'crawlingFire', hits: 0 }, HW_CONTENT.ENEMY_DEFS.crawlingFire);
assert(fireStats.some((stat) => stat.kind === 'danger' && stat.label === 'Terrain'), 'Crawling Fire inspect stats should show terrain-spread pressure');
const sentinelStats = inspectStats.getEnemyStats('waxSentinel', { object: 'waxSentinel', hits: 0 }, HW_CONTENT.ENEMY_DEFS.waxSentinel);
assert(sentinelStats.some((stat) => stat.kind === 'attack' && stat.label === 'Core'), 'Wax Sentinel inspect stats should show weak-core timing');

console.log('Data smoke checks passed');
