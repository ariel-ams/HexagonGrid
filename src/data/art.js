// Shared visual asset metadata for Honeycomb Wayfinder.
(() => {
const UI_ART_DEFS = {
    boardBackground: 'assets/ui/forest-board-bg.webp'
};

const TILE_ART_DEFS = {
    empty: 'assets/tiles/hex-empty.png',
    visited: 'assets/tiles/hex-visited.png',
    hidden: 'assets/tiles/hex-hidden.png',
    path: 'assets/tiles/hex-path.png',
    exit: 'assets/tiles/alpha/hex-exit.png',
    danger: 'assets/tiles/hex-danger.png',
    pickableBorder: 'assets/tiles/hex-pickable-border.png',
    enemyBorder: 'assets/tiles/hex-enemy-border.png'
};

const THEME_TILE_SHEET_DEFS = {
    forest: 'assets/tiles/themes/forest-surroundings.png',
    cave: 'assets/tiles/themes/cave-surroundings.png',
    waspHive: 'assets/tiles/themes/wasp-hive-surroundings.png',
    underground: 'assets/tiles/themes/underground-surroundings.png'
};

const HUD_ICON_ROWS = {
    health: 0,
    shield: 1,
    stamina: 2,
    level: 3,
    objective: 4,
    room: 4,
    pollen: 5,
    water: 6,
    honey: 7,
    sting: 8,
    attackCooldown: 8,
    danger: 9,
    replay: 10,
    pause: 11,
    close: 12
};

window.HW_ART = {
    UI_ART_DEFS,
    TILE_ART_DEFS,
    THEME_TILE_SHEET_DEFS,
    HUD_ICON_ROWS
};
})();
