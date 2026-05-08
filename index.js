const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statsPanel = document.getElementById('statsPanel');
const logPanel = document.getElementById('logPanel');
const statsToggle = document.getElementById('statsToggle');
const logToggle = document.getElementById('logToggle');
const statsNode = document.getElementById('stats');
const statsHudNode = document.getElementById('statsHud');
const timerHudNode = document.getElementById('timerHud');
const eventToastNode = document.getElementById('eventToast');
const logListNode = document.getElementById('logList');
const turnTextNode = document.getElementById('turnText');
const restartButton = document.getElementById('restartButton');
const cooldownWidget = document.getElementById('cooldownWidget');
const cooldownText = document.getElementById('cooldownText');
const cooldownHint = document.getElementById('cooldownHint');
const startScreen = document.getElementById('startScreen');
const newRunButton = document.getElementById('newRunButton');
const testDanceButton = document.getElementById('testDanceButton');
const optionsButton = document.getElementById('optionsButton');
const optionsPanel = document.getElementById('optionsPanel');
const languageSelect = document.getElementById('languageSelect');
const menuLanguageSelect = document.getElementById('menuLanguageSelect');
const objectEditorSelect = document.getElementById('objectEditorSelect');
const objectEditorFields = document.getElementById('objectEditorFields');
const saveObjectButton = document.getElementById('saveObjectButton');
const resetObjectButton = document.getElementById('resetObjectButton');
const relicScreen = document.getElementById('relicScreen');
const relicChoicesNode = document.getElementById('relicChoices');
const relicListNode = document.getElementById('relicList');
const campScreen = document.getElementById('campScreen');
const campActionsNode = document.getElementById('campActions');
const campContinueButton = document.getElementById('campContinueButton');
const endScreen = document.getElementById('endScreen');
const endStatsNode = document.getElementById('endStats');
const endRestartButton = document.getElementById('endRestartButton');
const endReplayButton = document.getElementById('endReplayButton');
const endMenuButton = document.getElementById('endMenuButton');
const replayControls = document.getElementById('replayControls');
const replayPauseButton = document.getElementById('replayPauseButton');
const replayCloseButton = document.getElementById('replayCloseButton');
const replaySpeedButtons = [...document.querySelectorAll('.replay-speed')];

const HEX_RADIUS = 4;
const VISIBLE_RADIUS = 4;
const DUNGEON_CELL_TARGET = 154;
const FINAL_ROOM = 5;
const BAT_ATTACK_MS = 1000;
const BAT_ATTACK_DAMAGE = 6;
const WASP_AURA_MS = 500;
const WASP_AURA_DAMAGE = 1;
const VINE_DAMAGE = 1;
const MITE_MOVE_STEP_INTERVAL = 2;
const BASE_ATTACK_COOLDOWN_MS = 1200;
const MIN_ATTACK_COOLDOWN_MS = 300;
const MAX_STAMINA = 6;
const MAX_SHIELD = 5;
const STAMINA_REGEN_MS = 900;
const REPLAY_STEP_MS = 520;
const BASE_XP_TO_LEVEL = 24;
const GAMEPLAY_MUSIC_SRC = 'assets/main_song.mp3';
const DANCE_MUSIC_SRC = 'assets/dancefloor.mp3';
const GAMEPLAY_MUSIC_VOLUME = 0.45;
const DANCE_MUSIC_VOLUME = 0.56;
const DANCE_MISS_VOLUME = 0.18;
const DANCE_MUSIC_START_AT = 48;
const HEX_DIRECTIONS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
];

const ROOM_PROFILES = [
    {
        depth: 1,
        targetCells: 54,
        safeRadius: 3,
        maxEnemies: 1,
        maxHazards: 0,
        maxSpecialItems: 0,
        allowedEnemies: ['enemy'],
        allowedDiscovery: [],
        allowedUtility: [],
        itemWeights: [
            { object: 'empty', weight: 55 },
            { object: 'pollen', weight: 22 },
            { object: 'water', weight: 18 },
            { object: 'upgrade', weight: 5 }
        ]
    },
    {
        depth: 2,
        targetCells: 78,
        safeRadius: 2,
        maxEnemies: 2,
        maxHazards: 2,
        maxSpecialItems: 2,
        allowedEnemies: ['enemy', 'thornBeetle'],
        allowedDiscovery: ['honeyDrop', 'glowPollen'],
        allowedUtility: ['npc', 'upgrade'],
        itemWeights: [
            { object: 'empty', weight: 38 },
            { object: 'pollen', weight: 18 },
            { object: 'water', weight: 18 },
            { object: 'upgrade', weight: 9 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 5 },
            { object: 'discovery', weight: 7 }
        ]
    },
    {
        depth: 3,
        targetCells: 108,
        safeRadius: 2,
        maxEnemies: 4,
        maxHazards: 4,
        maxSpecialItems: 4,
        allowedEnemies: ['enemy', 'thornBeetle', 'miteSwarm', 'bat'],
        allowedDiscovery: ['honeyDrop', 'glowPollen', 'stingUpgrade', 'cleanWater'],
        allowedUtility: ['npc', 'upgrade', 'stingUpgrade'],
        itemWeights: [
            { object: 'empty', weight: 30 },
            { object: 'pollen', weight: 15 },
            { object: 'water', weight: 15 },
            { object: 'upgrade', weight: 8 },
            { object: 'stingUpgrade', weight: 6 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 7 },
            { object: 'discovery', weight: 10 },
            { object: 'enemy', weight: 4 }
        ]
    },
    {
        depth: 4,
        targetCells: 132,
        safeRadius: 2,
        maxEnemies: 7,
        maxHazards: 7,
        maxSpecialItems: 7,
        allowedEnemies: ['enemy', 'thornBeetle', 'miteSwarm', 'bat', 'guardWasp', 'sleepingBat', 'waxMoth', 'fogMoth', 'honeyLeech'],
        allowedDiscovery: ['honeyDrop', 'glowPollen', 'cleanWater', 'smokePuff', 'flowerMap', 'compassPollen', 'nectarCache', 'waxDoor', 'stickyHoney'],
        allowedUtility: ['npc', 'upgrade', 'stingUpgrade'],
        itemWeights: [
            { object: 'empty', weight: 26 },
            { object: 'pollen', weight: 12 },
            { object: 'water', weight: 12 },
            { object: 'upgrade', weight: 7 },
            { object: 'stingUpgrade', weight: 6 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 8 },
            { object: 'discovery', weight: 14 },
            { object: 'enemy', weight: 10 }
        ]
    },
    {
        depth: 5,
        targetCells: DUNGEON_CELL_TARGET,
        safeRadius: 2,
        maxEnemies: 10,
        maxHazards: 9,
        maxSpecialItems: 9,
        allowedEnemies: ['enemy', 'thornBeetle', 'miteSwarm', 'bat', 'guardWasp', 'sleepingBat', 'waxMoth', 'fogMoth', 'honeyLeech', 'broodWasp', 'stagBeetle', 'falseFlower'],
        allowedDiscovery: ['honeyDrop', 'glowPollen', 'cleanWater', 'smokePuff', 'sunShard', 'flowerMap', 'royalNectar', 'compassPollen', 'nectarCache', 'waxDoor', 'stickyHoney'],
        allowedUtility: ['npc', 'upgrade', 'stingUpgrade'],
        itemWeights: [
            { object: 'empty', weight: 24 },
            { object: 'pollen', weight: 10 },
            { object: 'water', weight: 10 },
            { object: 'upgrade', weight: 6 },
            { object: 'stingUpgrade', weight: 6 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 9 },
            { object: 'discovery', weight: 15 },
            { object: 'enemy', weight: 15 }
        ]
    }
];

const LANGUAGE_STORAGE_KEY = 'honeycombLanguage';
const OBJECT_EDITOR_STORAGE_KEY = 'honeycombObjectOverrides';
const PROGRESSION_STORAGE_KEY = 'honeycombProgression';
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
let objectOverrides = loadObjectOverrides();
let progression = loadProgression();

const {
    I18N,
    RELICS,
    SPRITE_DEFS,
    ENEMY_DEFS,
    OBJECTS,
    DEFAULT_OBJECT_COLORS,
    DEFAULT_ENEMY_NUMBERS,
    DISCOVERY_OBJECT_WEIGHTS,
    ENEMY_SPAWN_WEIGHTS
} = window.HW_CONTENT;

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
const uiArtAssets = {};
const tileArtAssets = {};
const spriteAssets = {};
let spriteFrames = {};
let spritesReady = false;
loadUiArt();
loadTileArt();
loadSprites();

const hudRenderer = window.HW_HUD.createHudRenderer({
    statsNode: statsHudNode,
    timerNode: timerHudNode,
    spriteDefs: SPRITE_DEFS,
    escapeHtml,
    escapeAttr
});

let itemSystem = null;
let enemySystem = null;
let danceSystem = null;
let replaySpeed = 1;
const audioSystem = window.HW_AUDIO.createAudioSystem({
    tracks: {
        gameplay: {
            src: GAMEPLAY_MUSIC_SRC,
            volume: GAMEPLAY_MUSIC_VOLUME,
            loop: true
        },
        dance: {
            src: DANCE_MUSIC_SRC,
            volume: DANCE_MUSIC_VOLUME,
            startAt: DANCE_MUSIC_START_AT,
            loopFrom: DANCE_MUSIC_START_AT
        }
    }
});

const OBJECT_UNLOCK_LEVELS = {
    empty: 1,
    entry: 1,
    exit: 1,
    finalExit: 1,
    wall: 1,
    pollen: 1,
    water: 1,
    upgrade: 1,
    enemy: 1,
    npc: 2,
    vine: 2,
    thornBeetle: 2,
    honeyDrop: 2,
    glowPollen: 2,
    stingUpgrade: 3,
    bat: 3,
    miteSwarm: 3,
    cleanWater: 3,
    nectarCache: 3,
    compassPollen: 3,
    stickyHoney: 3,
    waxDoor: 3,
    smokePuff: 4,
    flowerMap: 4,
    guardWasp: 4,
    sleepingBat: 4,
    waxMoth: 4,
    fogMoth: 4,
    honeyLeech: 4,
    royalNectar: 5,
    sunShard: 5,
    broodWasp: 5,
    stagBeetle: 5,
    falseFlower: 5
};

const XP_REWARDS = {
    item: 3,
    specialItem: 7,
    enemy: 12,
    room: 24,
    objective: 10,
    danceStep: 1,
    danceMove: 5
};

const ROOM_OBJECTIVES = [
    {
        id: 'findExit',
        minDepth: 1,
        label: { en: 'Reach the exit', 'es-419': 'Llega a la salida' },
        hint: { en: 'The exit is visible. Plan a route and step onto it.', 'es-419': 'La salida está visible. Planea una ruta y pisa esa celda.' },
        isComplete: () => game.objectiveProgress.exitReached
    },
    {
        id: 'collectTwo',
        minDepth: 1,
        label: { en: 'Collect 2 supplies', 'es-419': 'Junta 2 suministros' },
        hint: { en: 'Pollen and water fuel camp choices.', 'es-419': 'El polen y el agua activan opciones de campamento.' },
        isComplete: () => game.objectiveProgress.supplies >= 2
    },
    {
        id: 'keepShield',
        minDepth: 2,
        label: { en: 'Reach the exit with shield', 'es-419': 'Llega a la salida con escudo' },
        hint: { en: 'Shield blocks the next mistake.', 'es-419': 'El escudo bloquea el próximo error.' },
        isComplete: () => game.objectiveProgress.exitReached && game.player.upgrades > 0
    },
    {
        id: 'avoidDamage',
        minDepth: 2,
        label: { en: 'Avoid damage this room', 'es-419': 'Evita daño en esta sala' },
        hint: { en: 'Leave danger rings before timers fill.', 'es-419': 'Sal de los anillos de peligro antes de que se llenen.' },
        isComplete: () => game.objectiveProgress.exitReached && !game.objectiveProgress.tookDamage
    },
    {
        id: 'defeatEnemy',
        minDepth: 3,
        label: { en: 'Defeat 1 enemy', 'es-419': 'Derrota 1 enemigo' },
        hint: { en: 'Sting, retreat, then sting again if needed.', 'es-419': 'Pica, retrocede y vuelve a picar si hace falta.' },
        isComplete: () => game.objectiveProgress.kills >= 1
    }
];

const DISCOVERY_CALLOUT_OBJECTS = new Set([
    'enemy',
    'bat',
    'miteSwarm',
    'thornBeetle',
    'fogMoth',
    'waxMoth',
    'broodWasp',
    'stagBeetle',
    'falseFlower',
    'guardWasp',
    'sleepingBat',
    'honeyLeech',
    'vine',
    'npc',
    'upgrade',
    'stingUpgrade',
    'glowPollen',
    'cleanWater',
    'smokePuff',
    'flowerMap',
    'compassPollen',
    'waxDoor',
    'stickyHoney',
    'finalExit'
]);

const game = {
    cells: [],
    logs: [],
    roomStack: [],
    roomDepth: 1,
    entryCell: null,
    exitCell: null,
    statPopups: [],
    hover: null,
    runStartedAt: 0,
    ended: false,
    mode: 'dungeon',
    dance: null,
    playerMotion: null,
    runSeed: 1,
    rngState: 1,
    replayEvents: [],
    replay: null,
    cameraPan: { x: 0, y: 0 },
    pointer: null,
    dragAction: null,
    suppressNextClick: false,
    lastStaminaRegenAt: 0,
    relics: [],
    relicChoices: [],
    pendingNextRoomReason: null,
    campBuffs: {},
    campRelicRerolls: 0,
    claimedRelicRooms: [],
    marketCell: null,
    marketChoices: [],
    nextRoomPreview: null,
    roomObjective: null,
    objectiveProgress: {
        supplies: 0,
        kills: 0,
        tookDamage: false,
        exitSeen: false,
        rewarded: false
    },
    lastDamageSource: null,
    deathTip: '',
    danceFeedback: [],
    revealRadius: 2,
    roomFirstStingAvailable: false,
    freeWaxDoorAvailable: false,
    foragerPouchCollected: { pollen: false, water: false },
    royalJellyPollen: 0,
    currentRoomCells: [],
    roomProfile: ROOM_PROFILES[0],
    roomSpawnCounts: {
        enemies: 0,
        hazards: 0,
        specialItems: 0
    },
    runStats: {
        kills: 0,
        pollen: 0,
        water: 0,
        honey: 0,
        xp: 0
    },
    player: {
        q: 0,
        r: 0,
        health: 7,
        maxHealth: 7,
        pollen: 0,
        water: 0,
        honey: 0,
        upgrades: 1,
        maxShield: MAX_SHIELD,
        stingCharges: 0,
        batHits: 0,
        steps: 0,
        stamina: MAX_STAMINA,
        maxStamina: MAX_STAMINA,
        attackCooldownMs: BASE_ATTACK_COOLDOWN_MS,
        attackReadyAt: 0,
        attackAnimationUntil: 0
    },
    message: 'The scout starts at the center. Click a glowing neighbor to move.'
};

itemSystem = window.HW_ITEMS.createItemSystem({
    game,
    objects: OBJECTS,
    helpers: {
        minAttackCooldownMs: MIN_ATTACK_COOLDOWN_MS,
        getAttackCooldownRemaining,
        hasRelic,
        healPlayer,
        getPlayerMaxHealth,
        revealAround,
        pauseEnemyTimers,
        revealRouteToExit,
        revealExitHint,
        slowNearbyEnemies,
        isEnemyObject
    }
});

enemySystem = window.HW_ENEMIES.createEnemySystem({
    game,
    enemyDefs: ENEMY_DEFS,
    directions: HEX_DIRECTIONS,
    helpers: {
        addLog,
        addStatPopups,
        applyDamage,
        getCell,
        hexDistance,
        recordReplayEvent,
        seededRandom
    }
});

danceSystem = window.HW_DANCE.createDanceSystem({
    game,
    helpers: {
        canvas,
        ctx,
        directions: HEX_DIRECTIONS,
        xpRewards: XP_REWARDS,
        getLanguage: () => currentLanguage,
        randomFrom,
        seededRandom,
        getCell,
        hexDistance,
        hexToPixel,
        drawHexPath,
        startPlayerMotion,
        awardXp,
        addLog,
        recordReplayEvent,
        showTutorialCallout,
        audio: audioSystem,
        endRun,
        draw
    }
});

function t(section, key) {
    return I18N[currentLanguage]?.[section]?.[key] ?? I18N.en[section]?.[key] ?? key;
}

