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

assert(HW_CONTENT?.OBJECTS, 'HW_CONTENT.OBJECTS was not registered');
assert(HW_CONTENT?.SPRITE_DEFS, 'HW_CONTENT.SPRITE_DEFS was not registered');
assert(HW_ART?.UI_ART_DEFS, 'HW_ART.UI_ART_DEFS was not registered');
assert(HW_ART?.TILE_ART_DEFS, 'HW_ART.TILE_ART_DEFS was not registered');
assert(HW_ART?.HUD_ICON_ROWS, 'HW_ART.HUD_ICON_ROWS was not registered');
assert(HW_PROGRESSION?.ROOM_PROFILES?.length >= 5, 'Expected at least 5 room profiles');
assert(HW_PROGRESSION?.XP_REWARDS?.room > 0, 'Room XP reward must be positive');

Object.values(HW_ART.UI_ART_DEFS).forEach(assertFile);
Object.values(HW_ART.TILE_ART_DEFS).forEach(assertFile);
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

Object.entries(HW_CONTENT.SPRITE_DEFS)
    .filter(([, definition]) => definition.src)
    .forEach(([, definition]) => assertFile(definition.src));

console.log('Data smoke checks passed');
