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

const { HW_CONTENT, HW_ART, HW_PROGRESSION } = sandbox.window;
const languageIds = ['en', 'es-419'];

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
    profile.itemWeights.forEach((entry) => {
        assert(entry.weight > 0, `Room ${profile.depth} has non-positive weight for ${entry.object}`);
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

Object.entries(HW_CONTENT.OBJECTS).forEach(([objectId, object]) => {
    assert(object.name && object.description, `Object ${objectId} needs name and description`);
    assert(/^#[0-9a-f]{6}$/i.test(object.color), `Object ${objectId} needs a hex color`);
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
Object.values(HW_CONTENT.EQUIPMENT_DEFS).forEach((equipment) => {
    assert(slotIds.has(equipment.slot), `Equipment ${equipment.id} uses unknown slot ${equipment.slot}`);
});

Object.entries(HW_CONTENT.SPRITE_DEFS)
    .filter(([, definition]) => definition.src)
    .forEach(([, definition]) => assertFile(definition.src));

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

console.log('Data smoke checks passed');