function loadObjectOverrides() {
    try {
        return JSON.parse(localStorage.getItem(OBJECT_EDITOR_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveObjectOverrides() {
    localStorage.setItem(OBJECT_EDITOR_STORAGE_KEY, JSON.stringify(objectOverrides));
}

function setLanguage(language) {
    if (!I18N[language]) {
        language = 'en';
    }
    currentLanguage = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    languageSelect.value = language;
    menuLanguageSelect.value = language;
    localizeGameData();
    renderStaticText();
    renderObjectEditor();
    renderRelics();
    renderStats();
    renderCooldown();
    renderLog();
    renderMessage();
    draw();
}

function localizeGameData() {
    Object.entries(I18N[currentLanguage].objects).forEach(([id, [name, description]]) => {
        if (OBJECTS[id]) {
            OBJECTS[id].name = name;
            OBJECTS[id].description = description;
            OBJECTS[id].color = DEFAULT_OBJECT_COLORS[id] || OBJECTS[id].color;
        }
    });

    Object.entries(I18N[currentLanguage].enemies).forEach(([id, [name, behavior, lesson]]) => {
        if (ENEMY_DEFS[id]) {
            ENEMY_DEFS[id].name = name;
            ENEMY_DEFS[id].behavior = behavior;
            ENEMY_DEFS[id].lesson = lesson;
            Object.assign(ENEMY_DEFS[id], DEFAULT_ENEMY_NUMBERS[id]);
            ENEMY_DEFS[id].color = DEFAULT_OBJECT_COLORS[id] || ENEMY_DEFS[id].color;
        }
        if (OBJECTS[id]) {
            OBJECTS[id].name = name;
            OBJECTS[id].description = behavior;
        }
    });

    Object.entries(I18N[currentLanguage].relics).forEach(([id, [name, description]]) => {
        const relic = RELICS.find((item) => item.id === id);
        if (relic) {
            relic.name = name;
            relic.description = description;
        }
    });

    applyObjectOverrides();
}

function applyObjectOverrides() {
    Object.entries(objectOverrides).forEach(([id, override]) => {
        if (OBJECTS[id]) {
            if (override.name) OBJECTS[id].name = override.name;
            if (override.description) OBJECTS[id].description = override.description;
            if (override.color) OBJECTS[id].color = override.color;
        }
        if (ENEMY_DEFS[id]) {
            if (override.name) ENEMY_DEFS[id].name = override.name;
            if (override.description) {
                ENEMY_DEFS[id].behavior = override.description;
                if (OBJECTS[id]) OBJECTS[id].description = override.description;
            }
            if (override.color) {
                ENEMY_DEFS[id].color = override.color;
                if (OBJECTS[id]) OBJECTS[id].color = override.color;
            }
            ['hp', 'attack', 'range', 'intervalMs'].forEach((field) => {
                if (Number.isFinite(override[field])) {
                    ENEMY_DEFS[id][field] = override[field];
                }
            });
        }
    });
}

function renderStaticText() {
    document.documentElement.lang = currentLanguage === 'es-419' ? 'es-419' : 'en';
    document.title = t('ui', 'title');
    document.querySelectorAll('[data-i18n]').forEach((node) => {
        node.textContent = t('ui', node.dataset.i18n);
    });
}

function getEditableObjectIds() {
    return Object.keys(OBJECTS).filter((id) => id !== 'empty' && id !== 'entry' && id !== 'finalExit');
}

function renderObjectEditorOptions() {
    objectEditorSelect.innerHTML = getEditableObjectIds().map((id) => (
        `<option value="${id}">${OBJECTS[id].name}</option>`
    )).join('');
}

function renderObjectEditor() {
    const selected = objectEditorSelect.value;
    renderObjectEditorOptions();
    const id = selected && OBJECTS[selected] ? selected : getEditableObjectIds()[0];
    objectEditorSelect.value = id;
    const object = OBJECTS[id];
    const enemy = ENEMY_DEFS[id];
    const override = objectOverrides[id] || {};

    objectEditorFields.innerHTML = `
        <label>
            <span>${t('ui', 'name')}</span>
            <input id="editorName" value="${escapeAttr(override.name ?? object.name)}">
        </label>
        <label>
            <span>${t('ui', 'color')}</span>
            <input id="editorColor" type="color" value="${override.color ?? object.color}">
        </label>
        <label class="wide">
            <span>${t('ui', 'description')}</span>
            <textarea id="editorDescription">${escapeHtml(override.description ?? object.description)}</textarea>
        </label>
        ${enemy ? `
            <label>
                <span>${t('ui', 'hp')}</span>
                <input id="editorHp" type="number" min="1" max="20" step="1" value="${override.hp ?? enemy.hp}">
            </label>
            <label>
                <span>${t('ui', 'attack')}</span>
                <input id="editorAttack" type="number" min="0" max="50" step="1" value="${override.attack ?? enemy.attack}">
            </label>
            <label>
                <span>${t('ui', 'range')}</span>
                <input id="editorRange" type="number" min="1" max="5" step="1" value="${override.range ?? enemy.range}">
            </label>
            <label>
                <span>${t('ui', 'intervalMs')}</span>
                <input id="editorInterval" type="number" min="100" max="5000" step="50" value="${override.intervalMs ?? enemy.intervalMs}">
            </label>
        ` : ''}
    `;
}

function saveObjectEditor() {
    const id = objectEditorSelect.value;
    const enemy = ENEMY_DEFS[id];
    const override = {
        name: document.getElementById('editorName').value.trim(),
        description: document.getElementById('editorDescription').value.trim(),
        color: document.getElementById('editorColor').value
    };

    if (enemy) {
        override.hp = Number(document.getElementById('editorHp').value);
        override.attack = Number(document.getElementById('editorAttack').value);
        override.range = Number(document.getElementById('editorRange').value);
        override.intervalMs = Number(document.getElementById('editorInterval').value);
    }

    objectOverrides[id] = override;
    saveObjectOverrides();
    localizeGameData();
    renderObjectEditor();
    addLog(t('ui', 'objectEditor'), `${OBJECTS[id].name}: ${t('ui', 'saved')}.`);
}

function resetObjectEditor() {
    const id = objectEditorSelect.value;
    delete objectOverrides[id];
    saveObjectOverrides();
    localizeGameData();
    renderObjectEditor();
    addLog(t('ui', 'objectEditor'), `${OBJECTS[id].name}: ${t('ui', 'reset')}.`);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

function escapeAttr(value) {
    return escapeHtml(value).replaceAll('"', '&quot;');
}

function randomObjectFor(q, r, entryCell, exitCell) {
    if (q === entryCell.q && r === entryCell.r) {
        return 'entry';
    }

    if (q === exitCell.q && r === exitCell.r) {
        return game.roomDepth >= FINAL_ROOM ? 'finalExit' : 'exit';
    }

    if (q === 0 && r === 0) {
        return 'empty';
    }

    const profile = getRoomProfile();
    const distance = hexDistance(entryCell.q, entryCell.r, q, r);
    if (distance <= profile.safeRadius) {
        if (game.roomDepth === 1) {
            return 'empty';
        }
        return chooseWeightedObject([
            { object: 'empty', weight: 48 },
            { object: 'pollen', weight: 25 },
            { object: 'water', weight: 22 },
            { object: 'upgrade', weight: profile.allowedUtility.includes('upgrade') ? 5 : 0 }
        ], 'empty');
    }

    let object = chooseWeightedObject(profile.itemWeights, 'empty');
    if (object === 'enemy') {
        object = chooseEnemyObject();
    } else if (object === 'discovery') {
        object = chooseDiscoveryObject();
    }

    return registerRoomSpawn(object);
}

function chooseDiscoveryObject() {
    const profile = getRoomProfile();
    const options = DISCOVERY_OBJECT_WEIGHTS
        .filter((option) => (
            profile.allowedDiscovery.includes(option.object)
            && getObjectUnlockLevel(option.object) <= getPlayerLevel()
        ))
        .map((option) => ({ object: option.object, weight: option.weight }));
    return chooseWeightedObject(options, 'pollen');
}

function loadProgression() {
    try {
        return {
            lifetimePollen: 0,
            lifetimeHoney: 0,
            xp: 0,
            level: 1,
            bestRoom: 1,
            encyclopedia: [],
            tutorialsSeen: [],
            ...JSON.parse(localStorage.getItem(PROGRESSION_STORAGE_KEY) || '{}')
        };
    } catch {
        return {
            lifetimePollen: 0,
            lifetimeHoney: 0,
            xp: 0,
            level: 1,
            bestRoom: 1,
            encyclopedia: [],
            tutorialsSeen: []
        };
    }
}

function saveProgression() {
    localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progression));
}

function startGameplayMusic() {
    audioSystem.play('gameplay');
}

function stopGameplayMusic() {
    audioSystem.stop('gameplay');
}

function stopAllMusic() {
    audioSystem.stopAll();
}

function seededRandom() {
    game.rngState = (game.rngState * 1664525 + 1013904223) >>> 0;
    return game.rngState / 4294967296;
}

function chooseEnemyObject() {
    const depth = game.roomDepth;
    const profile = getRoomProfile();
    const options = ENEMY_SPAWN_WEIGHTS
        .filter((option) => (
            depth >= option.minDepth
            && profile.allowedEnemies.includes(option.object)
            && getObjectUnlockLevel(option.object) <= getPlayerLevel()
        ))
        .map((option) => ({ object: option.object, weight: option.weight }));

    return chooseWeightedObject(options, 'enemy');
}

function getObjectUnlockLevel(object) {
    return OBJECT_UNLOCK_LEVELS[object] || 1;
}

function getPlayerLevel() {
    return Math.max(1, Number(progression.level) || 1);
}

function getXpForNextLevel(level = getPlayerLevel()) {
    return Math.round(BASE_XP_TO_LEVEL + Math.pow(level, 1.7) * 18);
}

function getRoomProfile() {
    const depthGate = Math.max(1, Math.ceil(getPlayerLevel() / 2));
    const targetDepth = Math.min(game.roomDepth, depthGate, ROOM_PROFILES[ROOM_PROFILES.length - 1].depth);
    return ROOM_PROFILES
        .slice()
        .reverse()
        .find((profile) => profile.depth <= targetDepth) || ROOM_PROFILES[0];
}

function registerRoomSpawn(object) {
    const profile = getRoomProfile();
    if (isEnemyObject(object)) {
        if (game.roomSpawnCounts.enemies >= profile.maxEnemies) {
            return 'empty';
        }
        game.roomSpawnCounts.enemies += 1;
        return object;
    }

    if (object === 'vine' || object === 'waxDoor') {
        if (game.roomSpawnCounts.hazards >= profile.maxHazards || getObjectUnlockLevel(object) > getPlayerLevel()) {
            return 'empty';
        }
        game.roomSpawnCounts.hazards += 1;
        return object;
    }

    if (profile.allowedDiscovery.includes(object)) {
        if (game.roomSpawnCounts.specialItems >= profile.maxSpecialItems || getObjectUnlockLevel(object) > getPlayerLevel()) {
            return 'empty';
        }
        game.roomSpawnCounts.specialItems += 1;
        return object;
    }

    if (object === 'npc') {
        if (!profile.allowedUtility.includes(object)) {
            return 'empty';
        }
        const traderCount = game.cells.filter((cell) => cell.object === 'npc').length;
        return traderCount >= 1 ? 'empty' : object;
    }

    if (['stingUpgrade'].includes(object) && !profile.allowedUtility.includes(object)) {
        return 'empty';
    }

    return getObjectUnlockLevel(object) <= getPlayerLevel() ? object : 'empty';
}

function awardXp(amount, source, options = {}) {
    const value = Math.max(0, Math.round(amount));
    if (!value) return;

    progression.xp = Math.max(0, Number(progression.xp) || 0) + value;
    game.runStats.xp += value;
    let leveled = false;
    const unlocked = [];

    while (progression.xp >= getXpForNextLevel()) {
        progression.xp -= getXpForNextLevel();
        const previousLevel = getPlayerLevel();
        progression.level = getPlayerLevel() + 1;
        unlocked.push(...getUnlocksForLevel(previousLevel, progression.level));
        leveled = true;
    }

    saveProgression();
    if (leveled) {
        const message = currentLanguage === 'es-419'
            ? `La abeja subiÃ³ al nivel ${progression.level}. Nuevos peligros pueden aparecer.`
            : `Bee reached level ${progression.level}. New threats can start appearing.`;
        const unlockedNames = unlocked.map(getDisplayNameForObject);
        addLog(currentLanguage === 'es-419' ? 'Nivel' : 'Level Up', message);
        addWarningPopup(game.player.q, game.player.r, `LV ${progression.level}${unlockedNames.length ? `: ${unlockedNames.slice(0, 2).join(', ')}` : ''}`);
        unlockedNames.slice(0, 3).forEach((name) => {
            addLog(currentLanguage === 'es-419' ? 'Desbloqueo' : 'Unlocked', name);
        });
    } else if (!options.silent && source) {
        addLog(currentLanguage === 'es-419' ? 'Experiencia' : 'Experience', `+${value} XP: ${source}`);
    }
}

function getUnlocksForLevel(previousLevel, newLevel) {
    return Object.entries(OBJECT_UNLOCK_LEVELS)
        .filter(([, level]) => level > previousLevel && level <= newLevel)
        .map(([object]) => object)
        .filter((object) => !['empty', 'entry', 'exit', 'finalExit'].includes(object));
}

function getDisplayNameForObject(object) {
    return ENEMY_DEFS[object]?.name || OBJECTS[object]?.name || object;
}

function chooseWeightedObject(options, fallback) {
    const weightedOptions = options.filter((option) => option.weight > 0);
    const total = weightedOptions.reduce((sum, option) => sum + option.weight, 0);
    if (total <= 0) {
        return fallback;
    }
    let roll = seededRandom() * total;

    for (const option of weightedOptions) {
        roll -= option.weight;
        if (roll <= 0) {
            return option.object;
        }
    }

    return fallback;
}

function createGrid() {
    startGameplayMusic();
    startScreen.classList.add('hidden');
    startRunState();
    generateRoom('restart');
}

function startRunState() {
    game.logs = [];
    game.roomStack = [];
    game.roomDepth = 1;
    game.runStartedAt = performance.now();
    game.ended = false;
    game.mode = 'dungeon';
    game.runSeed = Date.now() >>> 0;
    game.rngState = game.runSeed;
    game.replayEvents = [];
    game.replay = null;
    game.cameraPan = { x: 0, y: 0 };
    game.pointer = null;
    game.dragAction = null;
    hudRenderer.reset();
    game.suppressNextClick = false;
    game.lastStaminaRegenAt = performance.now();
    game.dance = null;
    game.playerMotion = null;
    game.relics = [];
    game.relicChoices = [];
    game.pendingNextRoomReason = null;
    game.campBuffs = {};
    game.campRelicRerolls = 0;
    game.claimedRelicRooms = [];
    game.marketCell = null;
    game.marketChoices = [];
    game.nextRoomPreview = null;
    game.roomObjective = null;
    game.objectiveProgress = createObjectiveProgress();
    game.lastDamageSource = null;
    game.deathTip = '';
    game.danceFeedback = [];
    game.revealRadius = 2;
    game.roomFirstStingAvailable = false;
    game.freeWaxDoorAvailable = false;
    game.foragerPouchCollected = { pollen: false, water: false };
    game.royalJellyPollen = 0;
    game.currentRoomCells = [];
    game.roomProfile = ROOM_PROFILES[0];
    game.roomSpawnCounts = {
        enemies: 0,
        hazards: 0,
        specialItems: 0
    };
    game.runStats = {
        kills: 0,
        pollen: 0,
        water: 0,
        honey: 0,
        xp: 0
    };
    game.player = createFreshPlayer();
    relicScreen.classList.remove('visible');
    campScreen.classList.remove('visible');
    endScreen.classList.remove('visible');
    replayControls.classList.remove('visible');
    renderRelics();
}

function testDanceRun() {
    stopAllMusic();
    startScreen.classList.add('hidden');
    startRunState();
    game.roomDepth = FINAL_ROOM;
    generateDanceRoom();
}

function showMainMenu() {
    stopAllMusic();
    game.ended = true;
    game.mode = 'menu';
    game.dance = null;
    game.playerMotion = null;
    relicScreen.classList.remove('visible');
    campScreen.classList.remove('visible');
    endScreen.classList.remove('visible');
    startScreen.classList.remove('hidden');
    renderMessage();
}

function createFreshPlayer() {
    return {
        q: 0,
        r: 0,
        health: 7,
        maxHealth: 7,
        pollen: 0,
        water: 0,
        honey: 0,
        upgrades: 1,
        maxShield: MAX_SHIELD,
        stingCharges: 0,
        batHits: 0,
        steps: 0,
        stamina: MAX_STAMINA,
        maxStamina: MAX_STAMINA,
        attackCooldownMs: BASE_ATTACK_COOLDOWN_MS,
        attackReadyAt: 0,
        attackAnimationUntil: 0
    };
}

function generateRoom(reason) {
    if (game.roomDepth >= FINAL_ROOM) {
        generateDanceRoom();
        return;
    }

    game.mode = 'dungeon';
    game.dance = null;
    game.cells = [];
    game.statPopups = [];
    game.danceFeedback = [];
    game.cameraPan = { x: 0, y: 0 };
    game.roomProfile = getRoomProfile();
    game.roomObjective = chooseRoomObjective();
    game.objectiveProgress = createObjectiveProgress();
    game.freeWaxDoorAvailable = false;
    game.foragerPouchCollected = { pollen: false, water: false };
    game.roomSpawnCounts = {
        enemies: 0,
        hazards: 0,
        specialItems: 0
    };
    game.currentRoomCells = generateCaveBlob(game.roomProfile.targetCells);
    const portals = choosePortalCells(game.currentRoomCells);
    game.entryCell = portals.entry;
    game.exitCell = portals.exit;
    game.player.q = game.entryCell.q;
    game.player.r = game.entryCell.r;
    game.message = 'A new chamber opens. Find the exit.';

    game.currentRoomCells.forEach(({ q, r }) => {
        game.cells.push({
            q,
            r,
            object: randomObjectFor(q, r, game.entryCell, game.exitCell),
            visited: false,
            revealed: false,
            nextAttackAt: 0,
            nextAuraAt: 0,
            hits: 0
        });
    });

    placeFirstRoomTeachingPickups();
    placeRoomLessonGate();
    revealExitCell();
    placeTeachingEnemy();
    placeBats();
    const startCell = getCell(game.player.q, game.player.r);
    if (startCell) startCell.visited = true;
    runRelicHook('onRoomStart');
    applyCampRoomBuffs();
    revealAroundPlayer();
    updateObjectiveProgress();

    if (reason === 'restart') {
        addLog('Start', 'Scout the dungeon, manage sting cooldown, and use exits to crawl deeper.');
    } else {
        addLog('Exit', `Entered chamber ${game.roomDepth}.`);
    }
    if (game.roomObjective) {
        addLog(currentLanguage === 'es-419' ? 'Objetivo' : 'Objective', getRoomObjectiveText());
    }
    recordReplayEvent('roomStart', { reason, depth: game.roomDepth });
    draw();
}

function createObjectiveProgress() {
    return {
        supplies: 0,
        kills: 0,
        tookDamage: false,
        exitSeen: false,
        exitReached: false,
        rewarded: false
    };
}

function chooseRoomObjective() {
    const options = ROOM_OBJECTIVES.filter((objective) => game.roomDepth >= objective.minDepth);
    if (game.roomDepth === 1) {
        return ROOM_OBJECTIVES.find((objective) => objective.id === 'findExit');
    }
    return randomFrom(options);
}

function getRoomObjectiveText() {
    if (!game.roomObjective) return '';
    const language = currentLanguage === 'es-419' ? 'es-419' : 'en';
    const status = game.roomObjective.isComplete() ? 'OK ' : '';
    return `${status}${game.roomObjective.label[language]} - ${game.roomObjective.hint[language]}`;
}

function updateObjectiveProgress() {
    if (!game.roomObjective || game.objectiveProgress.rewarded) return;
    const exit = game.exitCell ? getCell(game.exitCell.q, game.exitCell.r) : null;
    game.objectiveProgress.exitSeen = Boolean(exit?.revealed);
    if (!game.roomObjective.isComplete()) return;

    game.objectiveProgress.rewarded = true;
    awardXp(XP_REWARDS.objective + game.roomDepth * 2, currentLanguage === 'es-419' ? 'Objetivo de sala' : 'Room objective');
    addWarningPopup(game.player.q, game.player.r, currentLanguage === 'es-419' ? 'Objetivo completo' : 'Objective complete');
}

function generateCaveBlob(targetCount) {
    const cells = new Map();
    const frontier = [{ q: 0, r: 0 }];
    cells.set(cellKey(0, 0), { q: 0, r: 0 });

    while (cells.size < targetCount) {
        const origin = randomFrom(frontier);
        const shuffled = [...HEX_DIRECTIONS].sort(() => seededRandom() - 0.5);

        shuffled.forEach((direction) => {
            if (cells.size >= targetCount) return;
            const q = origin.q + direction.q;
            const r = origin.r + direction.r;
            const key = cellKey(q, r);
            if (cells.has(key)) return;

            const neighborCount = HEX_DIRECTIONS.filter((neighbor) => (
                cells.has(cellKey(q + neighbor.q, r + neighbor.r))
            )).length;
            const acceptance = neighborCount >= 2 ? 0.92 : 0.58;

            if (seededRandom() < acceptance) {
                const cell = { q, r };
                cells.set(key, cell);
                frontier.push(cell);
            }
        });

        if (seededRandom() < 0.12) {
            frontier.push(randomFrom([...cells.values()]));
        }
    }

    return [...cells.values()];
}

function cellKey(q, r) {
    return `${q},${r}`;
}

function choosePortalCells(cells) {
    const centerSorted = [...cells].sort((a, b) => (
        hexDistance(0, 0, b.q, b.r) - hexDistance(0, 0, a.q, a.r)
    ));
    const outerCells = centerSorted.slice(0, Math.max(12, Math.floor(cells.length * 0.22)));
    const entry = randomFrom(outerCells);
    const exit = [...outerCells]
        .filter((cell) => cell !== entry)
        .sort((a, b) => (
            hexDistance(entry.q, entry.r, b.q, b.r) - hexDistance(entry.q, entry.r, a.q, a.r)
        ))[0];
    return {
        entry,
        exit
    };
}

function getAllCoordinates() {
    const coordinates = [];
    for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q++) {
        const rMin = Math.max(-HEX_RADIUS, -q - HEX_RADIUS);
        const rMax = Math.min(HEX_RADIUS, -q + HEX_RADIUS);

        for (let r = rMin; r <= rMax; r++) {
            coordinates.push({ q, r });
        }
    }
    return coordinates;
}

function randomFrom(items) {
    return items[Math.floor(seededRandom() * items.length)];
}

function placeTeachingEnemy() {
    if (game.roomDepth !== 1 || game.roomSpawnCounts.enemies >= game.roomProfile.maxEnemies) {
        return;
    }
    const candidates = game.cells.filter((cell) => (
        cell.object === 'empty'
        && hexDistance(cell.q, cell.r, game.player.q, game.player.r) >= 5
        && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 2
    ));
    if (!candidates.length || seededRandom() > 0.72) return;
    const cell = randomFrom(candidates);
    cell.object = 'enemy';
    game.roomSpawnCounts.enemies += 1;
}

function placeFirstRoomTeachingPickups() {
    if (game.roomDepth !== 1) return;
    const lessons = ['pollen', 'water', 'upgrade'];
    const candidates = game.cells
        .filter((cell) => (
            cell.object === 'empty'
            && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 2
            && !(cell.q === game.player.q && cell.r === game.player.r)
            && !(cell.q === game.exitCell.q && cell.r === game.exitCell.r)
        ))
        .sort((a, b) => (
            hexDistance(a.q, a.r, game.player.q, game.player.r)
            - hexDistance(b.q, b.r, game.player.q, game.player.r)
        ));

    lessons.forEach((object, index) => {
        const cell = candidates[index];
        if (cell) cell.object = object;
    });
}

function placeRoomLessonGate() {
    if (!game.exitCell || game.roomDepth <= 1) return;
    if (game.roomDepth === 2) {
        placeWaxDoorExitGate();
        placeResourceNearPlayer('pollen');
        return;
    }
    if (game.roomDepth === 3) {
        placeEnemyExitGate('enemy');
        placeResourceNearPlayer('pollen');
        return;
    }
    placeMixedExitGate();
}

function revealExitCell() {
    const exit = game.exitCell ? getCell(game.exitCell.q, game.exitCell.r) : null;
    if (exit) {
        exit.revealed = true;
    }
}

function placeWaxDoorExitGate() {
    const neighbors = getExitNeighborCells()
        .filter(isGateCandidateCell)
        .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
    const gate = neighbors[0];
    if (!gate) return;
    gate.object = 'waxDoor';
    game.roomSpawnCounts.hazards += 1;
    neighbors.slice(1, 4).forEach((cell) => {
        if (isGateCandidateCell(cell)) cell.object = 'wall';
    });
}

function placeEnemyExitGate(enemyObject = 'enemy') {
    const neighbors = getExitNeighborCells()
        .filter(isGateCandidateCell)
        .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
    const guard = neighbors[0];
    if (!guard) return;
    guard.object = enemyObject;
    guard.nextAuraAt = 0;
    guard.nextAttackAt = 0;
    guard.hits = 0;
    game.roomSpawnCounts.enemies += 1;
    neighbors.slice(1, 3).forEach((cell) => {
        if (isGateCandidateCell(cell)) cell.object = 'wall';
    });
}

function placeMixedExitGate() {
    const profile = getRoomProfile();
    const enemy = profile.allowedEnemies.includes('guardWasp') && getObjectUnlockLevel('guardWasp') <= getPlayerLevel()
        ? 'guardWasp'
        : 'enemy';
    const neighbors = getExitNeighborCells()
        .filter(isGateCandidateCell)
        .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
    const guard = neighbors[0];
    if (guard) {
        guard.object = enemy;
        guard.nextAuraAt = 0;
        guard.nextAttackAt = 0;
        guard.hits = 0;
        game.roomSpawnCounts.enemies += 1;
    }
    const door = neighbors[1];
    if (door) {
        door.object = 'waxDoor';
        game.roomSpawnCounts.hazards += 1;
        placeResourceNearPlayer('pollen');
    }
    neighbors.slice(2, 4).forEach((cell) => {
        if (isGateCandidateCell(cell)) cell.object = 'wall';
    });
}

function isGateCandidateCell(cell) {
    return Boolean(cell
        && cell.object !== 'entry'
        && cell.object !== 'exit'
        && cell.object !== 'finalExit'
        && !(cell.q === game.player.q && cell.r === game.player.r));
}

function getExitNeighborCells() {
    if (!game.exitCell) return [];
    return HEX_DIRECTIONS
        .map((direction) => getCell(game.exitCell.q + direction.q, game.exitCell.r + direction.r))
        .filter(Boolean);
}

function placeResourceNearPlayer(object) {
    const target = game.cells
        .filter((cell) => (
            cell.object === 'empty'
            && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 3
            && !(cell.q === game.player.q && cell.r === game.player.r)
        ))
        .sort((a, b) => (
            hexDistance(a.q, a.r, game.player.q, game.player.r)
            - hexDistance(b.q, b.r, game.player.q, game.player.r)
        ))[0];
    if (target) target.object = object;
}

function placeBats() {
    const profile = getRoomProfile();
    if (!profile.allowedEnemies.includes('bat') || getObjectUnlockLevel('bat') > getPlayerLevel()) {
        return;
    }
    const roomSlots = Math.max(0, profile.maxEnemies - game.roomSpawnCounts.enemies);
    const batCount = Math.min(roomSlots, seededRandom() < 0.5 ? 1 : 2);
    if (!batCount) return;

    const candidates = game.cells.filter((cell) => (
        cell.object === 'empty'
        && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 2
        && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 1
    ));

    for (let i = 0; i < batCount && candidates.length; i++) {
        const index = Math.floor(seededRandom() * candidates.length);
        const [cell] = candidates.splice(index, 1);
        cell.object = 'bat';
        cell.nextAttackAt = 0;
        cell.hits = 0;
        game.roomSpawnCounts.enemies += 1;
    }
}

function revealAroundPlayer() {
    revealAround(game.player.q, game.player.r, game.revealRadius);
}

function revealAround(q, r, radius) {
    game.cells.forEach((cell) => {
        if (hexDistance(q, r, cell.q, cell.r) <= radius) {
            const wasRevealed = cell.revealed;
            cell.revealed = true;
            if (!wasRevealed) {
                maybeShowDiscoveryCallout(cell.object);
            }
        }
    });
    updateObjectiveProgress();
}

function getRelic(id) {
    return RELICS.find((relic) => relic.id === id);
}

function hasRelic(id) {
    return game.relics.includes(id);
}

function runRelicHook(hookName, ...args) {
    game.relics.forEach((id) => {
        const relic = getRelic(id);
        if (typeof relic?.[hookName] === 'function') {
            relic[hookName](game, ...args);
        }
    });
}

function addShield(amount, source) {
    game.player.upgrades += amount;
    addStatPopups(game.player.q, game.player.r, [{ stat: 'upgrades', amount }]);
    addLog(source, `Gained +${amount} shield.`);
}

function revealExitHint() {
    if (!game.exitCell) return;
    const exit = getCell(game.exitCell.q, game.exitCell.r);
    if (exit) {
        exit.revealed = true;
        addLog('Golden Antennae', 'The exit glows through the mist.');
    }
    updateObjectiveProgress();
}

function revealExitGate() {
    revealExitCell();
    getExitNeighborCells().forEach((cell) => {
        cell.revealed = true;
    });
}

function slowNearbyEnemies(q, r, radius = 2, durationMs = 1400) {
    game.cells
        .filter((cell) => isEnemyObject(cell.object) && hexDistance(q, r, cell.q, cell.r) <= radius)
        .forEach((enemy) => {
            enemy.nextAttackAt = Math.max(enemy.nextAttackAt || 0, performance.now() + durationMs);
            enemy.nextAuraAt = Math.max(enemy.nextAuraAt || 0, performance.now() + durationMs);
        });
}

function maybeShowDiscoveryCallout(object) {
    if (!object || !DISCOVERY_CALLOUT_OBJECTS.has(object) || game.mode !== 'dungeon') return;
    const key = `discover:${object}`;
    const seen = new Set(progression.tutorialsSeen || []);
    if (seen.has(key)) return;

    seen.add(key);
    progression.tutorialsSeen = [...seen];
    saveProgression();

    const name = getDisplayNameForObject(object);
    const lesson = ENEMY_DEFS[object]?.lesson || OBJECTS[object]?.description || '';
    const message = lesson
        ? `${name}: ${lesson}`
        : `${name}: ${currentLanguage === 'es-419' ? 'Nuevo descubrimiento.' : 'New discovery.'}`;
    addLog(currentLanguage === 'es-419' ? 'Descubrimiento' : 'Discovery', message);
    addWarningPopup(game.player.q, game.player.r, name);
}

function showTutorialCallout(id, title, message) {
    const key = `tutorial:${id}`;
    const seen = new Set(progression.tutorialsSeen || []);
    if (seen.has(key)) return;
    seen.add(key);
    progression.tutorialsSeen = [...seen];
    saveProgression();
    addLog(title, message);
    addWarningPopup(game.player.q, game.player.r, title);
}

function openCampChoice() {
    game.mode = 'camp';
    game.pendingNextRoomReason = 'exit';
    game.nextRoomPreview = buildNextRoomPreview();
    game.message = 'Camp between rooms: spend supplies or continue to relic choice.';
    showTutorialCallout(
        'camp',
        currentLanguage === 'es-419' ? 'Campamento' : 'Camp',
        currentLanguage === 'es-419'
            ? 'Gasta suministros entre salas para sanar, reparar escudo o preparar la próxima sala.'
            : 'Spend supplies between rooms to heal, repair shield, or prepare for the next chamber.'
    );
    campScreen.querySelector('h2').textContent = currentLanguage === 'es-419' ? 'Campamento entre salas' : 'Between-Room Camp';
    campScreen.querySelector('p').textContent = currentLanguage === 'es-419'
        ? 'Gasta suministros antes de elegir una reliquia y abrir la siguiente sala.'
        : 'Spend supplies before choosing a relic and opening the next chamber.';
    campContinueButton.textContent = currentLanguage === 'es-419' ? 'Elegir reliquia' : 'Choose Relic';
    renderCampChoices();
    campScreen.classList.add('visible');
    draw();
}

function renderCampChoices() {
    const isMarket = game.mode === 'traderMarket';
    const actions = isMarket ? game.marketChoices : getCampActions();
    const preview = isMarket
        ? `<div class="camp-preview">
            <strong>${currentLanguage === 'es-419' ? 'Escarabajo comerciante' : 'Trade Beetle'}</strong>
            <span>${currentLanguage === 'es-419' ? 'Elige una compra. El escarabajo se ira cuando cierres el mercado.' : 'Choose a purchase. The beetle leaves when you close the market.'}</span>
        </div>`
        : game.nextRoomPreview
        ? `<div class="camp-preview">
            <strong>${currentLanguage === 'es-419' ? 'Próxima sala' : 'Next chamber'}</strong>
            <span>${escapeHtml(game.nextRoomPreview)}</span>
        </div>`
        : '';
    campActionsNode.innerHTML = preview + actions.map((action) => (
        `<button class="camp-action" type="button" data-camp-action="${action.id}" ${action.available ? '' : 'disabled'}>
            <strong>${action.name}</strong>
            <span>${action.description}</span>
        </button>`
    )).join('');
}

function openTraderMarket(cell) {
    game.mode = 'traderMarket';
    game.marketCell = { q: cell.q, r: cell.r };
    game.marketChoices = chooseTraderMarketActions();
    game.message = 'Trade beetle opens a small market.';
    showTutorialCallout(
        'traderMarket',
        currentLanguage === 'es-419' ? 'Mercado del escarabajo' : 'Beetle Market',
        currentLanguage === 'es-419'
            ? 'Los escarabajos convierten recursos en curacion, defensa, mapas o preparacion para la siguiente sala.'
            : 'Trade beetles turn resources into healing, defense, maps, or next-room prep.'
    );
    campScreen.querySelector('h2').textContent = currentLanguage === 'es-419' ? 'Mercado del escarabajo' : 'Beetle Market';
    campScreen.querySelector('p').textContent = currentLanguage === 'es-419'
        ? 'Compra una mejora con tus recursos. Las opciones crecen con el nivel de la abeja.'
        : 'Buy one upgrade with your supplies. Options grow with bee level.';
    renderCampChoices();
    campContinueButton.textContent = currentLanguage === 'es-419' ? 'Cerrar mercado' : 'Close Market';
    campScreen.classList.add('visible');
}

function chooseTraderMarketActions() {
    const actions = getCampActions().filter((action) => action.market && getPlayerLevel() >= action.minLevel);
    const available = actions.filter((action) => action.available);
    const pool = available.length >= 3 ? available : actions;
    return [...pool].sort(() => seededRandom() - 0.5).slice(0, 3);
}

function buildNextRoomPreview() {
    const nextDepth = Math.min(FINAL_ROOM, game.roomDepth + 1);
    const currentDepth = game.roomDepth;
    game.roomDepth = nextDepth;
    const profile = getRoomProfile();
    game.roomDepth = currentDepth;

    if (nextDepth >= FINAL_ROOM) {
        return currentLanguage === 'es-419'
            ? 'Baile final: guarda salud y concentración.'
            : 'Final dance: save health and focus.';
    }

    const enemies = profile.allowedEnemies.map(getDisplayNameForObject).slice(0, 3).join(', ');
    const hazards = profile.maxHazards > 0
        ? currentLanguage === 'es-419' ? 'con peligros de terreno' : 'with terrain hazards'
        : currentLanguage === 'es-419' ? 'sin peligros fuertes' : 'light hazards';
    return currentLanguage === 'es-419'
        ? `Tamaño ${profile.targetCells} celdas, ${hazards}. Posibles enemigos: ${enemies || 'avispa'}.`
        : `${profile.targetCells} cells, ${hazards}. Possible enemies: ${enemies || 'Wasp'}.`;
}

function getCampActions() {
    const missingHealth = Math.max(0, getPlayerMaxHealth() - game.player.health);
    const missingShield = Math.max(0, game.player.maxShield - game.player.upgrades);
    return [
        {
            id: 'heal',
            name: 'Drink Water',
            description: 'Cost: 1 water. Heal +2 health.',
            available: game.player.water > 0 && missingHealth > 0,
            market: true,
            minLevel: 1
        },
        {
            id: 'shield',
            name: 'Pack Wax',
            description: 'Cost: 1 pollen. Repair +1 shield.',
            available: game.player.pollen > 0 && missingShield > 0,
            market: true,
            minLevel: 1
        },
        {
            id: 'map',
            name: 'Study Map',
            description: 'Cost: 1 honey. Reveal exit route next room.',
            available: game.player.honey > 0,
            market: true,
            minLevel: 2
        },
        {
            id: 'guard',
            name: 'Guard Comb',
            description: 'Cost: 1 pollen + 1 water. Start next room with +1 shield.',
            available: game.player.pollen > 0 && game.player.water > 0,
            market: true,
            minLevel: 2
        },
        {
            id: 'scout',
            name: 'Scout Smoke',
            description: 'Cost: 1 pollen + 1 water. Reveal nearby enemies next room.',
            available: game.roomDepth >= 2 && game.player.pollen > 0 && game.player.water > 0,
            market: true,
            minLevel: 3
        },
        {
            id: 'rush',
            name: 'Sugar Rush',
            description: 'Cost: 1 honey. Start next room with full stamina.',
            available: game.roomDepth >= 2 && game.player.honey > 0,
            market: true,
            minLevel: 3
        },
        {
            id: 'reroll',
            name: 'Sweet Bargain',
            description: 'Cost: 1 honey. Reroll upcoming relic choices.',
            available: game.player.honey > 0,
            market: false,
            minLevel: 99
        }
    ];
}

function applyCampAction(id) {
    if (game.mode !== 'camp' && game.mode !== 'traderMarket') return;
    let purchased = false;
    if (id === 'heal' && game.player.water > 0 && game.player.health < getPlayerMaxHealth()) {
        game.player.water -= 1;
        const healed = healPlayer(2);
        addStatPopups(game.player.q, game.player.r, [{ stat: 'water', amount: -1 }, { stat: 'health', amount: healed }]);
        addLog('Camp', 'Spent water to recover health.');
        purchased = true;
    } else if (id === 'shield' && game.player.pollen > 0 && game.player.upgrades < game.player.maxShield) {
        game.player.pollen -= 1;
        game.player.upgrades += 1;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'pollen', amount: -1 }, { stat: 'upgrades', amount: 1 }]);
        addLog('Camp', 'Spent pollen to repair shield.');
        purchased = true;
    } else if (id === 'map' && game.player.honey > 0) {
        game.player.honey -= 1;
        game.campBuffs.revealRoute = true;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'honey', amount: -1 }]);
        addLog('Camp', 'Spent honey to reveal the next exit route.');
        purchased = true;
    } else if (id === 'guard' && game.player.pollen > 0 && game.player.water > 0) {
        game.player.pollen -= 1;
        game.player.water -= 1;
        game.campBuffs.nextRoomShield = (game.campBuffs.nextRoomShield || 0) + 1;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'pollen', amount: -1 }, { stat: 'water', amount: -1 }]);
        addLog('Camp', 'Prepared wax guard for the next room.');
        purchased = true;
    } else if (id === 'scout' && game.roomDepth >= 2 && game.player.pollen > 0 && game.player.water > 0) {
        game.player.pollen -= 1;
        game.player.water -= 1;
        game.campBuffs.revealEnemies = true;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'pollen', amount: -1 }, { stat: 'water', amount: -1 }]);
        addLog('Camp', 'Prepared smoke to mark nearby threats next room.');
        purchased = true;
    } else if (id === 'rush' && game.roomDepth >= 2 && game.player.honey > 0) {
        game.player.honey -= 1;
        game.campBuffs.fullStamina = true;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'honey', amount: -1 }]);
        addLog('Camp', 'Saved honey for a stamina burst next room.');
        purchased = true;
    } else if (id === 'reroll' && game.player.honey > 0) {
        game.player.honey -= 1;
        game.campRelicRerolls += 1;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'honey', amount: -1 }]);
        addLog('Camp', 'Spent honey to stir new relic options.');
        purchased = true;
    }
    if (game.mode === 'traderMarket' && purchased) {
        continueFromCamp();
        return;
    }
    renderCampChoices();
    renderStats();
}

