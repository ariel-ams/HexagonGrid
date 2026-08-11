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
        });
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

console.log('Data smoke checks passed');