function continueFromCamp() {
    if (game.mode === 'traderMarket') {
        const cell = game.marketCell ? getCell(game.marketCell.q, game.marketCell.r) : null;
        if (cell?.object === 'npc') {
            cell.object = 'empty';
        }
        game.marketCell = null;
        game.marketChoices = [];
        game.mode = 'dungeon';
        campScreen.classList.remove('visible');
        campContinueButton.textContent = currentLanguage === 'es-419' ? 'Elegir reliquia' : 'Choose Relic';
        renderStats();
        draw();
        return;
    }
    if (game.mode !== 'camp') return;
    campScreen.classList.remove('visible');
    openRelicChoice();
}

function applyCampRoomBuffs() {
    if (game.campBuffs.nextRoomShield) {
        const amount = game.campBuffs.nextRoomShield;
        game.player.upgrades = Math.min(game.player.maxShield, game.player.upgrades + amount);
        addStatPopups(game.player.q, game.player.r, [{ stat: 'upgrades', amount }]);
        addLog('Camp Guard', `Started with +${amount} shield from camp prep.`);
    }
    if (game.campBuffs.revealRoute) {
        revealRouteToExit();
        addLog('Camp Map', 'The camp map revealed a path toward the exit.');
    }
    if (game.campBuffs.revealEnemies) {
        game.cells
            .filter((cell) => isEnemyObject(cell.object) && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 6)
            .forEach((cell) => {
                cell.revealed = true;
            });
        addLog('Camp Smoke', 'Smoke marks the closest enemy pressure.');
    }
    if (game.campBuffs.fullStamina) {
        game.player.stamina = game.player.maxStamina;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'stamina', amount: game.player.maxStamina }]);
        addLog('Sugar Rush', 'Started with full stamina.');
    }
    game.campBuffs = {};
}

function openRelicChoice() {
    game.mode = 'relicChoice';
    game.pendingNextRoomReason = 'exit';
    game.relicChoices = chooseRelicRewards();
    for (let i = 0; i < game.campRelicRerolls; i++) {
        game.relicChoices = chooseRelicRewards();
    }
    game.campRelicRerolls = 0;
    game.message = 'Choose a relic before entering the next chamber.';
    renderRelicChoices();
    relicScreen.classList.add('visible');
    draw();
}

function chooseRelicRewards() {
    const available = RELICS.filter((relic) => (
        relic.minDepth <= game.roomDepth && !hasRelic(relic.id)
    ));
    return [...available].sort(() => seededRandom() - 0.5).slice(0, 3);
}

function renderRelicChoices() {
    if (!game.relicChoices.length) {
        relicChoicesNode.innerHTML = `<button class="relic-card" type="button" data-relic-id="skip">
            <strong>${currentLanguage === 'es-419' ? 'Sin reliquias nuevas' : 'No New Relics'}</strong>
            <span>${currentLanguage === 'es-419' ? 'La abeja ya conoce todas las reliquias disponibles.' : 'The bee already has every available relic.'}</span>
        </button>`;
        return;
    }
    relicChoicesNode.innerHTML = game.relicChoices.map((relic) => (
        `<button class="relic-card" type="button" data-relic-id="${relic.id}">
            <strong>${relic.name}</strong>
            <span>${relic.description}</span>
        </button>`
    )).join('');
}

function chooseRelic(id) {
    if (id === 'skip' && game.mode === 'relicChoice') {
        relicScreen.classList.remove('visible');
        game.relicChoices = [];
        game.pendingNextRoomReason = null;
        game.roomDepth += 1;
        generateRoom('exit');
        return;
    }
    const relic = getRelic(id);
    if (!relic || game.mode !== 'relicChoice') return;

    if (!hasRelic(id)) {
        game.relics.push(id);
    }
    if (typeof relic.apply === 'function') {
        relic.apply(game);
    }
    renderRelics();
    addLog('Relic Chosen', `${relic.name}: ${relic.description}`);
    relicScreen.classList.remove('visible');
    game.relicChoices = [];
    game.pendingNextRoomReason = null;
    game.roomDepth += 1;
    generateRoom('exit');
}

function renderRelics() {
    if (!relicListNode) return;
    if (!game.relics.length) {
        relicListNode.innerHTML = `<span class="relic-empty">${t('ui', 'noneYet')}</span>`;
        return;
    }
    relicListNode.innerHTML = game.relics.map((id) => {
        const relic = getRelic(id);
        return `<span class="relic-chip">${relic?.name || id}</span>`;
    }).join('');
}

function generateDanceRoom() {
    danceSystem.start();
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
}

function layout() {
    const rect = canvas.getBoundingClientRect();
    const padding = game.mode === 'dance' ? 18 : 28;
    const hexes = game.mode === 'dance' && game.cells.length
        ? game.cells
        : getAllCoordinatesForRadius(VISIBLE_RADIUS);
    const unitPoints = hexes.flatMap((cell) => hexCornerPoints(cell.q, cell.r, 1));
    const minX = Math.min(...unitPoints.map((point) => point.x));
    const maxX = Math.max(...unitPoints.map((point) => point.x));
    const minY = Math.min(...unitPoints.map((point) => point.y));
    const maxY = Math.max(...unitPoints.map((point) => point.y));
    const unitWidth = maxX - minX;
    const unitHeight = maxY - minY;
    const size = Math.max(18, Math.min(
        (rect.width - padding * 2) / unitWidth,
        (rect.height - padding * 2) / unitHeight
    ));

    if (game.mode === 'dance') {
        return {
            width: rect.width,
            height: rect.height,
            size,
            originX: rect.width / 2 - (minX + unitWidth / 2) * size,
            originY: rect.height / 2 - (minY + unitHeight / 2) * size
        };
    }

    const camera = getCameraWorldPosition();
    const cameraPixel = axialToWorld(camera.q, camera.r, size);

    return {
        width: rect.width,
        height: rect.height,
        size,
        originX: rect.width / 2 - cameraPixel.x + game.cameraPan.x,
        originY: rect.height / 2 - cameraPixel.y + game.cameraPan.y
    };
}

function hexToPixel(q, r) {
    const board = layout();
    const world = axialToWorld(q, r, board.size);
    const x = board.originX + world.x;
    const y = board.originY + world.y;
    return { x, y, size: board.size };
}

function getAllCoordinatesForRadius(radius) {
    const coordinates = [];
    for (let q = -radius; q <= radius; q++) {
        const rMin = Math.max(-radius, -q - radius);
        const rMax = Math.min(radius, -q + radius);

        for (let r = rMin; r <= rMax; r++) {
            coordinates.push({ q, r });
        }
    }
    return coordinates;
}

function getCameraWorldPosition() {
    const motion = game.playerMotion;
    if (!motion) {
        return { q: game.player.q, r: game.player.r };
    }

    const progress = Math.min(1, (performance.now() - motion.startedAt) / motion.duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    return {
        q: motion.fromQ + (motion.toQ - motion.fromQ) * eased,
        r: motion.fromR + (motion.toR - motion.fromR) * eased
    };
}

function axialToWorld(q, r, size) {
    return {
        x: size * Math.sqrt(3) * (q + r / 2),
        y: size * 1.5 * r
    };
}

function hexCornerPoints(q, r, size) {
    const centerX = Math.sqrt(3) * size * (q + r / 2);
    const centerY = size * 1.5 * r;
    const points = [];

    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        points.push({
            x: centerX + size * Math.cos(angle),
            y: centerY + size * Math.sin(angle)
        });
    }

    return points;
}

function pixelToClosestHex(x, y) {
    let closest = null;
    let closestDistance = Infinity;

    game.cells.forEach((cell) => {
        const point = hexToPixel(cell.q, cell.r);
        const distance = Math.hypot(x - point.x, y - point.y);

        if (distance < closestDistance) {
            closest = cell;
            closestDistance = distance;
        }
    });

    return closestDistance <= hexToPixel(0, 0).size ? closest : null;
}

function draw() {
    if (!canvas.width || !canvas.height) return;
    updateStamina();
    if (game.replay) {
        // Replay snapshots advance on their own timer.
    } else if (game.mode === 'dance') {
        danceSystem.update();
    } else if (game.mode === 'dungeon') {
        updateSleepingEnemies();
        updateEnemyAuras();
        updateBatAttacks();
    }

    const board = layout();
    ctx.clearRect(0, 0, board.width, board.height);
    drawBackground(board);

    game.cells.forEach(drawCell);
    if (game.mode === 'dance') {
        danceSystem.drawArrow();
    }
    drawPlayer();
    if (game.mode === 'dance' && game.dance?.move?.type === 'hold') {
        danceSystem.drawHoldForeground();
    }
    if (game.mode === 'dance') {
        danceSystem.drawScoreOverlay(board);
        danceSystem.drawFeedbackLane(board);
    }
    drawStatPopups();
    drawDangerOverlay(board);
    drawHoverTooltip();
    renderStats();
    renderCooldown();
    renderMessage();
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

function drawBackground(board) {
    const boardBackground = uiArtAssets.boardBackground;
    if (boardBackground?.complete && boardBackground.naturalWidth) {
        drawImageCover(boardBackground, 0, 0, board.width, board.height);
    } else {
        const gradient = ctx.createRadialGradient(
            board.width * 0.54,
            board.height * 0.42,
            Math.min(board.width, board.height) * 0.12,
            board.width * 0.5,
            board.height * 0.5,
            Math.max(board.width, board.height) * 0.82
        );
        gradient.addColorStop(0, '#1b2a20');
        gradient.addColorStop(0.58, '#101a14');
        gradient.addColorStop(1, '#07100b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, board.width, board.height);
    }

    ctx.save();
    ctx.globalAlpha = boardBackground?.complete && boardBackground.naturalWidth ? 0.45 : 1;
    drawForestTexture(board);
    ctx.restore();

    if (game.mode === 'dance') {
        drawDiscoFloor(board);
    }

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#e5bc58';
    ctx.lineWidth = 1;
    for (let x = -80; x < board.width + 80; x += 84) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 180, board.height);
        ctx.stroke();
    }
    ctx.restore();
}

function drawImageCover(image, x, y, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = x + (width - drawWidth) / 2;
    const drawY = y + (height - drawHeight) / 2;
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function loadUiArt() {
    Object.entries(UI_ART_DEFS).forEach(([key, src]) => {
        const image = new Image();
        image.onload = () => {
            uiArtAssets[key] = image;
        };
        image.onerror = () => {
            uiArtAssets[key] = null;
        };
        image.src = src;
    });
}

function loadTileArt() {
    Object.entries(TILE_ART_DEFS).forEach(([key, src]) => {
        const image = new Image();
        image.onload = () => {
            tileArtAssets[key] = image;
        };
        image.onerror = () => {
            tileArtAssets[key] = null;
        };
        image.src = src;
    });
}

function drawForestTexture(board) {
    ctx.save();
    const seed = (game.seed || 1) + (game.depth || 0) * 97 + (game.mode === 'dance' ? 503 : 0);
    for (let i = 0; i < 120; i++) {
        const x = seededNoise(seed, i * 2) * board.width;
        const y = seededNoise(seed, i * 2 + 1) * board.height;
        const radius = 1.2 + seededNoise(seed, i * 3 + 7) * 3.4;
        ctx.globalAlpha = 0.05 + seededNoise(seed, i * 5 + 11) * 0.08;
        ctx.fillStyle = i % 5 === 0 ? '#e7c15f' : '#6f8a54';
        drawTinyLeaf(x, y, radius);
    }
    ctx.restore();
}

function seededNoise(seed, index) {
    const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    return value - Math.floor(value);
}

function drawTinyLeaf(x, y, radius) {
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.45, y, radius, radius * 0.44, -0.7, 0, Math.PI * 2);
    ctx.ellipse(x + radius * 0.45, y, radius, radius * 0.44, 0.7, 0, Math.PI * 2);
    ctx.ellipse(x, y - radius * 0.45, radius, radius * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawDiscoFloor(board) {
    const now = performance.now();
    const colors = ['#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#4d96ff', '#b66dff'];

    game.cells.forEach((cell, index) => {
        const { x, y, size } = hexToPixel(cell.q, cell.r);
        const pulse = (Math.sin(now / 180 + index * 0.9) + 1) / 2;
        drawHexPath(x, y, size - 4);
        ctx.fillStyle = colors[(index + Math.floor(now / 260)) % colors.length];
        ctx.globalAlpha = 0.26 + pulse * 0.2;
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function drawCell(cell) {
    const isPlayer = cell.q === game.player.q && cell.r === game.player.r;
    const { x, y, size } = hexToPixel(cell.q, cell.r);
    const hidden = game.mode !== 'dance' && !cell.revealed;
    const visibleObject = getVisibleCellObject(cell, hidden);
    const object = OBJECTS[visibleObject] || OBJECTS.empty;
    const disguised = visibleObject !== cell.object;

    drawCellBackground(cell, x, y, size, hidden);
    if (!hidden) {
        drawThreatPreview(cell, x, y, size);
    }

    drawHexPath(x, y, size - 2);
    ctx.lineWidth = visibleObject !== 'empty' && !hidden ? 3 : 1.5;
    ctx.strokeStyle = visibleObject !== 'empty' && !hidden ? object.color : 'rgba(233, 199, 110, 0.38)';
    ctx.stroke();

    if (!hidden && visibleObject !== 'empty') {
        if (visibleObject === 'exit' || visibleObject === 'finalExit') {
            drawTileArt('exit', x, y, size, visibleObject === 'finalExit' ? 1 : 0.88);
        } else if (isEnemyObject(visibleObject)) {
            drawTileArt('enemyBorder', x, y, size, 0.9);
        } else if (!['entry', 'vine', 'stickyTrap'].includes(visibleObject)) {
            drawTileArt('pickableBorder', x, y, size, 0.9);
        }
        drawSprite(visibleObject, x, y, size, cell);
        if (!disguised && isEnemyObject(cell.object)) {
            drawEnemyHealthPips(cell, x, y, size);
            drawEnemyTypeBadge(cell.object, x, y, size);
        }
    }

    if (!hidden && (cell.object === 'bat' || (cell.object === 'sleepingBat' && cell.awake))) {
        drawBatAttackTimer(cell, x, y, size);
    }

    if (!hidden && !disguised && hasTimedAura(cell.object)) {
        drawEnemyAuraTimer(cell, x, y, size);
    }

    if (hidden) {
        drawMist(x, y, size);
    }
}

function getVisibleCellObject(cell, hidden) {
    if (hidden) return cell.object;
    if (cell.object === 'falseFlower' && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 1) {
        return 'pollen';
    }
    return cell.object;
}

function drawThreatPreview(cell, x, y, size) {
    const threat = getThreatAtCell(cell.q, cell.r);
    if (!threat) return;
    const nearPlayer = hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 2;
    if (!threat.imminent && !nearPlayer) return;

    const pulse = (Math.sin(performance.now() / 180) + 1) / 2;
    const urgent = threat.remaining <= 320;
    ctx.save();
    drawTileArt('danger', x, y, size, urgent ? 0.72 + pulse * 0.18 : 0.3 + pulse * 0.18);
    drawHexPath(x, y, size - 8);
    ctx.strokeStyle = threat.imminent
        ? `rgba(231, 111, 81, ${urgent ? 0.76 + pulse * 0.22 : 0.42 + pulse * 0.28})`
        : 'rgba(231, 111, 81, 0.22)';
    ctx.lineWidth = urgent ? 6 : threat.imminent ? 4 : 2;
    if (urgent) {
        ctx.fillStyle = `rgba(231, 38, 38, ${0.08 + pulse * 0.08})`;
        ctx.fill();
    }
    ctx.stroke();
    ctx.restore();
}

function getThreatAtCell(q, r) {
    if (game.mode !== 'dungeon') return null;
    let strongest = null;
    const now = performance.now();
    game.cells
        .filter((cell) => isEnemyObject(cell.object))
        .forEach((enemyCell) => {
            const enemy = getEnemyDef(enemyCell.object);
            const inAura = hasTimedAura(enemyCell.object) && hexDistance(enemyCell.q, enemyCell.r, q, r) <= enemy.range;
            const inBat = (enemyCell.object === 'bat' || (enemyCell.object === 'sleepingBat' && enemyCell.awake))
                && isAdjacent(enemyCell.q, enemyCell.r, q, r);
            if (!inAura && !inBat) return;
            const timer = inBat ? enemyCell.nextAttackAt : enemyCell.nextAuraAt;
            const remaining = timer ? Math.max(0, timer - now) : enemy.intervalMs;
            const imminent = remaining <= 850;
            strongest = {
                enemy: enemyCell.object,
                imminent: strongest?.imminent || imminent,
                damage: Math.max(strongest?.damage || 0, enemy.attack || 0),
                remaining: Math.min(strongest?.remaining ?? Infinity, remaining)
            };
        });
    return strongest;
}

function getCurrentDangerState() {
    const threat = getThreatAtCell(game.player.q, game.player.r);
    const lowHealth = game.player.health <= 2 && game.mode === 'dungeon' && !game.ended;
    return {
        active: Boolean(lowHealth || threat?.imminent),
        lowHealth,
        imminent: Boolean(threat?.imminent),
        threat
    };
}

function drawDangerOverlay(board) {
    const danger = getCurrentDangerState();
    if (!danger.active) return;

    const pulse = (Math.sin(performance.now() / 120) + 1) / 2;
    const intensity = danger.lowHealth ? 0.22 + pulse * 0.16 : 0.12 + pulse * 0.12;
    ctx.save();
    const gradient = ctx.createRadialGradient(
        board.width / 2,
        board.height / 2,
        Math.min(board.width, board.height) * 0.22,
        board.width / 2,
        board.height / 2,
        Math.max(board.width, board.height) * 0.72
    );
    gradient.addColorStop(0, 'rgba(231, 111, 81, 0)');
    gradient.addColorStop(1, `rgba(231, 38, 38, ${intensity})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, board.width, board.height);

    ctx.strokeStyle = `rgba(231, 111, 81, ${0.34 + pulse * 0.28})`;
    ctx.lineWidth = danger.lowHealth ? 10 : 6;
    ctx.strokeRect(4, 4, board.width - 8, board.height - 8);
    ctx.restore();
}

function updateStamina() {
    if (game.mode !== 'dungeon' || game.ended || game.replay) return;
    const now = performance.now();
    if (game.player.stamina >= game.player.maxStamina) {
        game.lastStaminaRegenAt = now;
        return;
    }
    const ticks = Math.floor((now - game.lastStaminaRegenAt) / STAMINA_REGEN_MS);
    if (ticks <= 0) return;
    game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + ticks);
    game.lastStaminaRegenAt += ticks * STAMINA_REGEN_MS;
}

function drawCellBackground(cell, x, y, size, hidden) {
    drawHexPath(x, y, size - 2);
    ctx.save();
    ctx.clip();
    const tileKey = getCellTileKey(cell, hidden);
    const hasTileArt = game.mode !== 'dance' && drawTileArt(tileKey, x, y, size, hidden ? 0.92 : 0.96);
    if (!hasTileArt) {
        const baseGradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        if (hidden) {
            baseGradient.addColorStop(0, '#101a15');
            baseGradient.addColorStop(1, '#1f2c24');
        } else if (cell.visited) {
            baseGradient.addColorStop(0, '#2d3d34');
            baseGradient.addColorStop(1, '#1d2b24');
        } else {
            baseGradient.addColorStop(0, '#3c4d43');
            baseGradient.addColorStop(1, '#26372f');
        }
        ctx.fillStyle = baseGradient;
        ctx.globalAlpha = hidden ? 0.96 : game.mode === 'dance'
            ? (cell.visited ? 0.52 : 0.34)
            : 0.9;
        ctx.fill();
    }

    drawHexPath(x, y, size - 6);
    ctx.globalAlpha = hasTileArt ? 0.04 : hidden ? 0.06 : 0.12;
    ctx.strokeStyle = '#e8c76b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.globalAlpha = hasTileArt ? 0.06 : hidden ? 0.08 : 0.16;
    ctx.fillStyle = '#f1cf79';
    for (let i = 0; i < 7; i++) {
        const offsetX = (seededNoise(cell.q * 37 + cell.r * 101, i) - 0.5) * size * 1.1;
        const offsetY = (seededNoise(cell.q * 53 + cell.r * 89, i + 10) - 0.5) * size * 1.05;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, 0.9 + (i % 3) * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    if (!hidden && cell.object !== 'empty') {
        ctx.fillStyle = objectTint(cell.object);
        ctx.globalAlpha = hasTileArt ? 0.08 : 0.22;
        ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}

function getCellTileKey(cell, hidden) {
    if (hidden) return 'empty';
    if (cell.object === 'exit' || cell.object === 'finalExit') return 'path';
    if (cell.object !== 'empty') return 'visited';
    if (cell.visited) return 'visited';
    return 'hidden';
}

function drawTileArt(key, x, y, size, alpha = 1) {
    const image = tileArtAssets[key];
    if (!image?.complete || !image.naturalWidth) return false;
    const drawSize = size * 2;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 6);
    ctx.drawImage(image, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();
    return true;
}

function objectTint(object) {
    return OBJECTS[object]?.color || '#3c544d';
}

function drawEnemyHealthPips(cell, x, y, size) {
    const enemy = getEnemyDef(cell.object);
    if (!enemy || enemy.hp <= 1) return;

    const remaining = Math.max(0, enemy.hp - (cell.hits || 0));
    const gap = 6;
    const pipRadius = 3.5;
    const startX = x - ((enemy.hp - 1) * gap) / 2;

    ctx.save();
    for (let i = 0; i < enemy.hp; i++) {
        ctx.beginPath();
        ctx.arc(startX + i * gap, y - size * 0.66, pipRadius, 0, Math.PI * 2);
        ctx.fillStyle = i < remaining ? '#fff2a7' : 'rgba(17, 22, 19, 0.62)';
        ctx.strokeStyle = 'rgba(17, 22, 19, 0.78)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

function drawEnemyTypeBadge(object, x, y, size) {
    if (object === 'enemy' || object === 'bat') return;

    const enemy = getEnemyDef(object);
    const labels = {
        miteSwarm: 'M',
        thornBeetle: 'T',
        fogMoth: 'F',
        waxMoth: 'W',
        broodWasp: 'B',
        stagBeetle: 'S',
        falseFlower: '!',
        guardWasp: 'G',
        sleepingBat: 'Z',
        honeyLeech: 'L'
    };
    const label = labels[object];
    if (!enemy || !label) return;

    ctx.save();
    ctx.fillStyle = 'rgba(17, 22, 19, 0.86)';
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + size * 0.38, y + size * 0.35, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff2a7';
    ctx.font = `800 ${Math.round(size * 0.18)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + size * 0.38, y + size * 0.35);
    ctx.restore();
}

function drawMist(x, y, size) {
    ctx.save();
    drawHexPath(x, y, size - 3);
    ctx.fillStyle = 'rgba(185, 214, 209, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(210, 232, 227, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function drawHexPath(x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        const cornerX = x + size * Math.cos(angle);
        const cornerY = y + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(cornerX, cornerY);
        } else {
            ctx.lineTo(cornerX, cornerY);
        }
    }
    ctx.closePath();
}

function loadSprites() {
    const entries = Object.entries(SPRITE_DEFS);
    const loadableEntries = entries.filter(([, definition]) => definition.src);
    let loaded = 0;

    if (!loadableEntries.length) {
        spritesReady = true;
        return;
    }

    loadableEntries.forEach(([key, definition]) => {
        const image = new Image();
        image.onload = () => {
            spriteAssets[key] = createTransparentSpriteCanvas(image);
            loaded += 1;
            if (loaded === loadableEntries.length) {
                spriteFrames = buildSpriteFrames();
                spritesReady = true;
                draw();
            }
        };
        image.onerror = () => {
            spriteAssets[key] = null;
            loaded += 1;
            if (loaded === loadableEntries.length) {
                spriteFrames = buildSpriteFrames();
                spritesReady = true;
                draw();
            }
        };
        image.src = definition.src;
    });
}

function createTransparentSpriteCanvas(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const spriteCtx = canvas.getContext('2d', { willReadFrequently: true });
    spriteCtx.drawImage(image, 0, 0);

    try {
        const imageData = spriteCtx.getImageData(0, 0, canvas.width, canvas.height);
        removeConnectedWhiteBackground(imageData, canvas.width, canvas.height);
        spriteCtx.putImageData(imageData, 0, 0);
    } catch (error) {
        return image;
    }
    return canvas;
}

function removeConnectedWhiteBackground(imageData, width, height) {
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const queue = [];

    function enqueue(x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const index = y * width + x;
        if (visited[index]) return;
        const offset = index * 4;
        const nearWhite = data[offset + 3] > 0
            && data[offset] >= 238
            && data[offset + 1] >= 238
            && data[offset + 2] >= 238;
        if (!nearWhite) return;
        visited[index] = 1;
        queue.push(index);
    }

    for (let x = 0; x < width; x++) {
        enqueue(x, 0);
        enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
        enqueue(0, y);
        enqueue(width - 1, y);
    }

    while (queue.length) {
        const index = queue.shift();
        const offset = index * 4;
        data[offset + 3] = 0;
        const x = index % width;
        const y = Math.floor(index / width);
        enqueue(x + 1, y);
        enqueue(x - 1, y);
        enqueue(x, y + 1);
        enqueue(x, y - 1);
    }
}

function buildSpriteFrames() {
    const frames = {};
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });

    Object.entries(SPRITE_DEFS).forEach(([key, definition]) => {
        const image = spriteAssets[key];
        const imageWidth = getSpriteAssetWidth(image);
        const imageHeight = getSpriteAssetHeight(image);
        if (!image || !imageWidth || !imageHeight) {
            frames[key] = [];
            return;
        }

        frames[key] = [];

        for (let column = 0; column < definition.columns; column++) {
            const sourceX = Math.round(column * imageWidth / definition.columns);
            const nextSourceX = Math.round((column + 1) * imageWidth / definition.columns);
            const sourceY = Math.round(definition.row * imageHeight / definition.rows);
            const nextSourceY = Math.round((definition.row + 1) * imageHeight / definition.rows);
            const sourceWidth = nextSourceX - sourceX;
            const sourceHeight = nextSourceY - sourceY;

            analysisCanvas.width = sourceWidth;
            analysisCanvas.height = sourceHeight;
            analysisCtx.clearRect(0, 0, sourceWidth, sourceHeight);
            analysisCtx.drawImage(
                image,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                sourceWidth,
                sourceHeight
            );

            let bounds;
            try {
                const imageData = analysisCtx.getImageData(0, 0, sourceWidth, sourceHeight).data;
                bounds = findAlphaBounds(imageData, sourceWidth, sourceHeight);
            } catch (error) {
                bounds = { x: 0, y: 0, width: sourceWidth, height: sourceHeight };
            }

            frames[key].push({
                sourceX: sourceX + bounds.x,
                sourceY: sourceY + bounds.y,
                sourceWidth: bounds.width,
                sourceHeight: bounds.height
            });
        }
    });

    return frames;
}

function getSpriteAssetWidth(asset) {
    return asset?.naturalWidth || asset?.width || 0;
}

function getSpriteAssetHeight(asset) {
    return asset?.naturalHeight || asset?.height || 0;
}

function findAlphaBounds(data, width, height) {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 20) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < minX || maxY < minY) {
        return { x: 0, y: 0, width, height };
    }

    const padding = 2;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

function drawSprite(type, x, y, size, cell = null) {
    const spriteKey = type === 'player'
        ? (performance.now() < game.player.attackAnimationUntil ? 'playerAttack' : 'playerIdle')
        : getSpriteKey(type, cell);
    const definition = SPRITE_DEFS[spriteKey];
    const image = spriteAssets[spriteKey];

    if (!spritesReady || !definition || !image || !spriteFrames[spriteKey]?.length) {
        drawTokenFallback(type, x, y, size);
        return;
    }

    const frame = Math.floor(performance.now() / definition.frameMs) % definition.columns;
    const spriteFrame = spriteFrames[spriteKey][frame];
    const danceGiggle = type === 'player' && game.dance?.move?.type === 'hold' && game.dance?.active?.holdStartedAt
        ? Math.sin(performance.now() / 42) * size * 0.045
        : 0;
    const bob = Math.sin(performance.now() / 260 + definition.row) * size * 0.035;
    const maxDrawSize = size * (type === 'entry' || type === 'exit' || type === 'finalExit' ? 1.02 : 1.22);
    const scale = maxDrawSize / Math.max(spriteFrame.sourceWidth, spriteFrame.sourceHeight);
    const drawWidth = spriteFrame.sourceWidth * scale;
    const drawHeight = spriteFrame.sourceHeight * scale;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
        image,
        spriteFrame.sourceX,
        spriteFrame.sourceY,
        spriteFrame.sourceWidth,
        spriteFrame.sourceHeight,
        x - drawWidth / 2 + danceGiggle,
        y - drawHeight / 2 + bob,
        drawWidth,
        drawHeight
    );
    ctx.restore();
}

function getSpriteKey(type, cell = null) {
    if (type === 'sleepingBat' && cell?.awake) {
        return 'sleepingBatAwake';
    }
    return getEnemyDef(type)?.sprite || type;
}

function drawTokenFallback(type, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const fallbackLabel = getFallbackLabel(type);

    if (type === 'enemy') {
        ctx.fillStyle = '#3b1716';
        ctx.beginPath();
        ctx.ellipse(0, 1, size * 0.3, size * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd0c8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.12, -size * 0.06);
        ctx.lineTo(-size * 0.22, -size * 0.16);
        ctx.moveTo(size * 0.12, -size * 0.06);
        ctx.lineTo(size * 0.22, -size * 0.16);
        ctx.stroke();
    }

    if (isEnemyObject(type) && type !== 'enemy') {
        const enemy = getEnemyDef(type);
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.ellipse(0, 1, size * 0.3, size * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff2a7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.18, -size * 0.08);
        ctx.lineTo(size * 0.18, -size * 0.08);
        ctx.stroke();
    }

    if (type === 'npc') {
        ctx.fillStyle = '#f3f0df';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#274357';
        ctx.beginPath();
        ctx.arc(-size * 0.08, -size * 0.04, 2.2, 0, Math.PI * 2);
        ctx.arc(size * 0.08, -size * 0.04, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#274357';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, size * 0.03, size * 0.09, 0, Math.PI);
        ctx.stroke();
    }

    if (type === 'upgrade') {
        ctx.fillStyle = '#fff2a7';
        drawStar(0, 0, size * 0.28, size * 0.12, 5);
        ctx.fill();
    }

    if (type === 'stingUpgrade') {
        ctx.fillStyle = '#f28f3b';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.32);
        ctx.lineTo(size * 0.16, size * 0.1);
        ctx.lineTo(0, size * 0.32);
        ctx.lineTo(-size * 0.16, size * 0.1);
        ctx.closePath();
        ctx.fill();
    }

    if (type === 'pollen') {
        ctx.fillStyle = '#f7d45c';
        drawStar(0, 0, size * 0.24, size * 0.11, 6);
        ctx.fill();
    }

    if (type === 'glowPollen' || type === 'compassPollen' || type === 'nectarCache' || type === 'stickyHoney' || type === 'honeyDrop' || type === 'cleanWater' || type === 'smokePuff' || type === 'sunShard' || type === 'flowerMap' || type === 'royalNectar') {
        const colors = {
            glowPollen: '#7ee6a5',
            compassPollen: '#f7df72',
            nectarCache: '#f0a64f',
            stickyHoney: '#d68c39',
            honeyDrop: '#f2b544',
            cleanWater: '#9ee7ff',
            smokePuff: '#c9ced1',
            sunShard: '#ffd166',
            flowerMap: '#82d173',
            royalNectar: '#ff9fcb'
        };
        ctx.fillStyle = colors[type];
        drawStar(0, 0, size * 0.28, size * 0.11, type === 'nectarCache' ? 8 : 6);
        ctx.fill();
    }

    if (type === 'waxDoor') {
        ctx.fillStyle = '#d6b25f';
        ctx.fillRect(-size * 0.22, -size * 0.28, size * 0.44, size * 0.56);
        ctx.strokeStyle = '#5d461d';
        ctx.lineWidth = 3;
        ctx.strokeRect(-size * 0.22, -size * 0.28, size * 0.44, size * 0.56);
    }

    if (type === 'wall') {
        ctx.fillStyle = '#65716a';
        ctx.strokeStyle = '#2d3430';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-size * 0.34, -size * 0.26, size * 0.68, size * 0.52, 5);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'rgba(243, 240, 223, 0.24)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-size * 0.22, -size * 0.08);
        ctx.lineTo(size * 0.24, -size * 0.08);
        ctx.moveTo(-size * 0.12, size * 0.1);
        ctx.lineTo(size * 0.3, size * 0.1);
        ctx.stroke();
    }

    if (type === 'stickyTrap') {
        ctx.fillStyle = 'rgba(214, 140, 57, 0.74)';
        ctx.beginPath();
        ctx.ellipse(0, size * 0.1, size * 0.34, size * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    if (type === 'water') {
        ctx.fillStyle = '#9fdcff';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.26);
        ctx.bezierCurveTo(size * 0.24, 0, size * 0.18, size * 0.28, 0, size * 0.28);
        ctx.bezierCurveTo(-size * 0.18, size * 0.28, -size * 0.24, 0, 0, -size * 0.26);
        ctx.fill();
    }

    if (type === 'vine') {
        ctx.strokeStyle = '#b7e08a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-size * 0.32, size * 0.16);
        ctx.bezierCurveTo(-size * 0.14, -size * 0.22, size * 0.08, size * 0.28, size * 0.34, -size * 0.16);
        ctx.stroke();
        ctx.fillStyle = '#78a94e';
        ctx.beginPath();
        ctx.ellipse(-size * 0.12, -size * 0.02, size * 0.11, size * 0.06, -0.55, 0, Math.PI * 2);
        ctx.ellipse(size * 0.16, size * 0.04, size * 0.11, size * 0.06, 0.55, 0, Math.PI * 2);
        ctx.fill();
    }

    if (type === 'bat') {
        ctx.fillStyle = '#17111f';
        ctx.beginPath();
        ctx.moveTo(-size * 0.42, -size * 0.08);
        ctx.quadraticCurveTo(-size * 0.24, -size * 0.34, -size * 0.06, -size * 0.08);
        ctx.quadraticCurveTo(0, -size * 0.2, size * 0.06, -size * 0.08);
        ctx.quadraticCurveTo(size * 0.24, -size * 0.34, size * 0.42, -size * 0.08);
        ctx.quadraticCurveTo(size * 0.24, size * 0.02, size * 0.1, size * 0.04);
        ctx.arc(0, size * 0.02, size * 0.12, 0, Math.PI, true);
        ctx.quadraticCurveTo(-size * 0.24, size * 0.02, -size * 0.42, -size * 0.08);
        ctx.fill();
        ctx.fillStyle = '#f6d36b';
        ctx.beginPath();
        ctx.arc(-size * 0.04, -size * 0.02, 2.3, 0, Math.PI * 2);
        ctx.arc(size * 0.04, -size * 0.02, 2.3, 0, Math.PI * 2);
        ctx.fill();
    }

    if (type === 'entry' || type === 'exit' || type === 'finalExit') {
        const isExit = type === 'exit' || type === 'finalExit';
        ctx.strokeStyle = isExit ? '#fff2a7' : '#a6ffd0';
        ctx.fillStyle = isExit ? 'rgba(242, 189, 75, 0.18)' : 'rgba(69, 177, 122, 0.18)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(isExit ? -size * 0.12 : size * 0.12, -size * 0.14);
        ctx.lineTo(isExit ? size * 0.12 : -size * 0.12, 0);
        ctx.lineTo(isExit ? -size * 0.12 : size * 0.12, size * 0.14);
        ctx.stroke();
    }

    if (fallbackLabel) {
        drawFallbackLabel(fallbackLabel, size);
    }

    ctx.restore();
}

function getFallbackLabel(type) {
    const spriteKey = getSpriteKey(type);
    return SPRITE_DEFS[spriteKey]?.fallback || '';
}

function drawFallbackLabel(label, size) {
    ctx.save();
    const fontSize = label.length > 2 ? size * 0.18 : size * 0.22;
    ctx.fillStyle = 'rgba(17, 22, 19, 0.84)';
    ctx.strokeStyle = '#fff2a7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-size * 0.32, -size * 0.16, size * 0.64, size * 0.32, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff2a7';
    ctx.font = `800 ${Math.round(fontSize)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0);
    ctx.restore();
}

function drawBatAttackTimer(cell, x, y, size) {
    if (!isAdjacent(cell.q, cell.r, game.player.q, game.player.r) || game.player.health <= 0) {
        return;
    }

    const now = performance.now();
    const remaining = Math.max(0, cell.nextAttackAt - now);
    const progress = 1 - remaining / BAT_ATTACK_MS;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 138, 114, 0.95)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.fillStyle = '#ff8a72';
    ctx.font = '700 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.ceil(remaining / 1000)}s`, x, y + size * 0.48);
    ctx.restore();
}

function drawWaspAuraTimer(cell, x, y, size) {
    return drawEnemyAuraTimer(cell, x, y, size);
}

function drawEnemyAuraTimer(cell, x, y, size) {
    const enemy = getEnemyDef(cell.object);
    if (!enemy || !hasTimedAura(cell.object) || game.player.health <= 0) {
        return;
    }

    const distance = hexDistance(cell.q, cell.r, game.player.q, game.player.r);
    if (distance > enemy.range) return;

    const now = performance.now();
    const remaining = Math.max(0, cell.nextAuraAt - now);
    const progress = enemy.intervalMs ? 1 - remaining / enemy.intervalMs : 0;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = cell.object === 'honeyLeech' ? 'rgba(198, 151, 255, 0.92)' : 'rgba(249, 65, 68, 0.92)';
    ctx.beginPath();
    ctx.arc(x, y, size * (enemy.range > 1 ? 0.68 : 0.58), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.restore();
}

function drawPlayer() {
    const position = getPlayerDrawPosition();
    const { x, y, size } = position;
    drawPlayerSelectionRing(x, y, size);

    if (spritesReady) {
        drawSprite('player', x, y, size * 1.1);
        drawPlayerCooldownOverlay(x, y, size);
        drawDangerBadge(x, y, size);
        return;
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.beginPath();
    ctx.ellipse(-size * 0.18, -size * 0.06, size * 0.18, size * 0.11, -0.45, 0, Math.PI * 2);
    ctx.ellipse(size * 0.18, -size * 0.06, size * 0.18, size * 0.11, 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5c84b';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.03, size * 0.28, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#211a06';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-size * 0.06, -size * 0.15);
    ctx.lineTo(-size * 0.08, size * 0.18);
    ctx.moveTo(size * 0.08, -size * 0.16);
    ctx.lineTo(size * 0.06, size * 0.17);
    ctx.stroke();

    ctx.fillStyle = '#211a06';
    ctx.beginPath();
    ctx.arc(size * 0.19, -size * 0.03, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawPlayerCooldownOverlay(x, y, size);
    drawDangerBadge(x, y, size);
}

function drawDangerBadge(x, y, size) {
    if (game.mode !== 'dungeon' || game.ended) return;
    const threat = getThreatAtCell(game.player.q, game.player.r);
    const nearbyThreat = game.cells.some((cell) => (
        isEnemyObject(cell.object)
        && cell.revealed
        && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 2
    ));
    const lowHealth = game.player.health <= 2;
    const state = threat?.imminent || lowHealth ? 'danger' : nearbyThreat ? 'watch' : 'safe';
    const colors = {
        safe: '#43aa8b',
        watch: '#f5c84b',
        danger: '#e76f51'
    };
    const symbols = {
        safe: 'OK',
        watch: '!',
        danger: '!!'
    };
    const pulse = (Math.sin(performance.now() / 120) + 1) / 2;
    ctx.save();
    ctx.translate(x + size * 0.38, y - size * 0.42);
    ctx.fillStyle = 'rgba(17, 22, 19, 0.92)';
    ctx.strokeStyle = colors[state];
    ctx.lineWidth = state === 'danger' ? 4 + pulse * 2 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors[state];
    ctx.font = `900 ${Math.max(10, size * 0.18)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbols[state], 0, 1);
    ctx.restore();
}

function drawPlayerSelectionRing(x, y, size) {
    if (game.mode !== 'dungeon' || game.ended) return;

    const pulse = (Math.sin(performance.now() / 180) + 1) / 2;
    const staminaProgress = game.player.stamina / game.player.maxStamina;
    ctx.save();
    drawHexPath(x, y, size - 5);
    ctx.strokeStyle = `rgba(255, 242, 167, ${0.28 + pulse * 0.22})`;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.strokeStyle = '#f5c84b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.78, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * staminaProgress);
    ctx.stroke();
    ctx.restore();
}

function drawPlayerCooldownOverlay(x, y, size) {
    const remaining = getAttackCooldownRemaining();
    if (remaining <= 0 || game.mode !== 'dungeon' || game.ended) return;

    const progress = 1 - remaining / game.player.attackCooldownMs;
    const badgeX = x + size * 0.46;
    const badgeY = y - size * 0.46;
    const radius = Math.max(13, size * 0.2);

    ctx.save();
    ctx.fillStyle = 'rgba(17, 22, 19, 0.88)';
    ctx.strokeStyle = '#ff8a72';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#f5c84b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();

    ctx.fillStyle = '#ff8a72';
    ctx.font = `800 ${Math.round(radius * 0.88)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', badgeX, badgeY + 1);
    ctx.restore();
}

function getPlayerDrawPosition() {
    const current = hexToPixel(game.player.q, game.player.r);
    const motion = game.playerMotion;

    if (!motion) {
        return applyDangerShake(current);
    }

    const progress = Math.min(1, (performance.now() - motion.startedAt) / motion.duration);
    const eased = 1 - Math.pow(1 - progress, 3);

    if (progress >= 1) {
        game.playerMotion = null;
        return applyDangerShake(current);
    }

    const from = hexToPixel(motion.fromQ, motion.fromR);
    const to = hexToPixel(motion.toQ, motion.toR);
    return applyDangerShake({
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        size: current.size
    });
}

function applyDangerShake(position) {
    const danger = getCurrentDangerState();
    if (!danger.active || game.replay) return position;
    const strength = danger.lowHealth ? 3.2 : 2;
    return {
        ...position,
        x: position.x + Math.sin(performance.now() / 34) * strength,
        y: position.y + Math.cos(performance.now() / 41) * strength * 0.55
    };
}

function startPlayerMotion(fromQ, fromR, toQ, toR) {
    game.playerMotion = {
        fromQ,
        fromR,
        toQ,
        toR,
        startedAt: performance.now(),
        duration: 220
    };
}

function drawStatPopups() {
    const now = performance.now();
    game.statPopups = game.statPopups.filter((popup) => now - popup.createdAt < popup.duration);

    game.statPopups.forEach((popup) => {
        const age = now - popup.createdAt;
        if (age < 0) return;

        const progress = age / popup.duration;
        const lift = progress * 34;
        const alpha = progress < 0.72 ? 1 : 1 - (progress - 0.72) / 0.28;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = '700 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(17, 22, 19, 0.82)';
        ctx.fillStyle = popup.color;
        const iconX = popup.x - popup.textWidth / 2 - 15;
        const textY = popup.y - lift + popup.offsetY;
        if (popup.icon === 'blockedAction') {
            const boxWidth = popup.textWidth + 34;
            const boxHeight = 26;
            ctx.fillStyle = 'rgba(64, 14, 18, 0.92)';
            ctx.strokeStyle = '#ff3d3d';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(popup.x - boxWidth / 2, textY - boxHeight / 2, boxWidth, boxHeight, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = popup.color;
            ctx.strokeStyle = 'rgba(17, 22, 19, 0.82)';
        }
        if (popup.icon === 'heart') {
            drawHeartIcon(iconX, textY, 11, popup.color);
        } else if (popup.icon === 'shield') {
            drawShieldIcon(iconX, textY, 12, popup.color);
        } else if (popup.icon === 'blockedAction') {
            drawForbiddenIcon(iconX, textY, 12, popup.color);
        }
        ctx.strokeText(popup.label, popup.x, textY);
        ctx.fillText(popup.label, popup.x, textY);
        ctx.restore();
    });
}

function drawHoverTooltip() {
    if (!game.hover || game.mode !== 'dungeon') return;
    if (performance.now() - (game.hover.startedAt || 0) < 320) return;

    const cell = game.hover.cell;
    if (!cell) return;

    const info = getCellInfo(cell);
    if (!info) return;
    const lines = info.lines;
    const accent = info.color;

    ctx.save();
    ctx.font = '12px Arial';
    const width = Math.min(310, Math.max(...lines.map((line) => ctx.measureText(line).width)) + 24);
    const lineHeight = 17;
    const height = lines.length * lineHeight + 18;
    const board = layout();
    const x = Math.max(10, Math.min(game.hover.x + 16, board.width - width - 10));
    const y = Math.max(10, Math.min(game.hover.y + 16, board.height - height - 10));

    ctx.fillStyle = 'rgba(17, 22, 19, 0.94)';
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 8);
    ctx.fill();
    ctx.stroke();

    lines.forEach((line, index) => {
        ctx.fillStyle = index === 0 ? '#fff2a7' : index === 3 ? '#b8c2aa' : '#f3f0df';
        ctx.font = index === 0 ? '800 13px Arial' : '12px Arial';
        ctx.fillText(line, x + 12, y + 18 + index * lineHeight);
    });
    ctx.restore();
}

function getCellInfo(cell) {
    if (!cell.revealed && game.mode !== 'dance') {
        const roles = I18N[currentLanguage].roles;
        return {
            color: '#b8c2aa',
            lines: [
                roles.mist,
                roles.unrevealed,
                roles.revealHelp
            ]
        };
    }

    if (cell.object === 'falseFlower' && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 1) {
        const object = OBJECTS.pollen;
        return {
            color: object.color,
            lines: [
                object.name,
                getObjectRole('pollen'),
                object.description,
                getActionPreview({ ...cell, object: 'pollen' })
            ].filter(Boolean)
        };
    }

    if (isEnemyObject(cell.object)) {
        const enemy = getEnemyDef(cell.object);
        const hp = Math.max(0, enemy.hp - (cell.hits || 0));
        const status = cell.object === 'sleepingBat' && !cell.awake
            ? (currentLanguage === 'es-419' ? 'Dormido' : 'Sleeping')
            : (currentLanguage === 'es-419' ? 'Activo' : 'Active');
        return {
            color: enemy.color,
            lines: [
                enemy.name,
                `${t('ui', 'hp')} ${hp}/${enemy.hp} | ${t('ui', 'attack')} ${enemy.attack} | ${t('ui', 'range')} ${enemy.range}`,
                enemy.behavior,
                enemy.lesson,
                `${currentLanguage === 'es-419' ? 'Estado' : 'Status'}: ${status}`
            ]
        };
    }

    const object = OBJECTS[cell.object] || OBJECTS.empty;
    return {
        color: object.color,
        lines: [
            object.name,
            getObjectRole(cell.object),
            object.description,
            getActionPreview(cell)
        ].filter(Boolean)
    };
}

function getObjectRole(object) {
    const roles = I18N[currentLanguage].roles;
    if (object === 'empty') return roles.safe;
    if (object === 'vine') return `${roles.hazard} | ${VINE_DAMAGE} ${currentLanguage === 'es-419' ? 'daño al cruzar' : 'damage when crossed'}`;
    if (object === 'npc') return roles.trade;
    if (object === 'entry' || object === 'exit' || object === 'finalExit') return roles.route;
    if (object === 'waxDoor' || object === 'wall') return roles.blocker;
    if (object === 'stickyTrap') return roles.control;
    return roles.item;
}

function getActionPreview(cell) {
    if (!isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        return t('actions', 'moveNext');
    }

    const object = cell.object;
    if (isEnemyObject(object)) return getAttackCooldownRemaining() > 0 ? t('actions', 'waitSting') : t('actions', 'sting');
    if (object === 'wall') return OBJECTS.wall?.description || t('ui', 'blockedGeneric');
    if (object === 'waxDoor') return game.player.pollen > 0 ? t('actions', 'openPollen') : t('actions', 'openSting');
    if (object === 'vine') return t('actions', 'crossHazard');
    if (object === 'npc') return t('actions', 'trade');
    if (object === 'exit') return t('actions', 'nextRoom');
    if (object === 'finalExit') return t('actions', 'finalDance');
    if (object === 'entry') return t('actions', 'previousRoom');
    if (object === 'empty' || object === 'stickyTrap') return t('actions', 'move');
    return t('actions', 'collect');
}

function drawHeartIcon(x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(17, 22, 19, 0.82)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.42);
    ctx.bezierCurveTo(x - size * 1.1, y - size * 0.24, x - size * 0.6, y - size * 1.08, x, y - size * 0.48);
    ctx.bezierCurveTo(x + size * 0.6, y - size * 1.08, x + size * 1.1, y - size * 0.24, x, y + size * 0.42);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function drawShieldIcon(x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(17, 22, 19, 0.82)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.72, y - size * 0.62);
    ctx.lineTo(x + size * 0.58, y + size * 0.4);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.58, y + size * 0.4);
    ctx.lineTo(x - size * 0.72, y - size * 0.62);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function drawForbiddenIcon(x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.moveTo(x - size * 0.68, y + size * 0.68);
    ctx.lineTo(x + size * 0.68, y - size * 0.68);
    ctx.stroke();
    ctx.restore();
}

function drawStar(x, y, outerRadius, innerRadius, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = Math.PI / points * i - Math.PI / 2;
        const pointX = x + Math.cos(angle) * radius;
        const pointY = y + Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(pointX, pointY);
        } else {
            ctx.lineTo(pointX, pointY);
        }
    }
    ctx.closePath();
}

function moveTo(cell) {
    if (game.replay || game.ended || !cell || game.player.health <= 0) {
        return;
    }

    if (game.mode === 'dance') {
        handleDanceClick(cell);
        return;
    }

    if (game.mode !== 'dungeon') {
        return;
    }

    const actionState = getCellActionState(cell);
    if (!actionState.available) {
        showBlockedAction(cell, actionState.reason);
        return;
    }

    const targetObject = cell.object;
    if (targetObject === 'waxDoor') {
        openWaxDoor(cell);
        return;
    }

    if (isEnemyObject(targetObject) && getAttackCooldownRemaining() > 0) {
        const seconds = (getAttackCooldownRemaining() / 1000).toFixed(1);
        game.message = `Sting is cooling down. Wait ${seconds}s before attacking.`;
        addLog('Sting Cooldown', game.message);
        return;
    }

    const previousPosition = { q: game.player.q, r: game.player.r };
    if (!ensureStaminaForAction()) {
        showBlockedAction(cell, t('ui', 'blockedStamina'));
        return;
    }
    spendStamina(1);
    game.player.q = cell.q;
    game.player.r = cell.r;
    startPlayerMotion(previousPosition.q, previousPosition.r, cell.q, cell.r);
    game.player.steps += 1;
    cell.visited = true;

    if (targetObject === 'exit') {
        game.objectiveProgress.exitReached = true;
        updateObjectiveProgress();
        awardXp(XP_REWARDS.room + game.roomDepth * 6, currentLanguage === 'es-419' ? 'Sala completada' : 'Room complete');
        game.roomStack.push(createRoomSnapshot());
        if (game.claimedRelicRooms.includes(game.roomDepth)) {
            game.roomDepth += 1;
            generateRoom('exit');
        } else {
            game.claimedRelicRooms.push(game.roomDepth);
            openRelicChoice();
        }
        return;
    }

    if (targetObject === 'finalExit') {
        endRun();
        return;
    }

    if (targetObject === 'entry') {
        loadPreviousRoom();
        return;
    }

    if (targetObject === 'vine') {
        applyDamage(VINE_DAMAGE, cell.q, cell.r, 'Vines');
        addLog('Vines', 'Thorny vines scraped the bee.');
        if (game.ended) return;
    }

    if (targetObject === 'npc') {
        openTraderMarket(cell);
        revealAroundPlayer();
        recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
        draw();
        return;
    }

    const interaction = resolveInteraction(targetObject, cell);
    applyRelicCollectionBonus(targetObject, interaction);
    game.message = interaction.message;
    addLog(OBJECTS[targetObject].name, interaction.message);
    addStatPopups(cell.q, cell.r, interaction.deltas);
    if (isEnemyObject(targetObject) && !interaction.consume) {
        game.player.q = previousPosition.q;
        game.player.r = previousPosition.r;
        game.playerMotion = null;
        game.player.steps -= 1;
    }
    revealAroundPlayer();
    if (interaction.consume) {
        if (isEnemyObject(targetObject)) {
            game.objectiveProgress.kills += 1;
            awardXp(getEnemyXp(targetObject), getEnemyDef(targetObject).name);
            applyEnemyKillRelics(cell);
        } else if (!['empty', 'entry', 'exit', 'finalExit', 'vine', 'stickyTrap'].includes(targetObject)) {
            if (['pollen', 'water', 'honeyDrop', 'nectarCache', 'cleanWater'].includes(targetObject)) {
                game.objectiveProgress.supplies += 1;
            }
            awardXp(getItemXp(targetObject), OBJECTS[targetObject]?.name, { silent: true });
        }
        cell.object = 'empty';
    }
    updateObjectiveProgress();
    moveBats();
    moveMites();
    recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
    draw();
}

function spendStamina(amount) {
    game.player.stamina = Math.max(0, game.player.stamina - amount);
    game.lastStaminaRegenAt = performance.now();
}

function applyRelicCollectionBonus(object, interaction) {
    if (!hasRelic('foragerPouch')) return;
    if (object !== 'pollen' && object !== 'water') return;
    if (game.foragerPouchCollected?.[object]) return;
    game.foragerPouchCollected[object] = true;
    game.player[object] += 1;
    game.runStats[object] += 1;
    interaction.deltas.push({ stat: object, amount: 1 });
    interaction.message += ` Forager Pouch added +1 ${object}.`;
}

function applyEnemyKillRelics(cell) {
    if (!hasRelic('battleRhythm')) return;
    const before = getAttackCooldownRemaining();
    if (before <= 0) return;
    game.player.attackReadyAt = Math.max(performance.now(), game.player.attackReadyAt - 200);
    addStatPopups(cell.q, cell.r, [{ stat: 'cooldown', amount: -0.2 }]);
    addLog('Battle Rhythm', 'Enemy defeat shortened the current sting cooldown.');
}

function hasStaminaRecoveryResource() {
    return game.player.water > 0 || game.player.pollen > 0 || game.player.honey > 0;
}

function ensureStaminaForAction() {
    if (game.player.stamina > 0) return true;
    const resources = ['water', 'pollen', 'honey'].filter((resource) => game.player[resource] > 0);
    if (!resources.length) return false;
    const resource = randomFrom(resources);
    game.player[resource] -= 1;
    game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + 3);
    addStatPopups(game.player.q, game.player.r, [
        { stat: resource, amount: -1 },
        { stat: 'stamina', amount: 3 }
    ]);
    addLog(t('ui', 'stamina'), `${resource} restored stamina.`);
    return true;
}

function openWaxDoor(cell) {
    if (game.freeWaxDoorAvailable) {
        if (!ensureStaminaForAction()) {
            showBlockedAction(cell, t('ui', 'blockedStamina'));
            return;
        }
        spendStamina(1);
        game.freeWaxDoorAvailable = false;
        cell.object = 'empty';
        game.message = 'Path Carver opened the wax door for free.';
        addLog('Path Carver', game.message);
        recordReplayEvent('playerAction', { object: 'waxDoor', q: cell.q, r: cell.r, method: 'pathCarver' });
        draw();
        return;
    }

    if (game.player.pollen > 0) {
        if (!ensureStaminaForAction()) {
            showBlockedAction(cell, t('ui', 'blockedStamina'));
            return;
        }
        spendStamina(1);
        game.player.pollen -= 1;
        cell.object = 'empty';
        addStatPopups(cell.q, cell.r, [{ stat: 'pollen', amount: -1 }]);
        game.message = 'Spent 1 pollen to open the wax door.';
        addLog('Wax Door', game.message);
        recordReplayEvent('playerAction', { object: 'waxDoor', q: cell.q, r: cell.r, method: 'pollen' });
        draw();
        return;
    }

    if (getAttackCooldownRemaining() <= 0) {
        if (!ensureStaminaForAction()) {
            showBlockedAction(cell, t('ui', 'blockedStamina'));
            return;
        }
        spendStamina(1);
        game.player.attackReadyAt = performance.now() + game.player.attackCooldownMs;
        game.player.attackAnimationUntil = performance.now() + 520;
        cell.object = 'empty';
        game.message = 'Stung through the wax door. Sting is now cooling down.';
        addLog('Wax Door', game.message);
        recordReplayEvent('playerAction', { object: 'waxDoor', q: cell.q, r: cell.r, method: 'sting' });
        draw();
        return;
    }

    const seconds = (getAttackCooldownRemaining() / 1000).toFixed(1);
    game.message = `Wax door needs 1 pollen or a ready sting. Sting ready in ${seconds}s.`;
    addLog('Wax Door', game.message);
}

function handleDanceClick(cell) {
    danceSystem.handleClick(cell);
}

function isPlayerCell(cell) {
    return Boolean(cell && cell.q === game.player.q && cell.r === game.player.r);
}

function isActiveDanceCell(cell) {
    return danceSystem.isActiveCell(cell);
}

function startDanceHold(cell) {
    danceSystem.startHold(cell);
}

function endDanceHold() {
    danceSystem.endHold();
}

function showBlockedAction(cell, reason) {
    const message = reason || t('ui', 'blockedGeneric');
    game.message = message;
    addLog(currentLanguage === 'es-419' ? 'Acción bloqueada' : 'Blocked Action', message);
    addWarningPopup(cell?.q ?? game.player.q, cell?.r ?? game.player.r, message);
    recordReplayEvent('blockedAction', { q: cell?.q, r: cell?.r, reason: message });
    draw();
}

function addWarningPopup(q, r, message) {
    const point = hexToPixel(q, r);
    const activeWarnings = game.statPopups.filter((popup) => popup.icon === 'blockedAction').length;
    game.statPopups.push({
        x: point.x,
        y: point.y - point.size * 0.7,
        offsetY: activeWarnings * 30,
        label: message,
        textWidth: Math.max(70, message.length * 7),
        icon: 'blockedAction',
        color: '#ffd7cf',
        createdAt: performance.now(),
        duration: 2600
    });
}

function getPlayerMaxHealth() {
    return game.player.maxHealth || 7;
}

function getEnemyXp(object) {
    const enemy = getEnemyDef(object);
    return XP_REWARDS.enemy + (enemy.hp || 1) * 4 + Math.max(0, game.roomDepth - 1) * 2;
}

function getItemXp(object) {
    const special = getObjectUnlockLevel(object) > 1 || ['npc', 'upgrade', 'stingUpgrade'].includes(object);
    return special ? XP_REWARDS.specialItem : XP_REWARDS.item;
}

function healPlayer(amount) {
    const previousHealth = game.player.health;
    game.player.health = Math.min(getPlayerMaxHealth(), game.player.health + amount);
    return game.player.health - previousHealth;
}

function pauseEnemyTimers(durationMs, q = game.player.q, r = game.player.r, radius = 99) {
    const until = performance.now() + durationMs;
    game.cells
        .filter((cell) => isEnemyObject(cell.object) && hexDistance(q, r, cell.q, cell.r) <= radius)
        .forEach((enemy) => {
            enemy.nextAttackAt = Math.max(enemy.nextAttackAt || 0, until);
            enemy.nextAuraAt = Math.max(enemy.nextAuraAt || 0, until);
            enemy.nextSpecialAt = Math.max(enemy.nextSpecialAt || 0, until);
        });
}

function revealRouteToExit() {
    if (!game.exitCell) return;
    let cursor = { q: game.player.q, r: game.player.r };
    for (let i = 0; i < 10; i++) {
        const cell = getCell(cursor.q, cursor.r);
        if (cell) cell.revealed = true;
        if (cursor.q === game.exitCell.q && cursor.r === game.exitCell.r) break;
        const next = HEX_DIRECTIONS
            .map((direction) => ({ q: cursor.q + direction.q, r: cursor.r + direction.r }))
            .filter((step) => getCell(step.q, step.r))
            .sort((a, b) => (
                hexDistance(a.q, a.r, game.exitCell.q, game.exitCell.r)
                - hexDistance(b.q, b.r, game.exitCell.q, game.exitCell.r)
            ))[0];
        if (!next) break;
        cursor = next;
    }
    const exit = getCell(game.exitCell.q, game.exitCell.r);
    if (exit) exit.revealed = true;
    updateObjectiveProgress();
}

function resolveInteraction(object, cell) {
    if (isEnemyObject(object)) {
        const enemy = getEnemyDef(object);
        if (game.roomFirstStingAvailable) {
            game.roomFirstStingAvailable = false;
            game.player.attackReadyAt = performance.now();
        } else {
            game.player.attackReadyAt = performance.now() + game.player.attackCooldownMs;
        }
        game.player.attackAnimationUntil = performance.now() + 520;
        const usesDoubleSting = (object === 'bat' || object === 'sleepingBat') && game.player.stingCharges > 0;
        const hitPower = usesDoubleSting ? 2 : 1;
        cell.hits = (cell.hits || 0) + hitPower;
        cell.nextAttackAt = 0;
        cell.nextAuraAt = 0;
        if (usesDoubleSting) {
            game.player.stingCharges -= 1;
        }
        const killed = cell.hits >= enemy.hp;
        if (killed) {
            game.runStats.kills += 1;
        }
        return {
            message: !killed
                ? `${enemy.name} hit ${cell.hits}/${enemy.hp}. It still blocks the way.`
                : usesDoubleSting
                ? `Double sting defeated the ${enemy.name.toLowerCase()}.`
                : `${enemy.name} defeated.`,
            deltas: usesDoubleSting ? [{ stat: 'stingCharges', amount: -1 }] : [],
            consume: killed
        };
    }

    return itemSystem.resolve(object, cell);
}

function createRoomSnapshot() {
    return {
        depth: game.roomDepth,
        cells: game.cells.map((cell) => ({ ...cell })),
        entryCell: { ...game.entryCell },
        exitCell: { ...game.exitCell },
        playerQ: game.exitCell.q,
        playerR: game.exitCell.r
    };
}

function loadPreviousRoom() {
    const previousRoom = game.roomStack.pop();
    if (!previousRoom) {
        game.message = 'This is the first chamber. The entry hums quietly.';
        addLog('Entry', game.message);
        draw();
        return;
    }

    game.roomDepth = previousRoom.depth;
    game.cells = previousRoom.cells.map((cell) => ({ ...cell }));
    game.entryCell = { ...previousRoom.entryCell };
    game.exitCell = { ...previousRoom.exitCell };
    game.statPopups = [];
    game.player.q = previousRoom.playerQ;
    game.player.r = previousRoom.playerR;
    const playerCell = getCell(game.player.q, game.player.r);
    if (playerCell) playerCell.visited = true;
    revealAroundPlayer();
    game.message = `Returned to chamber ${game.roomDepth}.`;
    addLog('Entry', game.message);
    draw();
}

function moveBats() {
    const bats = game.cells.filter((cell) => cell.object === 'bat' || (cell.object === 'sleepingBat' && cell.awake));
    const plannedMoves = [];

    bats.forEach((bat) => {
        const candidates = HEX_DIRECTIONS
            .map((direction) => getCell(bat.q + direction.q, bat.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && !(cell.q === game.player.q && cell.r === game.player.r));

        if (!candidates.length) return;

        const currentDistance = hexDistance(bat.q, bat.r, game.player.q, game.player.r);
        const best = candidates
            .map((cell) => ({
                cell,
                distance: hexDistance(cell.q, cell.r, game.player.q, game.player.r)
            }))
            .sort((a, b) => a.distance - b.distance)[0];

        if (best.distance < currentDistance && !plannedMoves.some((move) => move.to === best.cell)) {
            plannedMoves.push({ from: bat, to: best.cell, object: bat.object, awake: bat.awake, hits: bat.hits || 0 });
        }
    });

    plannedMoves.forEach((move) => {
        move.from.object = 'empty';
        move.from.nextAttackAt = 0;
        move.to.object = move.object;
        move.to.nextAttackAt = 0;
        move.to.awake = move.awake;
        move.to.hits = move.hits;
        move.from.awake = false;
        move.from.hits = 0;
    });

    if (plannedMoves.length) {
        addLog('Bat Movement', `${plannedMoves.length} bat${plannedMoves.length === 1 ? '' : 's'} moved closer.`);
        recordReplayEvent('enemyMove', { enemy: 'bat', count: plannedMoves.length });
    }
}

function moveMites() {
    if (game.player.steps % MITE_MOVE_STEP_INTERVAL !== 0) return;

    const mites = game.cells.filter((cell) => cell.object === 'miteSwarm');
    const plannedMoves = [];

    mites.forEach((mite) => {
        const candidates = HEX_DIRECTIONS
            .map((direction) => getCell(mite.q + direction.q, mite.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && !(cell.q === game.player.q && cell.r === game.player.r));

        if (!candidates.length) return;

        const currentDistance = hexDistance(mite.q, mite.r, game.player.q, game.player.r);
        const best = candidates
            .map((cell) => ({
                cell,
                distance: hexDistance(cell.q, cell.r, game.player.q, game.player.r)
            }))
            .sort((a, b) => a.distance - b.distance)[0];

        if (best.distance < currentDistance && !plannedMoves.some((move) => move.to === best.cell)) {
            plannedMoves.push({ from: mite, to: best.cell });
        }
    });

    plannedMoves.forEach((move) => {
        move.from.object = 'empty';
        move.from.nextAuraAt = 0;
        move.to.object = 'miteSwarm';
        move.to.nextAuraAt = 0;
    });

    if (plannedMoves.length) {
        addLog('Mite Movement', `${plannedMoves.length} mite swarm${plannedMoves.length === 1 ? '' : 's'} crept closer.`);
        recordReplayEvent('enemyMove', { enemy: 'miteSwarm', count: plannedMoves.length });
    }
}

function updateBatAttacks() {
    if (game.ended || game.player.health <= 0) return;

    const now = performance.now();
    game.cells
        .filter((cell) => cell.object === 'bat' || (cell.object === 'sleepingBat' && cell.awake))
        .forEach((bat) => {
            const enemy = getEnemyDef(bat.object);
            if (!isAdjacent(bat.q, bat.r, game.player.q, game.player.r)) {
                bat.nextAttackAt = 0;
                return;
            }

            if (!bat.nextAttackAt) {
                bat.nextAttackAt = now + enemy.intervalMs;
                return;
            }

            if (now >= bat.nextAttackAt) {
                applyDamage(enemy.attack, bat.q, bat.r, `${enemy.name} Bite`);
                addLog(`${enemy.name} Bite`, `${enemy.name} hit you for ${enemy.attack} damage.`);
                recordReplayEvent('enemyDamage', { enemy: bat.object, q: bat.q, r: bat.r, amount: enemy.attack });
                bat.nextAttackAt = now + enemy.intervalMs;
            }
        });
}

function updateEnemyAuras() {
    if (game.ended || game.player.health <= 0) return;

    const now = performance.now();
    game.cells
        .filter((cell) => hasTimedAura(cell.object))
        .forEach((enemyCell) => {
            const enemy = getEnemyDef(enemyCell.object);
            if (hexDistance(enemyCell.q, enemyCell.r, game.player.q, game.player.r) > enemy.range) {
                enemyCell.nextAuraAt = 0;
                return;
            }

            if (!enemyCell.nextAuraAt) {
                enemyCell.nextAuraAt = now + enemy.intervalMs;
                return;
            }

            if (now >= enemyCell.nextAuraAt) {
                if (!enemySystem.handleTimedThreat(enemyCell, enemy, now)) {
                    applyDamage(enemy.attack, enemyCell.q, enemyCell.r, `${enemy.name} Attack`);
                    recordReplayEvent('enemyDamage', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, amount: enemy.attack });
                }
                enemyCell.nextAuraAt = now + enemy.intervalMs;
            }
        });
}

function updateSleepingEnemies() {
    game.cells
        .filter((cell) => cell.object === 'sleepingBat' && !cell.awake)
        .forEach((bat) => {
            if (hexDistance(bat.q, bat.r, game.player.q, game.player.r) <= 2) {
                bat.awake = true;
                bat.nextAttackAt = 0;
                addLog('Sleeping Bat', 'A sleeping bat woke up and started hunting.');
                recordReplayEvent('enemyWake', { enemy: bat.object, q: bat.q, r: bat.r });
            }
        });
}

function applyDamage(amount, q, r, source) {
    if (game.ended || amount <= 0) return;

    const blocked = Math.min(game.player.upgrades, amount);
    const healthDamage = amount - blocked;
    const deltas = [];

    if (blocked > 0) {
        game.player.upgrades -= blocked;
        deltas.push({ stat: 'blocked', amount: -blocked });
    }

    if (healthDamage > 0) {
        game.player.health = Math.max(0, game.player.health - healthDamage);
        game.objectiveProgress.tookDamage = true;
        deltas.push({ stat: 'health', amount: -healthDamage });
        game.lastDamageSource = source;
        game.deathTip = getDeathTip(source);
    }

    addStatPopups(q, r, deltas);

    if (blocked > 0 && healthDamage === 0) {
        game.message = `${source} blocked by shield.`;
    } else if (healthDamage > 0) {
        game.message = `${source} dealt ${healthDamage} health damage.`;
    }

    recordReplayEvent('damage', { source, amount, q, r, blocked, healthDamage });

    if (game.player.health <= 0) {
        endRun('death');
    }
}

function getDeathTip(source = '') {
    const lower = source.toLowerCase();
    if (lower.includes('bat')) return 'Bats punish standing adjacent. Save Double Sting or move away before the bite timer fills.';
    if (lower.includes('wasp')) return 'Wasp pressure is about timing. Back out of its ring while your sting is cooling down.';
    if (lower.includes('vine')) return 'Vines are permanent taxes. Cross them only when you can afford the health or shield loss.';
    if (lower.includes('moth')) return 'Moths are support threats. Clear them early before they steal tempo or hide the room.';
    if (lower.includes('beetle')) return 'Beetles control chokepoints. Do not linger beside one without shield.';
    return 'Watch the top-right danger timers and leave threatened cells before they fill.';
}

function isEnemyObject(object) {
    return Boolean(ENEMY_DEFS[object]);
}

function getEnemyDef(object) {
    return ENEMY_DEFS[object] || null;
}

function hasTimedAura(object) {
    return enemySystem.hasTimedThreat(object);
}

function endRun(reason = 'final-exit') {
    if (game.ended) return;
    game.ended = true;
    danceSystem.applyRewards(reason);
    stopAllMusic();
    updateProgression();
    const survivedMs = performance.now() - game.runStartedAt;
    const seconds = Math.floor(survivedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const danceComplete = game.dance
        ? danceSystem.getFoodPercentage()
        : 100;

    game.message = reason === 'death'
        ? `Game over. ${game.lastDamageSource || 'The last hit'} ended the run.`
        : reason === 'dance-failed'
        ? `The path to food faded. ${danceComplete}% complete.`
        : 'The dance revealed the path to food.';
    addLog(reason === 'death' ? 'Game Over' : reason === 'dance-failed' ? 'Dance Failed' : 'Dance Complete', game.message);

    const stats = [
        [currentLanguage === 'es-419' ? 'Bajas' : 'Kills', game.runStats.kills],
        [t('stats', 'pollen')[0], game.runStats.pollen],
        [t('stats', 'water')[0], game.runStats.water],
        [t('ui', 'honey'), game.runStats.honey],
        ...(game.dance ? [[currentLanguage === 'es-419' ? 'Multiplicador de baile' : 'Dance Multiplier', `x${game.dance.multiplier.toFixed(1)}`]] : []),
        [currentLanguage === 'es-419' ? 'XP ganada' : 'XP Gained', game.runStats.xp],
        [currentLanguage === 'es-419' ? 'Nivel de abeja' : 'Bee Level', progression.level],
        [currentLanguage === 'es-419' ? 'Tiempo sobrevivido' : 'Time Survived', `${minutes}:${String(remainingSeconds).padStart(2, '0')}`],
        [currentLanguage === 'es-419' ? 'Camino a la comida' : 'Path to Food', reason === 'death' ? '0%' : `${danceComplete}%`],
        ...(reason === 'death' ? [
            [currentLanguage === 'es-419' ? 'Causa' : 'Cause', game.lastDamageSource || 'Unknown'],
            [currentLanguage === 'es-419' ? 'Consejo' : 'Tip', game.deathTip || getDeathTip()]
        ] : []),
        [currentLanguage === 'es-419' ? 'Polen total' : 'Lifetime Pollen', progression.lifetimePollen],
        [currentLanguage === 'es-419' ? 'Miel total' : 'Lifetime Honey', progression.lifetimeHoney],
        [currentLanguage === 'es-419' ? 'Desbloqueos' : 'Unlocks', getProgressionUnlockText()],
        [currentLanguage === 'es-419' ? 'Semilla' : 'Seed', game.runSeed]
    ];

    endStatsNode.innerHTML = stats.map(([label, value]) => (
        `<div><span>${label}</span><strong>${value}</strong></div>`
    )).join('');
    recordReplayEvent('runEnd', { reason });
    endScreen.classList.add('visible');
}

function updateProgression() {
    progression.lifetimePollen += game.runStats.pollen;
    progression.lifetimeHoney += game.runStats.honey;
    progression.bestRoom = Math.max(progression.bestRoom || 1, game.roomDepth);
    const seen = new Set(progression.encyclopedia || []);
    game.cells.forEach((cell) => {
        if (cell.revealed && cell.object !== 'empty') {
            seen.add(cell.object);
        }
    });
    progression.encyclopedia = [...seen].slice(0, 80);
    saveProgression();
}

function getProgressionUnlockText() {
    const unlocks = [];
    if (progression.lifetimeHoney >= 5) unlocks.push('gold trail');
    if (progression.lifetimePollen >= 12) unlocks.push('pollen trail');
    if ((progression.encyclopedia || []).length >= 10) unlocks.push('field notes');
    return unlocks.length ? unlocks.join(', ') : 'none yet';
}

function getCell(q, r) {
    return game.cells.find((cell) => cell.q === q && cell.r === r);
}

function recordReplayEvent(type, payload = {}) {
    if (game.replay || game.mode === 'menu') return;
    game.replayEvents.push({
        type,
        payload,
        at: Math.round(performance.now() - game.runStartedAt),
        snapshot: createReplaySnapshot()
    });
}

function createReplaySnapshot() {
    return {
        capturedAt: performance.now(),
        seed: game.runSeed,
        mode: game.mode,
        roomDepth: game.roomDepth,
        cells: game.cells.map((cell) => ({ ...cell })),
        player: { ...game.player },
        runStats: { ...game.runStats },
        statPopups: game.statPopups.map((popup) => ({ ...popup })),
        playerMotion: game.playerMotion ? { ...game.playerMotion } : null,
        cameraPan: { ...game.cameraPan },
        message: game.message,
        dance: game.dance ? JSON.parse(JSON.stringify(game.dance)) : null,
        ended: game.ended
    };
}

function applyReplaySnapshot(snapshot) {
    const now = performance.now();
    const capturedAt = snapshot.capturedAt || now;
    game.mode = snapshot.mode;
    game.roomDepth = snapshot.roomDepth;
    game.cells = snapshot.cells.map((cell) => ({ ...cell }));
    game.player = { ...snapshot.player };
    game.runStats = { ...snapshot.runStats };
    game.statPopups = (snapshot.statPopups || []).map((popup, index) => ({
        ...popup,
        createdAt: performance.now() + index * 60
    }));
    game.playerMotion = snapshot.playerMotion ? { ...snapshot.playerMotion, startedAt: now } : null;
    game.cameraPan = snapshot.cameraPan ? { ...snapshot.cameraPan } : { x: 0, y: 0 };
    game.message = snapshot.message;
    game.dance = snapshot.dance ? normalizeReplayDanceTiming(JSON.parse(JSON.stringify(snapshot.dance)), capturedAt, now) : null;
    game.ended = snapshot.ended;
    syncReplayAudio();
}

function normalizeReplayDanceTiming(dance, capturedAt, now) {
    if (!dance?.active) return dance;
    const active = dance.active;
    if (active.createdAt) {
        active.createdAt = now - Math.max(0, capturedAt - active.createdAt);
    }
    if (active.expiresAt) {
        active.expiresAt = now + Math.max(0, active.expiresAt - capturedAt);
    }
    if (active.holdStartedAt) {
        active.holdStartedAt = now - Math.max(0, capturedAt - active.holdStartedAt);
    }
    return dance;
}

function syncReplayAudio() {
    if (!game.replay || game.replay.paused || game.ended) {
        audioSystem.pauseAll();
        return;
    }
    if (game.mode === 'dance') {
        audioSystem.play('dance');
    } else if (game.mode === 'dungeon') {
        audioSystem.play('gameplay');
    } else {
        audioSystem.pauseAll();
    }
}

function startReplay() {
    if (!game.replayEvents.length) return;
    stopAllMusic();
    const events = game.replayEvents.map((event) => ({
        ...event,
        snapshot: JSON.parse(JSON.stringify(event.snapshot))
    }));
    endScreen.classList.remove('visible');
    startScreen.classList.add('hidden');
    replayControls.classList.add('visible');
    game.replay = {
        events,
        index: 0,
        paused: false,
        timer: 0
    };
    applyReplaySnapshot(events[0].snapshot);
    setReplaySpeed(1);
    replayPauseButton.textContent = 'II';
    syncReplayAudio();
    scheduleReplayStep();
}

function scheduleReplayStep() {
    if (!game.replay || game.replay.paused) return;
    window.clearTimeout(game.replay.timer);
    game.replay.timer = window.setTimeout(advanceReplay, REPLAY_STEP_MS / replaySpeed);
}

function advanceReplay() {
    if (!game.replay || game.replay.paused) return;
    game.replay.index += 1;
    if (game.replay.index >= game.replay.events.length) {
        game.replay.index = game.replay.events.length - 1;
        game.replay.paused = true;
        replayPauseButton.textContent = '>';
        syncReplayAudio();
        return;
    }
    applyReplaySnapshot(game.replay.events[game.replay.index].snapshot);
    scheduleReplayStep();
}

function toggleReplayPause() {
    if (!game.replay) return;
    game.replay.paused = !game.replay.paused;
    replayPauseButton.textContent = game.replay.paused ? '>' : 'II';
    syncReplayAudio();
    scheduleReplayStep();
}

function closeReplay() {
    if (game.replay?.timer) {
        window.clearTimeout(game.replay.timer);
    }
    game.replay = null;
    stopAllMusic();
    replayControls.classList.remove('visible');
    showMainMenu();
}

function setReplaySpeed(speed) {
    replaySpeed = Math.max(1, Number(speed) || 1);
    replaySpeedButtons.forEach((button) => {
        button.classList.toggle('active', Number(button.dataset.speed) === replaySpeed);
    });
    if (game.replay && !game.replay.paused) {
        scheduleReplayStep();
    }
}

function getAttackCooldownRemaining() {
    return Math.max(0, game.player.attackReadyAt - performance.now());
}

function isAdjacent(q1, r1, q2, r2) {
    return HEX_DIRECTIONS.some((direction) => (
        q1 + direction.q === q2 && r1 + direction.r === r2
    ));
}

function hexDistance(q1, r1, q2, r2) {
    const s1 = -q1 - r1;
    const s2 = -q2 - r2;
    return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(s1 - s2));
}

function shade(hex, amount) {
    const value = Number.parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (value >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (value & 255) + amount));
    return `rgb(${r}, ${g}, ${b})`;
}

function addStatPopups(q, r, deltas) {
    if (!deltas.length) return;

    const point = hexToPixel(q, r);
    deltas.forEach((delta, index) => {
        const label = formatDelta(delta);
        game.statPopups.push({
            x: point.x,
            y: point.y - point.size * 0.62,
            offsetY: index * 22,
            label,
            textWidth: Math.max(28, label.length * 9),
            icon: getDeltaIcon(delta),
            color: delta.stat === 'blocked' ? '#b8b8b8' : delta.amount < 0 ? '#ff8a72' : '#fff2a7',
            createdAt: performance.now() + index * 70,
            duration: 920
        });
    });
}

function getDeltaIcon(delta) {
    if (delta.stat === 'health' && delta.amount > 0) return 'heart';
    if ((delta.stat === 'upgrades' && delta.amount > 0) || delta.stat === 'blocked') return 'shield';
    return null;
}

function formatDelta(delta) {
    const prefix = delta.amount > 0 ? '+' : '';
    const labels = {
        health: t('stats', 'health')[0],
        pollen: t('stats', 'pollen')[0],
        water: t('stats', 'water')[0],
        honey: t('ui', 'honey'),
        upgrades: t('stats', 'shield')[0],
        stamina: t('ui', 'stamina'),
        stingCharges: t('stats', 'doubleSting')[0],
        cooldown: t('ui', 'cooldown'),
        blocked: currentLanguage === 'es-419' ? 'bloqueado' : 'blocked'
    };
    if (delta.stat === 'blocked') {
        return `${delta.amount} ${labels.blocked}`;
    }
    const value = delta.stat === 'cooldown' ? `${prefix}${delta.amount.toFixed(1)}s` : `${prefix}${delta.amount}`;
    return `${value} ${labels[delta.stat] || delta.stat}`;
}

function addLog(title, message) {
    game.logs.push({
        turn: game.logs.length,
        title,
        message
    });

    if (game.logs.length > 60) {
        game.logs.shift();
    }

    renderLog();
}

function renderStats() {
    const statsText = I18N[currentLanguage].stats;
    const stats = [
        [statsText.health[0], game.player.health, statsText.health[1]],
        [statsText.pollen[0], game.player.pollen, statsText.pollen[1]],
        [statsText.water[0], game.player.water, statsText.water[1]],
        [t('ui', 'honey'), game.player.honey, t('ui', 'honeyHint')],
        [statsText.shield[0], game.player.upgrades, statsText.shield[1]],
        [statsText.doubleSting[0], game.player.stingCharges, statsText.doubleSting[1]],
        [t('ui', 'stamina'), `${game.player.stamina}/${game.player.maxStamina}`, t('ui', 'staminaHint')],
        [game.mode === 'dance' ? statsText.dance[0] : statsText.room[0], game.mode === 'dance' ? `${game.dance?.completed || 0}/${danceSystem.getMovesRequired()}` : game.roomDepth, game.mode === 'dance' ? `${game.dance?.misses || 0} misses | x${(game.dance?.multiplier || 1).toFixed(1)}` : statsText.room[1]],
        [statsText.steps[0], game.player.steps, statsText.steps[1]]
    ];

    statsNode.innerHTML = stats.map(([label, value, hint]) => (
        `<div class="stat"><span>${label}<small>${hint}</small></span><strong>${value}</strong></div>`
    )).join('');
    renderStatsHud(statsText);
    renderTimerHud();
}

function renderStatsHud(statsText) {
    if (game.mode === 'dance') {
        hudRenderer.renderStats([]);
        return;
    }
    const firstRoom = game.roomDepth === 1;
    const items = [
        { id: 'health', value: game.player.health, title: `${statsText.health[0]}: ${statsText.health[1]}`, icon: 'heart', color: '#e76f51', tone: game.player.health <= 2 ? 'danger' : '' },
        { id: 'shield', value: game.player.upgrades, title: `${statsText.shield[0]}: ${statsText.shield[1]}`, sprite: 'upgrade', fallback: 'S', color: '#b787f4' },
        { id: 'stamina', value: `${game.player.stamina}/${game.player.maxStamina}`, title: `${t('ui', 'stamina')}: ${t('ui', 'staminaHint')}`, icon: 'bolt', color: '#f5c84b' },
        { id: 'objective', value: game.roomObjective?.isComplete() ? 'OK' : '...', title: getRoomObjectiveText() || (currentLanguage === 'es-419' ? 'Objetivo de sala' : 'Room objective'), fallback: 'OBJ', color: '#9ee7ff', tone: game.roomObjective?.isComplete() ? '' : 'warning' }
    ];
    if (!firstRoom || game.player.pollen > 0) {
        items.splice(1, 0, { id: 'pollen', value: game.player.pollen, title: `${statsText.pollen[0]}: ${statsText.pollen[1]}`, sprite: 'pollen', fallback: 'P', color: '#f7d45c' });
    }
    if (!firstRoom || game.player.water > 0) {
        items.splice(2, 0, { id: 'water', value: game.player.water, title: `${statsText.water[0]}: ${statsText.water[1]}`, sprite: 'water', fallback: 'W', color: '#4bb6f2' });
    }
    if (!firstRoom || game.player.honey > 0) {
        items.push({ id: 'honey', value: game.player.honey, title: `${t('ui', 'honey')}: ${t('ui', 'honeyHint')}`, sprite: 'honeyDrop', fallback: 'H', color: '#f2b544' });
    }
    if (!firstRoom || game.player.stingCharges > 0) {
        items.push({ id: 'sting', value: game.player.stingCharges, title: `${statsText.doubleSting[0]}: ${statsText.doubleSting[1]}`, sprite: 'stingUpgrade', fallback: '2x', color: '#f28f3b' });
    }
    if (!firstRoom || progression.xp > 0) {
        items.push({ id: 'level', value: getPlayerLevel(), title: `XP ${progression.xp}/${getXpForNextLevel()} - ${currentLanguage === 'es-419' ? 'desbloquea objetos y enemigos gradualmente' : 'gradually unlocks objects and enemies'}`, fallback: 'LV', color: '#fff2a7' });
    }
    if (!firstRoom) {
        items.push({ id: 'room', value: game.roomDepth, title: `${statsText.room[0]}: ${statsText.room[1]}`, icon: 'room', color: '#43aa8b' });
    }
    hudRenderer.renderStats(items);
}

function renderTimerHud() {
    if (game.mode === 'dance') {
        hudRenderer.renderTimers([]);
        return;
    }
    const items = [];
    const attackRemaining = getAttackCooldownRemaining();
    if (attackRemaining > 0) {
        items.push({
            id: 'attackCooldown',
            value: `${(attackRemaining / 1000).toFixed(1)}`,
            title: `${t('ui', 'locked')}: ${t('ui', 'avoidEnemies')}`,
            sprite: 'stingUpgrade',
            fallback: '!',
            color: '#ff8a72',
            tone: 'warning'
        });
    }

    const now = performance.now();
    game.cells
        .filter((cell) => isEnemyObject(cell.object))
        .forEach((cell) => {
            const enemy = getEnemyDef(cell.object);
            let remaining = 0;
            if ((cell.object === 'bat' || (cell.object === 'sleepingBat' && cell.awake)) && isAdjacent(cell.q, cell.r, game.player.q, game.player.r)) {
                remaining = Math.max(0, (cell.nextAttackAt || now + enemy.intervalMs) - now);
            } else if (hasTimedAura(cell.object) && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= enemy.range) {
                remaining = Math.max(0, (cell.nextAuraAt || now + enemy.intervalMs) - now);
            }
            if (remaining > 0) {
                const damage = enemy.attack > 0 ? `${enemy.attack} damage` : 'special';
                items.push({
                    id: `enemy-${cell.q},${cell.r}`,
                    value: `${Math.ceil(remaining / 100) / 10}`,
                    title: `${enemy.name}: ${damage}. ${enemy.behavior}`,
                    sprite: enemy.sprite,
                    fallback: getFallbackLabel(cell.object) || enemy.name.slice(0, 1),
                    color: enemy.color,
                    tone: 'danger'
                });
            }
        });

    const visibleItems = items.slice(0, 14);
    if (visibleItems.length && !game.replay) {
        showTutorialCallout(
            'dangerTimers',
            currentLanguage === 'es-419' ? 'Peligro cercano' : 'Nearby danger',
            currentLanguage === 'es-419'
                ? 'Los temporizadores de la esquina superior derecha muestran cuÃ¡ndo recibirÃ¡s daÃ±o si sigues en peligro.'
                : 'Top-right timers show when nearby enemies will deal damage if you stay in danger.'
        );
    }
    hudRenderer.renderTimers(visibleItems);
}

function renderCooldown() {
    const remaining = getAttackCooldownRemaining();
    const total = game.player.attackCooldownMs;
    const ready = remaining <= 0;
    const progress = ready ? 100 : Math.max(0, Math.min(100, 100 - remaining / total * 100));

    cooldownWidget.classList.toggle('ready', ready);
    cooldownWidget.classList.toggle('locked', !ready);
    cooldownWidget.style.setProperty('--cooldown-progress', `${progress}%`);
    cooldownText.textContent = ready ? t('ui', 'ready') : `${t('ui', 'locked')} ${(remaining / 1000).toFixed(1)}s`;
    cooldownHint.textContent = ready ? `${t('ui', 'cooldown')} ${(total / 1000).toFixed(1)}s` : t('ui', 'avoidEnemies');
    if (game.hover) {
        updateCursor(game.hover.cell);
    }
}

function renderLog() {
    logListNode.innerHTML = game.logs.map((entry) => (
        `<div class="log-entry">
            <strong>${entry.turn === 0 ? (currentLanguage === 'es-419' ? 'Inicio' : 'Start') : `${currentLanguage === 'es-419' ? 'Turno' : 'Turn'} ${entry.turn}: ${entry.title}`}</strong>
            ${entry.message}
        </div>`
    )).join('');
    logListNode.scrollTop = logListNode.scrollHeight;
    if (eventToastNode) {
        const latest = game.logs[game.logs.length - 1];
        eventToastNode.classList.toggle('visible', Boolean(latest));
        eventToastNode.setAttribute('aria-label', latest ? `${latest.title}. ${latest.message}` : '');
        eventToastNode.innerHTML = latest
            ? `<strong>${escapeHtml(latest.title)}</strong> <span>${escapeHtml(latest.message)}</span>`
            : '';
    }
}

function renderMessage() {
    turnTextNode.textContent = game.ended
        ? t('ui', 'runCompleteMessage')
        : game.player.health <= 0
        ? t('ui', 'deadMessage')
        : game.mode === 'dance'
        ? t('ui', 'danceMessage')
        : game.mode === 'relicChoice'
        ? t('ui', 'relicChoiceMessage')
        : t('ui', 'chooseNeighbor');
}

function getCellActionState(cell) {
    if (!cell) {
        return { available: false, reason: t('ui', 'blockedGeneric'), symbol: '?', color: '#b8c2aa' };
    }
    if (game.ended || game.mode === 'relicChoice') {
        return { available: false, reason: t('ui', 'blockedGeneric'), symbol: 'X', color: '#ff8a72' };
    }
    if (game.mode === 'dance') {
        return { available: true, symbol: '>', color: '#f5c84b' };
    }
    if (!cell.revealed) {
        return { available: false, reason: t('ui', 'blockedHidden'), symbol: '?', color: '#b8c2aa' };
    }
    if (!isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        return { available: false, reason: t('ui', 'blockedNotAdjacent'), symbol: 'i', color: '#b8c2aa' };
    }
    if (game.player.stamina <= 0 && !hasStaminaRecoveryResource()) {
        return { available: false, reason: t('ui', 'blockedStamina'), symbol: 'S', color: '#f5c84b' };
    }

    const object = cell.object;
    if (isEnemyObject(object)) {
        const ready = getAttackCooldownRemaining() <= 0;
        return {
            available: ready,
            reason: ready ? '' : t('ui', 'blockedCooldown'),
            symbol: '!',
            color: '#ff8a72'
        };
    }
    if (object === 'wall') {
        return {
            available: false,
            reason: OBJECTS.wall?.description || t('ui', 'blockedGeneric'),
            symbol: 'X',
            color: '#7c8780'
        };
    }
    if (object === 'waxDoor') {
        const canOpen = game.freeWaxDoorAvailable || game.player.pollen > 0 || getAttackCooldownRemaining() <= 0;
        return {
            available: canOpen,
            reason: canOpen ? '' : t('ui', 'blockedWaxDoor'),
            symbol: 'D',
            color: '#d6b25f'
        };
    }
    if (object === 'vine') return { available: true, symbol: '!', color: '#78a94e' };
    if (object === 'npc') return { available: true, symbol: '$', color: '#64b5f6' };
    if (object === 'exit' || object === 'entry' || object === 'finalExit') return { available: true, symbol: '>', color: '#f2bd4b' };
    if (object === 'empty' || object === 'stickyTrap') return { available: true, symbol: '.', color: '#fff2a7' };
    return { available: true, symbol: '+', color: '#fff2a7' };
}

function updateCursor(cell) {
    canvas.style.cursor = getCursorForCell(cell);
}

function getCursorForCell(cell) {
    if (!cell || game.ended || game.mode === 'relicChoice') return 'default';
    const action = getCellActionState(cell);
    return makeCursor(action.symbol, action.color, action.available);
}

function makeCursor(symbol, color, available = true) {
    const border = available ? '#f5c84b' : '#ff8a72';
    const forbidden = available ? '' : `
        <line x1="16" y1="28" x2="28" y2="16" stroke="#ff2f2f" stroke-width="4" stroke-linecap="round"/>
        <circle cx="22" cy="22" r="9" fill="none" stroke="#ff2f2f" stroke-width="3"/>
    `;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <path d="M5 3 L23 16 L15 18 L12 27 L5 3 Z" fill="#f3f0df" stroke="#111613" stroke-width="2"/>
        <circle cx="22" cy="22" r="9" fill="${color}" stroke="${border}" stroke-width="3"/>
        <circle cx="22" cy="22" r="11" fill="none" stroke="#111613" stroke-width="2"/>
        <text x="22" y="26" text-anchor="middle" font-family="Arial" font-size="13" font-weight="800" fill="#111613">${symbol}</text>
        ${forbidden}
    </svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 5 3, pointer`;
}

canvas.addEventListener('click', (event) => {
    if (game.suppressNextClick) {
        game.suppressNextClick = false;
        return;
    }
    if (game.mode === 'dance') return;

    const rect = canvas.getBoundingClientRect();
    const cell = pixelToClosestHex(event.clientX - rect.left, event.clientY - rect.top);
    moveTo(cell);
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cell = pixelToClosestHex(x, y);
    const previousKey = game.hover?.cell ? cellKey(game.hover.cell.q, game.hover.cell.r) : '';
    const nextKey = cell ? cellKey(cell.q, cell.r) : '';
    game.hover = {
        x,
        y,
        cell,
        startedAt: previousKey === nextKey ? game.hover.startedAt : performance.now()
    };
    updateCursor(game.hover.cell);
});

canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const cell = pixelToClosestHex(event.clientX - rect.left, event.clientY - rect.top);
    const canPan = event.button === 1 || event.pointerType === 'touch';
    if (event.button === 0 && cell) {
        game.dragAction = {
            id: event.pointerId,
            mode: game.mode,
            startCell: cell,
            startX: event.clientX,
            startY: event.clientY
        };
    }
    if (canPan && game.mode === 'dungeon') {
        event.preventDefault();
        game.pointer = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
            panning: false
        };
        canvas.setPointerCapture?.(event.pointerId);
    }

    if (game.mode !== 'dance' || game.ended) return;

    if (cell) {
        startDanceHold(cell);
    }
});

canvas.addEventListener('auxclick', (event) => {
    if (event.button === 1) {
        event.preventDefault();
    }
});

canvas.addEventListener('pointermove', (event) => {
    if (!game.pointer || game.pointer.id !== event.pointerId) return;
    const dx = event.clientX - game.pointer.lastX;
    const dy = event.clientY - game.pointer.lastY;
    const total = Math.hypot(event.clientX - game.pointer.startX, event.clientY - game.pointer.startY);
    if (total > 8) {
        game.pointer.panning = true;
        game.suppressNextClick = true;
    }
    if (game.pointer.panning) {
        game.cameraPan.x += dx;
        game.cameraPan.y += dy;
        game.hover = null;
        event.preventDefault();
    }
    game.pointer.lastX = event.clientX;
    game.pointer.lastY = event.clientY;
});

canvas.addEventListener('pointerup', (event) => {
    if (game.pointer?.panning) {
        game.suppressNextClick = true;
    }
    game.pointer = null;
    const drag = game.dragAction?.id === event.pointerId ? game.dragAction : null;
    if (drag) {
        const rect = canvas.getBoundingClientRect();
        const endCell = pixelToClosestHex(event.clientX - rect.left, event.clientY - rect.top);
        const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
        if (distance > 8 && endCell) {
            if (drag.mode === 'dungeon' && isPlayerCell(drag.startCell)) {
                game.suppressNextClick = true;
                moveTo(endCell);
            } else if (drag.mode === 'dance' && isPlayerCell(drag.startCell) && isActiveDanceCell(endCell)) {
                game.suppressNextClick = true;
                startDanceHold(endCell);
            }
        }
    }
    game.dragAction = null;
    if (game.mode === 'dance') {
        endDanceHold();
    }
});

canvas.addEventListener('pointerleave', () => {
    game.hover = null;
    game.pointer = null;
    game.dragAction = null;
    canvas.style.cursor = 'default';
    if (game.mode === 'dance') {
        endDanceHold();
    }
});

restartButton.addEventListener('click', createGrid);
endRestartButton.addEventListener('click', createGrid);
endReplayButton.addEventListener('click', startReplay);
endMenuButton.addEventListener('click', showMainMenu);
replayPauseButton.addEventListener('click', toggleReplayPause);
replayCloseButton.addEventListener('click', closeReplay);
replaySpeedButtons.forEach((button) => {
    button.addEventListener('click', () => setReplaySpeed(button.dataset.speed));
});
newRunButton.addEventListener('click', createGrid);
testDanceButton.addEventListener('click', testDanceRun);
statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('open');
    logPanel.classList.remove('open');
});
logToggle.addEventListener('click', () => {
    logPanel.classList.toggle('open');
    statsPanel.classList.remove('open');
});
optionsButton.addEventListener('click', () => {
    optionsPanel.classList.toggle('visible');
});
languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
menuLanguageSelect.addEventListener('change', () => setLanguage(menuLanguageSelect.value));
objectEditorSelect.addEventListener('change', renderObjectEditor);
saveObjectButton.addEventListener('click', saveObjectEditor);
resetObjectButton.addEventListener('click', resetObjectEditor);
relicChoicesNode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-relic-id]');
    if (button) {
        chooseRelic(button.dataset.relicId);
    }
});
campActionsNode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-camp-action]');
    if (button) {
        applyCampAction(button.dataset.campAction);
    }
});
campContinueButton.addEventListener('click', continueFromCamp);
window.addEventListener('resize', resizeCanvas);

setLanguage(currentLanguage);
renderStats();
renderRelics();
resizeCanvas();
requestAnimationFrame(animate);

