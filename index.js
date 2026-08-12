const canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
const statsPanel = document.getElementById('statsPanel');
const logPanel = document.getElementById('logPanel');
const statsToggle = document.getElementById('statsToggle');
const logToggle = document.getElementById('logToggle');
const statsNode = document.getElementById('stats');
const statsHudNode = document.getElementById('statsHud');
const timerHudNode = document.getElementById('timerHud');
const bottomCombatHudNode = document.getElementById('bottomCombatHud');
const eventToastNode = document.getElementById('eventToast');
const inspectPanelNode = document.getElementById('inspectPanel');
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
const themeSelect = document.getElementById('themeSelect');
const resetProgressionButton = document.getElementById('resetProgressionButton');
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
const testScreen = document.getElementById('testScreen');
const testObjectListNode = document.getElementById('testObjectList');
const testBackButton = document.getElementById('testBackButton');
const testControls = document.getElementById('testControls');
const testPauseButton = document.getElementById('testPauseButton');
const testListButton = document.getElementById('testListButton');
const settingsToggle = document.getElementById('settingsToggle');
const settingsScreen = document.getElementById('settingsScreen');
const settingsCloseButton = document.getElementById('settingsCloseButton');
const musicVolumeInput = document.getElementById('musicVolumeInput');
const effectsVolumeInput = document.getElementById('effectsVolumeInput');
const endScreen = document.getElementById('endScreen');
const endStatsNode = document.getElementById('endStats');
const endRestartButton = document.getElementById('endRestartButton');
const endReplayButton = document.getElementById('endReplayButton');
const endMenuButton = document.getElementById('endMenuButton');
const replayControls = document.getElementById('replayControls');
const replayPauseButton = document.getElementById('replayPauseButton');
const replayCloseButton = document.getElementById('replayCloseButton');
const replaySpeedButtons = [...document.querySelectorAll('.replay-speed')];
const loadingScreen = document.getElementById('loadingScreen');
const loadingText = document.getElementById('loadingText');
const loadingFill = document.getElementById('loadingFill');

const HEX_RADIUS = 4;
const VISIBLE_RADIUS = 4;
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
const START_MOVE_POINTS = 2;
const START_ATTACK_RANGE = 1;
const MAX_SHIELD = 5;
const DUNGEON_GRID_ZOOM = 1.12;
const BOSS_HIVE_COUNT = 1;
const STAMINA_REGEN_MS = 900;
const REPLAY_STEP_MS = 520;
const GAMEPLAY_MUSIC_SRC = 'assets/main_song.mp3';
const DANCE_MUSIC_SRC = 'assets/dancefloor.mp3';
const BOSS_MUSIC_SRC = '';
const PLANNED_BOSS_MUSIC_SRC = 'assets/boss_music.mp3';
const GAMEPLAY_MUSIC_VOLUME = 0.45;
const DANCE_MUSIC_VOLUME = 0.56;
const BOSS_MUSIC_VOLUME = 0.52;
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

const LANGUAGE_STORAGE_KEY = 'honeycombLanguage';
const OBJECT_EDITOR_STORAGE_KEY = 'honeycombObjectOverrides';
const PROGRESSION_STORAGE_KEY = 'honeycombProgression';
const AUDIO_SETTINGS_STORAGE_KEY = 'honeycombAudioSettings';
const THEME_STORAGE_KEY = 'honeycombDungeonTheme';
const LAST_RANDOM_THEME_STORAGE_KEY = 'honeycombLastRandomTheme';
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
let selectedThemeId = localStorage.getItem(THEME_STORAGE_KEY) || 'random';
let objectOverrides = loadObjectOverrides();
let progression = null;

const {
    I18N,
    RELICS,
    EQUIPMENT_SLOTS,
    EQUIPMENT_DEFS,
    SPRITE_DEFS,
    ENEMY_DEFS,
    OBJECTS,
    DEFAULT_OBJECT_COLORS,
    DEFAULT_ENEMY_NUMBERS,
    DISCOVERY_OBJECT_WEIGHTS,
    ENEMY_SPAWN_WEIGHTS
} = window.HW_CONTENT;

const {
    UI_ART_DEFS,
    TILE_ART_DEFS,
    THEME_TILE_SHEET_DEFS,
    HUD_ICON_ROWS
} = window.HW_ART;

const {
    BASE_XP_TO_LEVEL,
    DUNGEON_THEMES,
    OBJECT_UNLOCK_LEVELS,
    ROOM_PROFILES,
    XP_REWARDS
} = window.HW_PROGRESSION;

const progressionSystem = window.HW_PROGRESSION_SYSTEM.createProgressionSystem({
    storageKey: PROGRESSION_STORAGE_KEY,
    baseXpToLevel: BASE_XP_TO_LEVEL
});
progression = progressionSystem.load();

const uiArtAssets = {};
const tileArtAssets = {};
const themeTileSheetAssets = {};
const themeTileSheetMeta = {};
const spriteAssets = {};
let spriteFrames = {};
let spritesReady = false;
const rendererTools = window.HW_RENDERER.createRendererTools();
const assetLoader = {
    total: 0,
    complete: 0,
    ready: false
};
setStartButtonsLoading(true);
loadUiArt();
loadTileArt();
loadThemeTileSheets();
loadSprites();
queueMicrotask(checkAssetsReady);

const hudRenderer = window.HW_HUD.createHudRenderer({
    statsNode: statsHudNode,
    timerNode: timerHudNode,
    spriteDefs: SPRITE_DEFS,
    escapeHtml,
    escapeAttr
});

const choiceUi = window.HW_CHOICE_UI.createChoiceUi({
    escapeHtml,
    escapeAttr
});

const inspectUi = window.HW_INSPECT_UI.createInspectUi({
    escapeHtml,
    escapeAttr
});

const inspectStatsSystem = window.HW_INSPECT_STATS.createInspectStatsSystem({
    hudRows: HUD_ICON_ROWS,
    getLanguage: () => currentLanguage,
    vineDamage: VINE_DAMAGE,
    hasEnemyBehavior: (object, type) => Boolean(enemySystem?.hasBehavior(object, type)),
    getEnemyBehavior: (object, type) => enemySystem?.getBehavior(object, type)
});

const tacticalFlow = window.HW_TACTICAL_FLOW.createTacticalFlow({
    startMovePoints: START_MOVE_POINTS,
    startAttackRange: START_ATTACK_RANGE
});

const cellInteractions = window.HW_CELL_INTERACTIONS.createCellInteractionSystem({
    objects: OBJECTS
});

const runSummarySystem = window.HW_RUN_SUMMARY.createRunSummarySystem({
    getLanguage: () => currentLanguage
});

let tacticalCombat = null;
let campMarketController = null;
let enemyTurns = null;
let itemSystem = null;
let enemySystem = null;
let danceSystem = null;
let dungeonGenerator = null;
let replaySystem = null;
let pathfindingSystem = null;
let roomTemplateSystem = null;
let menuController = null;
let replaySpeed = 1;
let toastHideTimer = null;

function createEmptyMetrics() {
    return {
        turns: 0,
        movesMade: 0,
        cellsMoved: 0,
        attacksMade: 0,
        turnsWithoutAction: 0,
        damageBySource: {},
        enemiesKilled: 0,
        enemiesAvoided: 0,
        resourcesCollected: { pollen: 0, water: 0, honey: 0 },
        roomEndUnspent: [],
        bossTurns: 0,
        bossAttackRetreatLoops: 0,
        repeatedAttackRetreatPatterns: 0,
        lastAttack: null,
        lastAction: null
    };
}

const audioTracks = {
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
};

if (BOSS_MUSIC_SRC) {
    audioTracks.boss = {
        src: BOSS_MUSIC_SRC,
        volume: BOSS_MUSIC_VOLUME,
        loop: true
    };
}

const audioSystem = window.HW_AUDIO.createAudioSystem({
    tracks: audioTracks
});
const audioSettings = loadAudioSettings();
audioSystem.setMusicVolume(audioSettings.music);
audioSystem.setEffectsVolume(audioSettings.effects);

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
    'waspHive',
    'crawlingFire',
    'honeySnareSpider',
    'burrowBeetle',
    'queenSignaler',
    'fogShepherd',
    'pollenThiefMoth',
    'waxSentinel',
    'mirrorWasp',
    'combBomber',
    'waterLeech',
    'larvaBrood',
    'vine',
    'burningCell',
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
    dungeonTheme: null,
    equipment: {},
    inspectedCell: null,
    inspectPinned: false,
    toast: null,
    lastToastId: 0,
    roomObjective: null,
    roomTemplate: null,
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
    isTestScenario: false,
    testPaused: false,
    activeTestObject: null,
    settingsPaused: false,
    bossEngaged: false,
    pathPreview: null,
    pathCache: {},
    autoPath: [],
    attackEffects: [],
    resolvingTurn: false,
    revealRadius: 2,
    roomFirstStingAvailable: false,
    freeWaxDoorAvailable: false,
    foragerPouchCollected: { pollen: false, water: false },
    royalJellyPollen: 0,
    currentRoomCells: [],
    caveMetadata: null,
    roomProfile: ROOM_PROFILES[0],
    roomSpawnCounts: {
        enemies: 0,
        hazards: 0,
        specialItems: 0
    },
    metrics: createEmptyMetrics(),
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
        movePoints: START_MOVE_POINTS,
        maxMovePoints: START_MOVE_POINTS,
        actionAvailable: true,
        attackRange: START_ATTACK_RANGE,
        stamina: START_MOVE_POINTS,
        maxStamina: START_MOVE_POINTS,
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

dungeonGenerator = window.HW_DUNGEON_GENERATION.createDungeonGenerator({
    directions: HEX_DIRECTIONS,
    helpers: {
        cellKey,
        hexDistance,
        seededRandom
    }
});

pathfindingSystem = window.HW_PATHFINDING.createPathfindingSystem({
    directions: HEX_DIRECTIONS,
    getCell,
    cellKey,
    hexDistance,
    getGame: () => game,
    isEnemyObject,
    getThreatAtCell,
    getMoveBudget: () => getRouteMoveBudget(),
    vineDamage: VINE_DAMAGE
});

roomTemplateSystem = window.HW_ROOM_TEMPLATES.createRoomTemplateSystem({
    game,
    directions: HEX_DIRECTIONS,
    seededRandom,
    randomFrom,
    getCell,
    hexDistance,
    isEnemyObject,
    isObjectAllowedByTheme,
    getPlayerLevel,
    getObjectUnlockLevel,
    getRoomProfile,
    chooseWeightedObject,
    cellKey,
    awardObjectiveXp: () => awardXp(XP_REWARDS.objective + game.roomDepth * 2, currentLanguage === 'es-419' ? 'Objetivo de sala' : 'Room objective'),
    addObjectivePopup: () => addWarningPopup(game.player.q, game.player.r, currentLanguage === 'es-419' ? 'Objetivo completo' : 'Objective complete'),
    getLanguage: () => currentLanguage
});

replaySystem = window.HW_REPLAY.createReplaySystem({
    game,
    helpers: {
        now: () => performance.now(),
        createSnapshot: createReplaySnapshot
    }
});

tacticalCombat = window.HW_TACTICAL_COMBAT.createTacticalCombat({
    finalRoom: FINAL_ROOM,
    revealAroundPlayer,
    updateObjectiveProgress,
    resolveEnemyTurn,
    startPlayerTurn
});

campMarketController = window.HW_CAMP_MARKET.createCampMarketController({
    getText: (id) => {
        const localized = I18N[currentLanguage]?.campActions?.[id] || I18N.en.campActions[id] || [id, ''];
        return { name: localized[0], description: localized[1] };
    },
    getPlayerLevel
});

enemyTurns = window.HW_ENEMY_TURNS.createEnemyTurns({
    updateSleepingEnemies,
    moveBats,
    moveMites,
    moveMirrorWasps,
    resolveTurnEnemyPressure,
    tickSpecialEnemyTelegraphs,
    updateArmoredEnemyFacing,
    resolveBossAntiKite
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

menuController = window.HW_MENU_CONTROLLER.createMenuController({
    nodes: {
        optionsPanel,
        startScreen,
        testScreen,
        testControls,
        relicScreen,
        campScreen,
        endScreen,
        settingsScreen
    },
    game,
    getLanguage: () => currentLanguage,
    stopAllMusic,
    startGameplayMusic,
    applyAudioSettings,
    audioSystem,
    renderTestObjectList,
    renderMessage,
    onTestPauseLabel: (paused) => {
        testPauseButton.textContent = paused
            ? (currentLanguage === 'es-419' ? 'Continuar' : 'Resume')
            : (currentLanguage === 'es-419' ? 'Pausar' : 'Pause');
    }
});
registerMoveInteractionHandlers();

function t(section, key) {
    return I18N[currentLanguage]?.[section]?.[key] ?? I18N.en[section]?.[key] ?? key;
}

function formatText(section, key, values = {}) {
    return Object.entries(values).reduce((text, [name, value]) => (
        text.replaceAll(`{${name}}`, value)
    ), t(section, key));
}

function loadObjectOverrides() {
    try {
        return JSON.parse(localStorage.getItem(OBJECT_EDITOR_STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function loadAudioSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY) || '{}');
        return {
            music: Number.isFinite(saved.music) ? saved.music : 1,
            effects: Number.isFinite(saved.effects) ? saved.effects : 1
        };
    } catch {
        return { music: 1, effects: 1 };
    }
}

function saveAudioSettings() {
    localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(audioSettings));
}

function applyAudioSettings() {
    audioSystem.setMusicVolume(audioSettings.music);
    audioSystem.setEffectsVolume(audioSettings.effects);
    if (musicVolumeInput) musicVolumeInput.value = String(Math.round(audioSettings.music * 100));
    if (effectsVolumeInput) effectsVolumeInput.value = String(Math.round(audioSettings.effects * 100));
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
    updateLoadingScreen();
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
        return registerRoomSpawn(chooseThemeWeightedObject([
            { object: 'empty', weight: 48 },
            { object: 'pollen', weight: 25 },
            { object: 'water', weight: 22 },
            { object: 'upgrade', weight: profile.allowedUtility.includes('upgrade') ? 5 : 0 }
        ], 'empty'));
    }

    let object = chooseThemeWeightedObject(profile.itemWeights, 'empty');
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
            && isObjectAllowedByTheme(option.object)
        ))
        .map((option) => ({ object: option.object, weight: option.weight }));
    return chooseWeightedObject(options, 'pollen');
}

function chooseThemeWeightedObject(options, fallback = 'empty') {
    const themeOptions = options.filter((option) => (
        option.object === 'enemy'
        || option.object === 'discovery'
        || option.object === 'empty'
        || isObjectAllowedByTheme(option.object)
    ));
    return chooseWeightedObject(themeOptions, fallback);
}

function saveProgression() {
    progressionSystem.save(progression);
}

function resetBeeProgression() {
    progression = progressionSystem.reset();
    renderStats();
    showTopToast(t('ui', 'testingSettings'), t('ui', 'progressionReset'), 'warning');
}

function startGameplayMusic() {
    audioSystem.play('gameplay');
}

function startBossMusic() {
    audioSystem.play(BOSS_MUSIC_SRC ? 'boss' : 'gameplay');
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
            && isObjectAllowedByTheme(option.object)
        ))
        .map((option) => ({ object: option.object, weight: option.weight }));

    if (!options.length) {
        return getCurrentTheme()?.enemies?.find((object) => profile.allowedEnemies.includes(object)) || 'enemy';
    }
    return chooseWeightedObject(options, 'enemy');
}

function chooseDungeonTheme() {
    if (getPlayerLevel() <= 1 && DUNGEON_THEMES?.forest) {
        return DUNGEON_THEMES.forest;
    }
    if (selectedThemeId !== 'random' && DUNGEON_THEMES?.[selectedThemeId]) {
        return DUNGEON_THEMES[selectedThemeId];
    }
    const themes = Object.values(DUNGEON_THEMES || {});
    const fallback = DUNGEON_THEMES?.forest || themes[0] || null;
    if (!themes.length) return fallback;
    const lastThemeId = localStorage.getItem(LAST_RANDOM_THEME_STORAGE_KEY);
    const candidates = themes.filter((theme) => theme.id !== lastThemeId);
    const pool = candidates.length ? candidates : themes;
    const chosen = pool[Math.floor(seededRandom() * pool.length)] || fallback;
    localStorage.setItem(LAST_RANDOM_THEME_STORAGE_KEY, chosen.id);
    return chosen || fallback;
}

function getCurrentTheme() {
    return game.dungeonTheme || DUNGEON_THEMES?.forest || Object.values(DUNGEON_THEMES || {})[0] || null;
}

function isObjectAllowedByTheme(object) {
    const theme = getCurrentTheme();
    if (!theme || ['empty', 'entry', 'exit', 'finalExit', 'wall'].includes(object)) return true;
    if (isEnemyObject(object)) return theme.enemies.includes(object);
    if (['vine', 'burningCell', 'stickyTrap', 'waxDoor', 'burrowWarningCell', 'bomberMarkedCell'].includes(object)) {
        return theme.hazards.includes(object);
    }
    return theme.items.includes(object);
}

function applyDungeonTheme() {
    const theme = getCurrentTheme();
    if (!theme) return;
    document.documentElement.style.setProperty('--art-board-bg', `url("${theme.boardBackground}")`);
    document.documentElement.style.setProperty('--theme-board-overlay', theme.boardOverlay || 'rgba(0, 0, 0, 0)');
    document.documentElement.style.setProperty('--theme-cell-tint', theme.cellTint || '#4d6f4f');
    document.documentElement.style.setProperty('--theme-border-tint', theme.borderTint || '#d8bd68');
}

function getObjectUnlockLevel(object) {
    return OBJECT_UNLOCK_LEVELS[object] || 1;
}

function getPlayerLevel() {
    return progressionSystem.getPlayerLevel(progression);
}

function getXpForNextLevel(level = getPlayerLevel()) {
    return progressionSystem.getXpForNextLevel(level);
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

    game.runStats.xp += value;
    const unlocked = [];

    const result = progressionSystem.awardXp(progression, value, {
        onLevelUp: (newLevel) => {
            unlocked.push(...getUnlocksForLevel(newLevel - 1, newLevel));
        }
    });
    if (result.leveled) {
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
    if (!resourcesReady()) return;
    startGameplayMusic();
    startScreen.classList.add('hidden');
    startRunState();
    generateRoom('restart');
}

function startRunState() {
    game.logs = [];
    game.roomDepth = 1;
    game.runStartedAt = performance.now();
    game.ended = false;
    game.mode = 'dungeon';
    game.runSeed = Date.now() >>> 0;
    game.rngState = game.runSeed;
    game.dungeonTheme = chooseDungeonTheme();
    applyDungeonTheme();
    game.equipment = createStartingEquipment();
    game.replayEvents = [];
    game.replay = null;
    game.cameraPan = { x: 0, y: 0 };
    game.pointer = null;
    game.dragAction = null;
    game.lastMoveDirection = null;
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
    game.inspectedCell = null;
    game.inspectPinned = false;
    game.toast = null;
    game.lastToastId = 0;
    game.roomObjective = null;
    game.roomTemplate = null;
    game.objectiveProgress = createObjectiveProgress();
    game.lastDamageSource = null;
    game.deathTip = '';
    game.danceFeedback = [];
    game.isTestScenario = false;
    game.testPaused = false;
    game.activeTestObject = null;
    game.settingsPaused = false;
    game.bossEngaged = false;
    game.pathPreview = null;
    game.pathCache = {};
    game.autoPath = [];
    game.attackEffects = [];
    game.resolvingTurn = false;
    game.revealRadius = 2;
    game.roomFirstStingAvailable = false;
    game.freeWaxDoorAvailable = false;
    game.foragerPouchCollected = { pollen: false, water: false };
    game.royalJellyPollen = 0;
    game.currentRoomCells = [];
    game.caveMetadata = null;
    game.roomProfile = ROOM_PROFILES[0];
    game.roomSpawnCounts = {
        enemies: 0,
        hazards: 0,
        specialItems: 0
    };
    game.metrics = createEmptyMetrics();
    game.runStats = {
        kills: 0,
        pollen: 0,
        water: 0,
        honey: 0,
        xp: 0
    };
    game.player = createFreshPlayer();
    applyEquipmentLoadout(game.player);
    relicScreen.classList.remove('visible');
    campScreen.classList.remove('visible');
    testScreen.classList.remove('visible');
    testControls.classList.remove('visible');
    endScreen.classList.remove('visible');
    replayControls.classList.remove('visible');
    renderRelics();
}

function testDanceRun() {
    if (!resourcesReady()) return;
    stopAllMusic();
    startScreen.classList.add('hidden');
    startRunState();
    game.roomDepth = FINAL_ROOM;
    generateDanceRoom();
}

function getTestObjectEntries() {
    return Object.entries(OBJECTS)
        .filter(([id]) => !['empty', 'entry', 'exit', 'finalExit'].includes(id))
        .map(([id, object]) => ({
            id,
            name: getDisplayNameForObject(id),
            description: getEnemyDef(id)?.behavior || object.description || '',
            kind: isEnemyObject(id)
                ? (currentLanguage === 'es-419' ? 'Enemigo' : 'Enemy')
                : ['vine', 'burningCell', 'burrowWarningCell', 'bomberMarkedCell', 'wall', 'waxDoor', 'stickyTrap'].includes(id)
                ? (currentLanguage === 'es-419' ? 'Terreno' : 'Terrain')
                : (currentLanguage === 'es-419' ? 'Objeto' : 'Item')
        }))
        .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

function renderTestObjectList() {
    choiceUi.renderObjectTests(testObjectListNode, getTestObjectEntries());
    drawTestObjectIcons();
}

function drawTestObjectIcons() {
    testObjectListNode.querySelectorAll('[data-test-icon]').forEach((icon) => {
        const iconCtx = icon.getContext('2d');
        const objectId = icon.dataset.testIcon;
        renderObjectIcon(iconCtx, objectId, icon.width, icon.height);
    });
}

function renderObjectIcon(targetCtx, objectId, width, height) {
    const previousCtx = ctx;
    try {
        ctx = targetCtx;
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.fillStyle = 'rgba(255, 246, 207, 0.82)';
        ctx.strokeStyle = OBJECTS[objectId]?.color || '#7b4a21';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width, height) * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        drawSprite(objectId, width / 2, height / 2, Math.min(width, height) * 0.42);
    } finally {
        ctx = previousCtx;
    }
}

function startObjectTestScenario(objectId) {
    if (!resourcesReady()) return;
    const object = OBJECTS[objectId];
    if (!object) return;

    startGameplayMusic();
    startScreen.classList.add('hidden');
    testScreen.classList.remove('visible');
    startRunState();
    game.mode = 'dungeon';
    game.isTestScenario = true;
    game.testPaused = false;
    game.activeTestObject = objectId;
    game.runSeed = (Date.now() >>> 0) ^ objectId.length;
    game.rngState = game.runSeed;
    game.roomDepth = Math.max(1, getObjectUnlockLevel(objectId));
    game.roomProfile = getRoomProfile();
    game.roomObjective = null;
    game.currentRoomCells = getAllCoordinatesForRadius(2);
    game.caveMetadata = null;
    game.entryCell = { q: -2, r: 0 };
    game.exitCell = { q: 2, r: 0 };
    game.player = createFreshPlayer();
    applyEquipmentLoadout(game.player);
    game.player.q = 0;
    game.player.r = 0;
    game.player.health = Math.min(5, game.player.maxHealth);
    game.player.pollen = 3;
    game.player.water = 3;
    game.player.honey = 2;
    game.player.upgrades = 1;
    game.player.stingCharges = 2;
    game.player.attackReadyAt = 0;
    startPlayerTurn();
    game.cells = game.currentRoomCells.map(({ q, r }) => ({
        q,
        r,
        object: 'empty',
        visited: q === 0 && r === 0,
        revealed: true,
        litByLamp: false,
        facingDir: null,
        nextAttackAt: 0,
        nextAuraAt: 0,
        hits: 0
    }));

    const target = getCell(1, 0);
    if (target) {
        target.object = objectId;
        target.awake = objectId === 'sleepingBat';
        initializeEnemyFacing(target);
        if (isEnemyObject(objectId) && hasTimedAura(objectId)) {
            target.nextAuraAt = performance.now() + getTestInitialTimer(objectId);
        }
    }

    seedTestSupportCells(objectId);
    game.message = getTestScenarioMessage(objectId);
    addLog('Test Scenario', game.message);
    showTutorialCallout('testScenario', 'Test Scenario', game.message);
    testControls.classList.add('visible');
    testPauseButton.textContent = currentLanguage === 'es-419' ? 'Pausar' : 'Pause';
    revealAroundPlayer();
    draw();
}

function setDungeonThemePreference(themeId) {
    selectedThemeId = themeId === 'random' || DUNGEON_THEMES?.[themeId] ? themeId : 'forest';
    localStorage.setItem(THEME_STORAGE_KEY, selectedThemeId);
    if (themeSelect) themeSelect.value = selectedThemeId;
    if (game.mode === 'menu' || game.ended) {
        game.dungeonTheme = selectedThemeId === 'random' ? null : DUNGEON_THEMES[selectedThemeId];
        applyDungeonTheme();
    }
}

function getTestInitialTimer(objectId) {
    const quick = {
        waspHive: 650,
        larvaBrood: 780,
        honeySnareSpider: 520,
        combBomber: 450,
        burrowBeetle: 420,
        queenSignaler: 480,
        fogShepherd: 520,
        waterLeech: 520
    };
    return quick[objectId] || Math.min(600, getEnemyDef(objectId)?.intervalMs || 600);
}

function getTestScenarioMessage(objectId) {
    const name = getDisplayNameForObject(objectId);
    const messageKeys = {
        waspHive: 'testWaspHive',
        larvaBrood: 'testLarvaBrood',
        honeySnareSpider: 'testHoneySnareSpider',
        combBomber: 'testCombBomber',
        burrowBeetle: 'testBurrowBeetle',
        queenSignaler: 'testQueenSignaler',
        fogShepherd: 'testFogShepherd',
        waterLeech: 'testWaterLeech',
        mirrorWasp: 'testMirrorWasp',
        waxSentinel: 'testWaxSentinel'
    };
    return formatText('messages', messageKeys[objectId] || 'testingDefault', { name });
}

function seedTestSupportCells(objectId) {
    const support = [
        { q: 0, r: 1, object: 'water' },
        { q: -1, r: 1, object: 'pollen' },
        { q: 1, r: -1, object: 'empty' },
        { q: 0, r: -1, object: 'empty' },
        { q: -1, r: 0, object: 'empty' },
        { q: 2, r: 0, object: 'exit' }
    ];

    if (objectId === 'waterLeech') {
        support[0].object = 'water';
        support.push({ q: -2, r: 1, object: 'water' });
    } else if (objectId === 'queenSignaler') {
        support.push({ q: 0, r: 1, object: 'enemy' });
    } else if (objectId === 'fogShepherd') {
        support.push({ q: -2, r: 1, object: 'pollen' }, { q: -1, r: 2, object: 'water' });
    } else if (objectId === 'waspHive' || objectId === 'larvaBrood') {
        support.push({ q: 1, r: -1, object: 'empty' }, { q: 2, r: -1, object: 'empty' }, { q: 0, r: 1, object: 'empty' });
    } else if (objectId === 'crawlingFire' || objectId === 'burningCell') {
        support[0].object = 'water';
    } else if (objectId === 'combBomber') {
        support.push({ q: 0, r: -1, object: 'empty' }, { q: -1, r: 0, object: 'empty' });
    } else if (objectId === 'burrowBeetle') {
        support.push({ q: 0, r: -1, object: 'empty' }, { q: -1, r: 0, object: 'empty' });
    } else if (objectId === 'waxDoor') {
        support[1].object = 'pollen';
    } else if (objectId === 'npc') {
        game.player.pollen = 4;
        game.player.water = 4;
        game.player.honey = 3;
    } else if (objectId === 'upgrade') {
        game.player.upgrades = 0;
    } else if (objectId === 'water' || objectId === 'honeyDrop' || objectId === 'royalNectar') {
        game.player.health = 3;
    }

    support.forEach(({ q, r, object }) => {
        const cell = getCell(q, r);
        if (cell && cell.object === 'empty') cell.object = object;
    });
}

function openTestMenu() {
    if (!resourcesReady()) return;
    menuController.openTestMenu();
}

function closeTestMenu() {
    menuController.closeTestMenu();
}

function returnToTestList() {
    menuController.returnToTestList();
}

function toggleTestPause() {
    menuController.toggleTestPause();
}

function showMainMenu() {
    menuController.showMainMenu();
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
        movePoints: START_MOVE_POINTS,
        maxMovePoints: START_MOVE_POINTS,
        actionAvailable: true,
        attackRange: START_ATTACK_RANGE,
        stamina: START_MOVE_POINTS,
        maxStamina: START_MOVE_POINTS,
        attackCooldownMs: BASE_ATTACK_COOLDOWN_MS,
        attackReadyAt: 0,
        attackAnimationUntil: 0
    };
}

function generateRoom(reason) {
    if (game.roomDepth >= FINAL_ROOM) {
        generateBossRoom();
        return;
    }

    game.mode = 'dungeon';
    game.dance = null;
    game.cells = [];
    game.statPopups = [];
    game.danceFeedback = [];
    game.cameraPan = { x: 0, y: 0 };
    game.inspectedCell = null;
    game.inspectPinned = false;
    game.roomProfile = getRoomProfile();
    game.roomObjective = roomTemplateSystem.chooseRoomObjective();
    game.roomTemplate = roomTemplateSystem.chooseRoomTemplate();
    game.objectiveProgress = createObjectiveProgress();
    game.freeWaxDoorAvailable = false;
    game.foragerPouchCollected = { pollen: false, water: false };
    game.roomSpawnCounts = {
        enemies: 0,
        hazards: 0,
        specialItems: 0
    };
    const cave = generateCaveDungeon({
        targetCells: game.roomProfile.targetCells,
        depth: game.roomDepth
    });
    game.currentRoomCells = cave.cells;
    game.caveMetadata = cave.metadata;
    game.entryCell = cave.entry;
    game.exitCell = cave.exit;
    game.player.q = game.entryCell.q;
    game.player.r = game.entryCell.r;
    startPlayerTurn();
    game.message = 'A new cave opens. Find the furthest room.';

    game.currentRoomCells.forEach(({ q, r, roomIndex, kind }) => {
        game.cells.push({
            q,
            r,
            roomIndex,
            kind,
            object: randomObjectFor(q, r, game.entryCell, game.exitCell),
            visited: false,
            revealed: false,
            litByLamp: false,
            facingDir: null,
            themeTileRow: getThemeTileRow(q, r, roomIndex),
            themeTileVariant: getThemeTileVariant(q, r),
            nextAttackAt: 0,
            nextAuraAt: 0,
            hits: 0
        });
    });

    roomTemplateSystem.applyFirstRunOnboardingTemplate();
    roomTemplateSystem.placeFirstRoomTeachingPickups();
    roomTemplateSystem.placeRoomLessonGate(game.roomTemplate);
    roomTemplateSystem.placeEnemySynergy(game.roomTemplate);
    roomTemplateSystem.revealExitCell();
    placeTeachingEnemy();
    placeBats();
    updateLampLightFields();
    initializePositionalEnemies();
    const startCell = getCell(game.player.q, game.player.r);
    if (startCell) startCell.visited = true;
    runRelicHook('onRoomStart');
    applyCampRoomBuffs();
    revealAroundPlayer();
    updateObjectiveProgress();

    if (reason === 'restart') {
        addLog(t('logs', 'start'), t('messages', 'startRun'));
    } else {
        addLog(t('logs', 'exit'), formatText('messages', 'enteredChamber', { room: game.roomDepth }));
    }
    if (game.roomObjective) {
        addLog(currentLanguage === 'es-419' ? 'Objetivo' : 'Objective', roomTemplateSystem.getRoomObjectiveText());
    }
    recordReplayEvent('roomStart', { reason, depth: game.roomDepth });
    draw();
}

function generateBossRoom() {
    game.mode = 'dungeon';
    game.dance = null;
    game.cells = [];
    game.statPopups = [];
    game.attackEffects = [];
    game.pathPreview = null;
    game.pathCache = {};
    game.autoPath = [];
    game.inspectedCell = null;
    game.inspectPinned = false;
    game.cameraPan = { x: 0, y: 0 };
    game.roomDepth = FINAL_ROOM;
    game.roomProfile = ROOM_PROFILES[ROOM_PROFILES.length - 1];
    game.roomObjective = null;
    game.bossEngaged = false;
    const cave = generateCaveDungeon({
        targetCells: Math.max(game.roomProfile.targetCells, 154),
        depth: FINAL_ROOM,
        bossRoom: true
    });
    game.currentRoomCells = cave.cells;
    game.caveMetadata = cave.metadata;
    game.entryCell = cave.entry;
    game.exitCell = null;
    game.player.q = game.entryCell.q;
    game.player.r = game.entryCell.r;
    startPlayerTurn();
    const bossPosition = cave.exit;
    const spawnerPositions = chooseBossSpawnerPositions(bossPosition);
    game.currentRoomCells.forEach(({ q, r, roomIndex, kind }) => {
        const isSpawner = spawnerPositions.some((position) => position.q === q && position.r === r);
        const bossDistance = hexDistance(q, r, bossPosition.q, bossPosition.r);
        const object = q === game.entryCell.q && r === game.entryCell.r
            ? 'entry'
            : q === bossPosition.q && r === bossPosition.r
            ? 'queenSignaler'
            : isSpawner
            ? 'waspHive'
            : bossDistance <= 2
            ? 'empty'
            : bossDistance <= 3
            ? 'empty'
            : chooseWeightedObject([
                { object: 'empty', weight: 55 },
                { object: 'pollen', weight: 9 },
                { object: 'water', weight: 9 },
                { object: 'stingUpgrade', weight: 5 },
                { object: 'burningCell', weight: 3 },
                { object: 'vine', weight: 3 }
            ], 'empty');
        game.cells.push({
            q,
            r,
            roomIndex,
            kind,
            object,
            visited: false,
            revealed: true,
            litByLamp: false,
            facingDir: null,
            themeTileRow: getThemeTileRow(q, r, roomIndex),
            themeTileVariant: getThemeTileVariant(q, r),
            nextAttackAt: 0,
            nextAuraAt: object === 'queenSignaler'
                ? performance.now() + 2200
                : object === 'waspHive'
                ? performance.now() + 3600
                : 0,
            hits: 0,
            isBoss: object === 'queenSignaler',
            spawnLimit: object === 'waspHive' ? 1 : 0,
            suppressFallbackDamage: object === 'waspHive'
        });
    });
    const boss = game.cells.find((cell) => cell.isBoss);
    if (boss) {
        boss.bossHp = 1;
    }
    initializePositionalEnemies();
    clearBossApproachRoute(bossPosition, spawnerPositions[0]);
    game.message = t('messages', 'bossStart');
    addLog(t('logs', 'finalBoss'), game.message);
    startBossMusic();
    revealAroundPlayer();
    draw();
}

function chooseBossSpawnerPositions(bossPosition) {
    const ringTwo = getCellsAtDistance(bossPosition, 2)
        .filter((cell) => game.currentRoomCells.some((roomCell) => roomCell.q === cell.q && roomCell.r === cell.r))
        .filter((cell) => hexDistance(cell.q, cell.r, game.entryCell.q, game.entryCell.r) > 3)
        .sort((a, b) => (
            hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r)
            - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r)
        ))
        .slice(0, BOSS_HIVE_COUNT);
    if (ringTwo.length >= BOSS_HIVE_COUNT) return ringTwo;
    const fallback = [...game.currentRoomCells]
        .filter((cell) => !(cell.q === bossPosition.q && cell.r === bossPosition.r))
        .filter((cell) => !(cell.q === game.entryCell.q && cell.r === game.entryCell.r))
        .filter((cell) => hexDistance(cell.q, cell.r, bossPosition.q, bossPosition.r) > 1)
        .sort((a, b) => (
            hexDistance(a.q, a.r, bossPosition.q, bossPosition.r)
            - hexDistance(b.q, b.r, bossPosition.q, bossPosition.r)
        ));
    return [...ringTwo, ...fallback].slice(0, BOSS_HIVE_COUNT);
}

function getCellsAtDistance(center, distance) {
    const cells = [];
    for (let q = center.q - distance; q <= center.q + distance; q += 1) {
        for (let r = center.r - distance; r <= center.r + distance; r += 1) {
            if (hexDistance(center.q, center.r, q, r) === distance) {
                cells.push({ q, r });
            }
        }
    }
    return cells;
}

function clearBossApproachRoute(bossPosition, hivePosition) {
    const anchorPoints = [game.entryCell, hivePosition, bossPosition].filter(Boolean);
    for (let index = 0; index < anchorPoints.length - 1; index += 1) {
        const path = findRoomPathBetween(anchorPoints[index], anchorPoints[index + 1]);
        path.forEach((step) => {
            const cell = getCell(step.q, step.r);
            if (!cell || cell.isBoss || cell.object === 'entry' || cell.object === 'queenSignaler' || cell.object === 'waspHive') return;
            cell.object = 'empty';
        });
    }
    getCellsAtDistance(bossPosition, 1).forEach((position) => {
        const cell = getCell(position.q, position.r);
        if (cell && cell.object !== 'queenSignaler' && cell.object !== 'waspHive') {
            cell.object = 'empty';
        }
    });
}

function findRoomPathBetween(start, target) {
    return roomTemplateSystem.findRoomPathBetween(start, target);
}

function getCellCoordinate(q, r) {
    return { q, r };
}

function isCollectOnMoveObject(object) {
    return cellInteractions.isCollectOnMoveObject(object, isEnemyObject);
}

function isFreeWalkoverObject(object) {
    return cellInteractions.isFreeWalkoverObject(object);
}

function registerMoveInteractionHandlers() {
    cellInteractions.registerMoveHandler('waxDoor', {
        timing: 'beforeMove',
        run: ({ cell }) => {
            game.autoPath = [];
            openWaxDoor(cell);
        }
    });
    cellInteractions.registerMoveHandler('exit', {
        timing: 'afterMove',
        consumesAction: true,
        run: () => {
            game.autoPath = [];
            consumeAction('exit');
            captureRoomEndMetrics();
            game.objectiveProgress.exitReached = true;
            updateObjectiveProgress();
            awardXp(XP_REWARDS.room + game.roomDepth * 6, currentLanguage === 'es-419' ? 'Sala completada' : 'Room complete');
            if (game.claimedRelicRooms.includes(game.roomDepth)) {
                game.roomDepth += 1;
                generateRoom('exit');
            } else {
                game.claimedRelicRooms.push(game.roomDepth);
                openRelicChoice();
            }
        }
    });
    cellInteractions.registerMoveHandler('finalExit', {
        timing: 'afterMove',
        consumesAction: true,
        run: () => {
            game.autoPath = [];
            consumeAction('finalExit');
            generateBossRoom();
        }
    });
    cellInteractions.registerMoveHandler('entry', {
        timing: 'afterMove',
        run: ({ cell, targetObject }) => {
            game.message = currentLanguage === 'es-419'
                ? 'La entrada se cierra detras de la abeja.'
                : 'The entry closes behind the bee.';
            addLog(OBJECTS[targetObject].name, game.message);
            recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
            if (!game.autoPath.length) endPlayerTurn('move');
            draw();
        }
    });
    cellInteractions.registerMoveHandler('vine', {
        timing: 'afterMove',
        consumesAction: true,
        run: ({ cell, targetObject }) => {
            consumeAction('hazard');
            applyDamage(VINE_DAMAGE, cell.q, cell.r, 'Vines');
            addLog('Vines', 'Thorny vines scraped the bee.');
            if (game.ended) return;
            revealAroundPlayer();
            recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
            endPlayerTurn('hazard');
            draw();
        }
    });
    cellInteractions.registerMoveHandler('burningCell', {
        timing: 'afterMove',
        consumesAction: true,
        run: ({ cell, targetObject }) => {
            consumeAction('hazard');
            if (game.player.water > 0) {
                game.player.water -= 1;
                addStatPopups(cell.q, cell.r, [{ stat: 'water', amount: -1 }]);
                addLog('Burning Cell', 'Spent 1 water to put out the fire.');
                cell.object = 'empty';
            } else {
                applyDamage(1, cell.q, cell.r, 'Burning Cell');
                addLog('Burning Cell', 'The crawling fire burned the bee.');
                if (game.ended) return;
            }
            revealAroundPlayer();
            recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
            endPlayerTurn('hazard');
            draw();
        }
    });
    cellInteractions.registerMoveHandler('lampCell', {
        timing: 'afterMove',
        run: ({ cell, targetObject }) => cellInteractions.handleWalkoverObject(targetObject, {
            cell,
            game,
            currentLanguage,
            revealAround,
            updateLampLightFields,
            addLog,
            recordReplayEvent,
            updateObjectiveProgress,
            endPlayerTurn,
            draw
        })
    });
    cellInteractions.registerMoveHandler('npc', {
        timing: 'afterMove',
        consumesAction: true,
        run: ({ cell, targetObject }) => {
            game.autoPath = [];
            if (!consumeAction('trade')) {
                showBlockedAction(cell, currentLanguage === 'es-419' ? 'Ya usaste tu accion este turno.' : 'You already used your action this turn.');
                return;
            }
            openTraderMarket(cell);
            revealAroundPlayer();
            recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
            draw();
        }
    });
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

function createStartingEquipment() {
    return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot.id, null]));
}

function getEquippedItems() {
    return Object.values(game.equipment || {})
        .filter(Boolean)
        .map((id) => EQUIPMENT_DEFS[id])
        .filter(Boolean);
}

function equipItem(equipmentId) {
    const equipment = EQUIPMENT_DEFS[equipmentId];
    if (!equipment) return false;
    game.equipment[equipment.slot] = equipmentId;
    applyEquipmentLoadout(game.player);
    renderMessage();
    draw();
    return true;
}

function applyEquipmentLoadout(player) {
    if (!player) return;
    player.equipment = { ...game.equipment };
    getEquippedItems().forEach((equipment) => {
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
                syncLegacyStamina();
            }
        });
    });
}

function updateObjectiveProgress() {
    roomTemplateSystem.updateObjectiveProgress();
}

function generateCaveBlob(targetCount) {
    return dungeonGenerator.generateCaveBlob(targetCount);
}

function generateCaveDungeon(options) {
    return dungeonGenerator.generateCaveDungeon(options);
}

function cellKey(q, r) {
    return `${q},${r}`;
}

function choosePortalCells(cells) {
    return dungeonGenerator.choosePortalCells(cells);
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
    return dungeonGenerator.randomFrom(items);
}

function placeTeachingEnemy() {
    if (game.roomDepth !== 1 || game.roomTemplate === 'onboardingPath' || game.roomSpawnCounts.enemies >= game.roomProfile.maxEnemies) {
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

function getExitNeighborCells() {
    if (!game.exitCell) return [];
    return HEX_DIRECTIONS
        .map((direction) => getCell(game.exitCell.q + direction.q, game.exitCell.r + direction.r))
        .filter(Boolean);
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
            cell.litByLamp = false;
            if (!wasRevealed) {
                maybeShowDiscoveryCallout(cell.object);
            }
        }
    });
    updateObjectiveProgress();
}

function updateLampLightFields() {
    game.cells.forEach((cell) => {
        cell.litByLamp = false;
    });

    game.cells
        .filter((cell) => cell.object === 'lampCell' && (cell.revealed || cell.visited))
        .forEach((lamp) => {
            game.cells.forEach((cell) => {
                if (cell !== lamp && !cell.revealed && hexDistance(lamp.q, lamp.r, cell.q, cell.r) <= 1) {
                    cell.litByLamp = true;
                }
            });
        });
}

function getThemeTileSheet() {
    const themeId = getCurrentTheme()?.id || 'forest';
    const image = themeTileSheetAssets[themeId] || themeTileSheetAssets.forest;
    const meta = themeTileSheetMeta[themeId] || themeTileSheetMeta.forest;
    return image && meta ? { image, meta } : null;
}

function getThemeTileRow(q, r, roomIndex = 0) {
    const meta = getThemeTileSheet()?.meta;
    const baseRows = meta?.baseRows || 5;
    const roomBand = Number.isFinite(roomIndex) ? roomIndex : 0;
    const localVariation = Math.floor(seededNoise(q * 31 + r * 47 + game.runSeed, 19) * 2);
    return Math.max(0, Math.min(baseRows - 1, (roomBand + localVariation) % baseRows));
}

function getThemeTileVariant(q, r) {
    const meta = getThemeTileSheet()?.meta;
    const columns = meta?.columns || 6;
    return Math.floor(seededNoise(q * 83 + r * 29 + game.runSeed, 7) * columns) % columns;
}

function initializePositionalEnemies() {
    game.cells
        .filter((cell) => isEnemyObject(cell.object))
        .forEach(initializeEnemyFacing);
}

function initializeEnemyFacing(cell) {
    if (!enemySystem?.hasBehavior(cell.object, 'armoredFacing')) return;
    const directionToPlayer = getDirectionIndexBetween(cell, game.player);
    cell.facingDir = directionToPlayer >= 0
        ? directionToPlayer
        : Math.floor(seededRandom() * HEX_DIRECTIONS.length);
}

function updateArmoredEnemyFacing() {
    let turned = 0;
    game.cells
        .filter((cell) => isEnemyObject(cell.object) && enemySystem.hasBehavior(cell.object, 'armoredFacing'))
        .forEach((cell) => {
            const behavior = enemySystem.getBehavior(cell.object, 'armoredFacing');
            if (hexDistance(cell.q, cell.r, game.player.q, game.player.r) > (behavior.turnRange || 3)) return;
            const directionToPlayer = getDirectionIndexBetween(cell, game.player);
            if (directionToPlayer >= 0 && cell.facingDir !== directionToPlayer) {
                cell.facingDir = directionToPlayer;
                cell.guardFlashUntil = performance.now() + 650;
                turned += 1;
            } else if (directionToPlayer >= 0 && cell.facingDir == null) {
                cell.facingDir = directionToPlayer;
            }
        });
    if (turned > 0) {
        addLog(currentLanguage === 'es-419' ? 'Guardia' : 'Guard', currentLanguage === 'es-419'
            ? `${turned} enemigo${turned === 1 ? '' : 's'} se giraron para cubrir su frente.`
            : `${turned} armored threat${turned === 1 ? '' : 's'} turned to guard their front.`);
    }
}

function getDirectionIndexBetween(from, to) {
    const dq = to.q - from.q;
    const dr = to.r - from.r;
    const distance = hexDistance(from.q, from.r, to.q, to.r);
    if (distance < 1) return -1;
    return HEX_DIRECTIONS.findIndex((direction) => (
        direction.q * distance === dq && direction.r * distance === dr
    ));
}

function isAttackBlockedByFacing(cell) {
    if (!enemySystem?.hasBehavior(cell.object, 'armoredFacing')) return false;
    if (cell.facingDir == null) initializeEnemyFacing(cell);
    const attackDirection = getDirectionIndexBetween(cell, game.player);
    return attackDirection >= 0 && attackDirection === cell.facingDir;
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
    roomTemplateSystem.revealExitCell();
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
    {
        const isMarket = game.mode === 'traderMarket';
        const actions = isMarket ? game.marketChoices : getCampActions();
        const preview = isMarket
            ? choiceUi.preview(
                currentLanguage === 'es-419' ? 'Escarabajo comerciante' : 'Trade Beetle',
                currentLanguage === 'es-419'
                    ? 'Elige una compra. El escarabajo se ira cuando cierres el mercado.'
                    : 'Choose a purchase. The beetle leaves when you close the market.'
            )
            : game.nextRoomPreview
            ? choiceUi.preview(
                currentLanguage === 'es-419' ? 'Proxima sala' : 'Next chamber',
                game.nextRoomPreview
            )
            : '';
        choiceUi.renderCampActions(campActionsNode, actions, preview);
        return;
    }
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
    return campMarketController.getMarketChoices(getCampActions(), seededRandom);
}

function buildNextRoomPreview() {
    const nextDepth = Math.min(FINAL_ROOM, game.roomDepth + 1);
    const currentDepth = game.roomDepth;
    game.roomDepth = nextDepth;
    const profile = getRoomProfile();
    game.roomDepth = currentDepth;

    if (nextDepth >= FINAL_ROOM) {
        return currentLanguage === 'es-419'
            ? 'Jefe final: guarda salud, escudo y recursos.'
            : 'Final boss: save health, shield, and supplies.';
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
    return campMarketController.getActions({
        health: game.player.health,
        maxHealth: getPlayerMaxHealth(),
        shield: game.player.upgrades,
        maxShield: game.player.maxShield,
        pollen: game.player.pollen,
        water: game.player.water,
        honey: game.player.honey,
        roomDepth: game.roomDepth
    });
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
        game.campBuffs.extraMovePoint = true;
        addStatPopups(game.player.q, game.player.r, [{ stat: 'honey', amount: -1 }]);
        addLog('Camp', 'Saved honey for extra movement next room.');
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
        endPlayerTurn('trade');
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
    if (game.campBuffs.extraMovePoint) {
        game.player.maxMovePoints += 1;
        game.player.movePoints = game.player.maxMovePoints;
        syncLegacyStamina();
        addStatPopups(game.player.q, game.player.r, [{ stat: 'stamina', amount: 1 }]);
        addLog('Sugar Rush', 'Started with +1 movement point.');
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
    choiceUi.renderRelicChoices(relicChoicesNode, game.relicChoices, {
        emptyTitle: currentLanguage === 'es-419' ? 'Sin reliquias nuevas' : 'No New Relics',
        emptyCopy: currentLanguage === 'es-419'
            ? 'La abeja ya conoce todas las reliquias disponibles.'
            : 'The bee already has every available relic.'
    });
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
    const baseSize = Math.max(18, Math.min(
        (rect.width - padding * 2) / unitWidth,
        (rect.height - padding * 2) / unitHeight
    ));
    const size = game.mode === 'dance' ? baseSize : baseSize * DUNGEON_GRID_ZOOM;

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
    if (game.testPaused) {
        const board = layout();
        ctx.clearRect(0, 0, board.width, board.height);
        drawBackground(board);
        game.cells.forEach(drawCell);
        drawPlayer();
        drawStatPopups();
        drawDangerOverlay(board);
        renderInspectPanel();
        renderStats();
        renderCooldown();
        renderMessage();
        return;
    }

    updateStamina();
    if (game.replay) {
        // Replay snapshots advance on their own timer.
    } else if (game.mode === 'dance') {
        danceSystem.update();
    } else if (game.mode === 'dungeon') {
        updateTerrainEffects();
        updateAutoPath();
    }

    const board = layout();
    ctx.clearRect(0, 0, board.width, board.height);
    drawBackground(board);

    game.cells.forEach(drawCell);
    drawPathPreview();
    if (game.mode === 'dance') {
        danceSystem.drawArrow();
    }
    drawPlayer();
    drawAttackEffects();
    if (game.mode === 'dance' && game.dance?.move?.type === 'hold') {
        danceSystem.drawHoldForeground();
    }
    if (game.mode === 'dance') {
        danceSystem.drawScoreOverlay(board);
        danceSystem.drawFeedbackLane(board);
    }
    drawStatPopups();
    drawDangerOverlay(board);
    renderInspectPanel();
    renderStats();
    renderCooldown();
    renderMessage();
}

function animate() {
    draw();
    if (testScreen.classList.contains('visible')) {
        drawTestObjectIcons();
    }
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

    if (game.mode === 'dungeon') {
        drawThemeEnvironmentLayer(board);
    }

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
    rendererTools.drawImageCover(ctx, image, x, y, width, height);
}

function registerAssetLoad() {
    assetLoader.total += 1;
    updateLoadingScreen();
    let settled = false;
    return () => {
        if (settled) return;
        settled = true;
        assetLoader.complete += 1;
        updateLoadingScreen();
        checkAssetsReady();
    };
}

function loadTrackedImages(defs, target, onUpdate) {
    Object.entries(defs || {}).forEach(([key, src]) => {
        const finish = registerAssetLoad();
        const image = new Image();
        image.onload = () => {
            target[key] = image;
            if (onUpdate) onUpdate(key, image);
            finish();
        };
        image.onerror = () => {
            target[key] = null;
            if (onUpdate) onUpdate(key, null);
            finish();
        };
        image.src = src;
    });
}

function updateLoadingScreen() {
    if (!loadingScreen || !loadingFill || !loadingText) return;
    const total = Math.max(1, assetLoader.total);
    const progress = assetLoader.ready ? 1 : Math.min(0.99, assetLoader.complete / total);
    loadingFill.style.width = `${Math.round(progress * 100)}%`;
    loadingText.textContent = assetLoader.ready
        ? (currentLanguage === 'es-419' ? 'Listo para explorar.' : 'Ready to explore.')
        : (currentLanguage === 'es-419'
            ? `Cargando recursos de la colmena... ${assetLoader.complete}/${assetLoader.total}`
            : `Loading hive assets... ${assetLoader.complete}/${assetLoader.total}`);
}

function checkAssetsReady() {
    if (assetLoader.ready || assetLoader.complete < assetLoader.total) return;
    assetLoader.ready = true;
    spritesReady = true;
    setStartButtonsLoading(false);
    updateLoadingScreen();
    requestAnimationFrame(() => {
        loadingScreen?.classList.add('ready');
        draw();
    });
}

function setStartButtonsLoading(isLoading) {
    [newRunButton, testDanceButton].forEach((button) => {
        if (!button) return;
        button.disabled = isLoading;
        button.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    });
}

function resourcesReady() {
    if (assetLoader.ready) return true;
    updateLoadingScreen();
    loadingScreen?.classList.remove('ready');
    return false;
}

function loadUiArt() {
    loadTrackedImages(UI_ART_DEFS, uiArtAssets);
}

function loadTileArt() {
    loadTrackedImages(TILE_ART_DEFS, tileArtAssets);
}

function loadThemeTileSheets() {
    loadTrackedImages(THEME_TILE_SHEET_DEFS || {}, themeTileSheetAssets, (key, image) => {
        if (!image?.naturalWidth || !image?.naturalHeight) {
            delete themeTileSheetMeta[key];
            return;
        }
        const columns = 6;
        const frameSize = image.naturalWidth / columns;
        const rows = Math.max(1, Math.round(image.naturalHeight / frameSize));
        themeTileSheetMeta[key] = {
            columns,
            rows,
            frameSize,
            baseRows: rows >= 6 ? 5 : Math.max(1, rows),
            blendRow: rows >= 6 ? 5 : Math.max(0, rows - 1),
            sourceInset: Math.round(frameSize * 0.03),
            drawScale: 1.06
        };
        draw();
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
    const softLit = hidden && cell.litByLamp;
    const visibleObject = getVisibleCellObject(cell, hidden);
    const object = OBJECTS[visibleObject] || OBJECTS.empty;
    const disguised = visibleObject !== cell.object;

    drawCellBackground(cell, x, y, size, hidden, softLit);
    if (!hidden && cell.lessonSafe) {
        drawLessonSafeMarker(x, y, size);
    }
    if (!hidden) {
        drawThreatPreview(cell, x, y, size);
    }

    drawHexPath(x, y, size - 2);
    ctx.lineWidth = visibleObject !== 'empty' && (!hidden || softLit) ? 3 : 1.5;
    ctx.strokeStyle = visibleObject !== 'empty' && (!hidden || softLit)
        ? (softLit ? 'rgba(255, 218, 113, 0.68)' : object.color)
        : 'rgba(233, 199, 110, 0.38)';
    ctx.stroke();

    if ((!hidden || softLit) && visibleObject !== 'empty') {
        ctx.save();
        if (softLit) ctx.globalAlpha = 0.46;
        if (!softLit && (visibleObject === 'exit' || visibleObject === 'finalExit')) {
            drawTileArt('exit', x, y, size, visibleObject === 'finalExit' ? 1 : 0.88);
        } else if (!softLit && isEnemyObject(visibleObject)) {
            drawTileArt('enemyBorder', x, y, size, 0.9);
        } else if (!softLit && !['entry', 'vine', 'stickyTrap'].includes(visibleObject)) {
            drawTileArt('pickableBorder', x, y, size, 0.9);
        }
        drawSprite(visibleObject, x, y, size, cell);
        ctx.restore();
        if (!softLit && !disguised && isEnemyObject(cell.object)) {
            drawEnemyFacingGuard(cell, x, y, size);
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
        drawMist(x, y, size, softLit);
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

function drawLessonSafeMarker(x, y, size) {
    const pulse = (Math.sin(performance.now() / 180) + 1) / 2;
    ctx.save();
    drawHexPath(x, y, size - 10);
    ctx.fillStyle = `rgba(82, 210, 166, ${0.08 + pulse * 0.06})`;
    ctx.strokeStyle = `rgba(126, 230, 165, ${0.58 + pulse * 0.24})`;
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 6]);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawPathPreview() {
    const preview = game.pathPreview;
    if (!preview || game.mode !== 'dungeon') return;
    const now = performance.now();
    ctx.save();
    preview.path.forEach((step, index) => {
        const { x, y, size } = hexToPixel(step.q, step.r);
        const isLast = index === preview.path.length - 1;
        const reachable = index < (preview.reachableLength ?? preview.path.length);
        const pulse = (Math.sin(now / 150 + index * 0.5) + 1) / 2;
        drawHexPath(x, y, size - 9);
        ctx.strokeStyle = !reachable
            ? 'rgba(184, 194, 170, 0.22)'
            : preview.complete
            ? `rgba(245, 200, 75, ${0.55 + pulse * 0.28})`
            : isLast
            ? `rgba(255, 166, 65, ${0.62 + pulse * 0.28})`
            : 'rgba(184, 194, 170, 0.35)';
        ctx.lineWidth = isLast && reachable ? 5 : 3;
        ctx.stroke();
    });
    if (preview.deathCell) {
        const { x, y, size } = hexToPixel(preview.deathCell.q, preview.deathCell.r);
        const pulse = (Math.sin(now / 110) + 1) / 2;
        drawHexPath(x, y, size - 6);
        ctx.fillStyle = `rgba(128, 12, 24, ${0.22 + pulse * 0.12})`;
        ctx.strokeStyle = `rgba(255, 72, 87, ${0.7 + pulse * 0.25})`;
        ctx.lineWidth = 6;
        ctx.fill();
        ctx.stroke();
        drawSprite('deathCell', x, y, size * 0.72);
    }
    if (preview.blockedTarget && !preview.deathCell) {
        const { x, y, size } = hexToPixel(preview.blockedTarget.q, preview.blockedTarget.r);
        const pulse = (Math.sin(now / 160) + 1) / 2;
        drawHexPath(x, y, size - 6);
        ctx.strokeStyle = `rgba(255, 173, 66, ${0.55 + pulse * 0.28})`;
        ctx.lineWidth = 5;
        ctx.setLineDash([8, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
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
    syncLegacyStamina();
}

function startPlayerTurn() {
    tacticalFlow.startTurn(game.player);
}

function syncLegacyStamina() {
    tacticalFlow.syncLegacyStamina(game.player);
}

function spendMovePoints(amount) {
    return tacticalFlow.spendMovePoints(game.player, amount);
}

function consumeAction(reason = 'action') {
    return tacticalFlow.consumeAction(game, reason);
}

function endPlayerTurn(reason = 'action') {
    tacticalCombat.endPlayerTurn(game, reason);
}

function resolveEnemyTurn(reason = 'action') {
    enemyTurns.resolve(reason);
}

function resolveTurnEnemyPressure() {
    game.cells
        .filter((cell) => isEnemyObject(cell.object))
        .forEach((enemyCell) => {
            const enemy = getEnemyDef(enemyCell.object);
            const range = enemy.range || 1;
            const near = hexDistance(enemyCell.q, enemyCell.r, game.player.q, game.player.r) <= range;
            if (!near || enemy.attack <= 0) return;
            if (!enemySystem.hasTimedThreat(enemyCell.object) && enemyCell.object !== 'bat' && enemyCell.object !== 'sleepingBat') return;
            applyDamage(enemy.attack, enemyCell.q, enemyCell.r, `${enemy.name} Attack`);
            recordReplayEvent('enemyDamage', { enemy: enemyCell.object, q: enemyCell.q, r: enemyCell.r, amount: enemy.attack, mode: 'turn' });
        });
}

function tickSpecialEnemyTelegraphs() {
    const now = performance.now();
    game.cells
        .filter((cell) => hasSpecialTurnThreat(cell.object))
        .forEach((enemyCell) => {
            if (shouldDelayBossThreat(enemyCell)) return;
            const enemy = getEnemyDef(enemyCell.object);
            if (!enemyCell.nextAuraAt) {
                enemyCell.nextAuraAt = now + Math.max(450, enemy.intervalMs || 900);
                return;
            }
            enemyCell.nextAuraAt -= Math.max(350, Math.floor((enemy.intervalMs || 900) * 0.45));
            if (enemyCell.nextAuraAt <= now) {
                enemySystem.handleTimedThreat(enemyCell, enemy, now);
                enemyCell.nextAuraAt = now + Math.max(450, enemy.intervalMs || 900);
            }
        });
}

function shouldDelayBossThreat(enemyCell) {
    if (game.roomDepth < FINAL_ROOM || game.bossEngaged) return false;
    if (enemyCell.object !== 'queenSignaler' && enemyCell.object !== 'waspHive') return false;
    const boss = game.cells.find((cell) => cell.isBoss);
    if (!boss) return false;
    const distanceToBoss = hexDistance(game.player.q, game.player.r, boss.q, boss.r);
    if (distanceToBoss <= 5) {
        game.bossEngaged = true;
        return false;
    }
    const now = performance.now();
    enemyCell.nextAuraAt = Math.max(enemyCell.nextAuraAt || 0, now + 900);
    return true;
}

function hasSpecialTurnThreat(object) {
    return enemySystem.hasBehavior(object, 'spawnEnemyAura')
        || enemySystem.hasBehavior(object, 'spawnTerrainAura')
        || enemySystem.hasBehavior(object, 'markCellsAura')
        || enemySystem.hasBehavior(object, 'chargeLane')
        || enemySystem.hasBehavior(object, 'burrowAmbush')
        || enemySystem.hasBehavior(object, 'weakPointWindow')
        || enemySystem.hasBehavior(object, 'refogAura')
        || enemySystem.hasBehavior(object, 'stealResourceAura')
        || enemySystem.hasBehavior(object, 'buffEnemiesAura')
        || enemySystem.hasBehavior(object, 'waterDrainAura');
}

function resolveBossAntiKite(reason) {
    if (game.roomDepth < FINAL_ROOM || !game.metrics.lastAttack || game.metrics.lastAttack.turn !== game.metrics.turns - 1) return;
    const boss = game.cells.find((cell) => cell.isBoss);
    if (!boss) return;
    const bossRange = Math.max(2, getEnemyDef(boss.object)?.range || 2);
    if (hexDistance(game.player.q, game.player.r, boss.q, boss.r) <= bossRange) return;
    game.metrics.bossAttackRetreatLoops += 1;
    game.metrics.repeatedAttackRetreatPatterns += 1;
    const now = performance.now();
    game.cells
        .filter((cell) => cell.object === 'waspHive')
        .forEach((hive) => {
            hive.nextAuraAt = Math.min(hive.nextAuraAt || now + 900, now + 250);
            hive.signalBuffUntil = now + 700;
        });
    addWarningPopup(game.player.q, game.player.r, currentLanguage === 'es-419' ? 'La colmena acelera' : 'Hives accelerate');
}

function drawCellBackground(cell, x, y, size, hidden, softLit = false) {
    drawHexPath(x, y, size - 2);
    ctx.save();
    ctx.clip();
    const tileKey = getCellTileKey(cell, hidden);
    const hasTileArt = game.mode !== 'dance' && drawTileArt(tileKey, x, y, size, softLit ? 0.68 : hidden ? 0.92 : 0.96);
    if (!hasTileArt) {
        const baseGradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        if (softLit) {
            baseGradient.addColorStop(0, '#2c3424');
            baseGradient.addColorStop(0.55, '#344432');
            baseGradient.addColorStop(1, '#1b2b23');
        } else if (hidden) {
            baseGradient.addColorStop(0, '#101a15');
            baseGradient.addColorStop(1, '#1f2c24');
        } else if (cell.visited) {
            baseGradient.addColorStop(0, getCurrentTheme()?.cellTint || '#2d3d34');
            baseGradient.addColorStop(1, '#1d2b24');
        } else {
            baseGradient.addColorStop(0, getCurrentTheme()?.cellTint || '#3c4d43');
            baseGradient.addColorStop(1, '#26372f');
        }
        ctx.fillStyle = baseGradient;
        ctx.globalAlpha = softLit ? 0.92 : hidden ? 0.96 : game.mode === 'dance'
            ? (cell.visited ? 0.52 : 0.34)
            : 0.9;
        ctx.fill();
    }

    drawHexPath(x, y, size - 6);
    ctx.globalAlpha = softLit ? 0.4 : hasTileArt ? 0.04 : hidden ? 0.06 : 0.12;
    ctx.strokeStyle = softLit ? '#ffd86f' : getCurrentTheme()?.borderTint || '#e8c76b';
    ctx.lineWidth = softLit ? 2.2 : 1.2;
    ctx.stroke();

    ctx.globalAlpha = softLit ? 0.22 : hasTileArt ? 0.06 : hidden ? 0.08 : 0.16;
    ctx.fillStyle = '#f1cf79';
    for (let i = 0; i < 7; i++) {
        const offsetX = (seededNoise(cell.q * 37 + cell.r * 101, i) - 0.5) * size * 1.1;
        const offsetY = (seededNoise(cell.q * 53 + cell.r * 89, i + 10) - 0.5) * size * 1.05;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, 0.9 + (i % 3) * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    if ((!hidden || softLit) && cell.object !== 'empty') {
        ctx.fillStyle = objectTint(cell.object);
        ctx.globalAlpha = softLit ? 0.14 : hasTileArt ? 0.08 : 0.22;
        ctx.fill();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}

function drawThemeEnvironmentLayer(board) {
    const sheet = getThemeTileSheet();
    if (!sheet) return;
    const environmentCells = getVisibleEnvironmentCells(board);
    ctx.save();
    environmentCells.forEach((cell) => {
        const { x, y, size } = hexToPixel(cell.q, cell.r);
        drawThemeEnvironmentCell(cell, x, y, size, sheet, 0.18);
    });
    const environmentMap = new Map(environmentCells.map((cell) => [cellKey(cell.q, cell.r), cell]));
    environmentCells.forEach((cell) => {
        const { x, y, size } = hexToPixel(cell.q, cell.r);
        drawThemeEnvironmentBlendEdges(cell, x, y, size, sheet, environmentMap);
    });
    ctx.restore();
}

function getVisibleEnvironmentCells(board) {
    const playable = new Set(game.cells.map((cell) => cellKey(cell.q, cell.r)));
    const camera = getCameraWorldPosition();
    const radiusQ = Math.ceil(board.width / (board.size * Math.sqrt(3))) + 7;
    const radiusR = Math.ceil(board.height / (board.size * 1.5)) + 7;
    const centerQ = Math.round(camera.q);
    const centerR = Math.round(camera.r);
    const cells = [];

    for (let q = centerQ - radiusQ; q <= centerQ + radiusQ; q++) {
        for (let r = centerR - radiusR; r <= centerR + radiusR; r++) {
            const point = hexToPixel(q, r);
            if (
                point.x < -point.size * 2
                || point.x > board.width + point.size * 2
                || point.y < -point.size * 2
                || point.y > board.height + point.size * 2
            ) {
                continue;
            }
            if (playable.has(cellKey(q, r))) continue;
            cells.push({
                q,
                r,
                themeTileRow: getEnvironmentTileRow(q, r),
                themeTileVariant: getThemeTileVariant(q, r)
            });
        }
    }

    return cells;
}

function getEnvironmentTileRow(q, r) {
    const meta = getThemeTileSheet()?.meta;
    const baseRows = meta?.baseRows || 5;
    const largePatch = Math.floor(seededNoise(Math.floor(q / 4) * 97 + Math.floor(r / 4) * 131 + game.runSeed, 23) * baseRows);
    const smallPatch = seededNoise(q * 17 + r * 31 + game.runSeed, 29) < 0.14 ? 1 : 0;
    return (largePatch + smallPatch) % baseRows;
}

function drawThemeEnvironmentCell(cell, x, y, size, sheet, alpha = 0.18) {
    const { image, meta } = sheet;
    const row = Math.max(0, Math.min(meta.baseRows - 1, cell.themeTileRow ?? getThemeTileRow(cell.q, cell.r, cell.roomIndex)));
    const column = Math.max(0, Math.min(meta.columns - 1, cell.themeTileVariant ?? getThemeTileVariant(cell.q, cell.r)));
    ctx.save();
    drawHexPath(x, y, size * 0.94);
    ctx.clip();
    rendererTools.drawSheetTile(ctx, image, meta, x, y, size * 0.98, row, column, alpha);
    ctx.restore();
}

function drawThemeEnvironmentBlendEdges(cell, x, y, size, sheet, environment) {
    const { meta, image } = sheet;
    if (meta.rows < 6) return;
    const currentRow = cell.themeTileRow ?? getEnvironmentTileRow(cell.q, cell.r);
    HEX_DIRECTIONS.forEach((direction, index) => {
        const neighbor = environment.get(cellKey(cell.q + direction.q, cell.r + direction.r));
        if (!neighbor || neighbor.themeTileRow == null || neighbor.themeTileRow === currentRow) return;
        if (cellKey(cell.q, cell.r) > cellKey(neighbor.q, neighbor.r)) return;
        drawThemeBlendEdge(image, meta, x, y, size * 0.98, index);
    });
}

function drawThemeBlendEdge(image, meta, x, y, size, directionIndex) {
    const direction = HEX_DIRECTIONS[directionIndex];
    if (!direction) return;
    const neighborPoint = hexToPixel(game.player.q + direction.q, game.player.r + direction.r);
    const centerPoint = hexToPixel(game.player.q, game.player.r);
    const offsetX = neighborPoint.x - centerPoint.x;
    const offsetY = neighborPoint.y - centerPoint.y;
    const angle = Math.atan2(offsetY, offsetX);
    const corners = getHexCorners(x, y, size - 2);
    const ranked = corners
        .map((corner) => ({
            corner,
            distance: Math.abs(Math.atan2(Math.sin(corner.angle - angle), Math.cos(corner.angle - angle)))
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)
        .map((entry) => entry.corner);
    if (ranked.length < 2) return;
    const band = 0.045;
    const innerA = {
        x: ranked[0].x + (x - ranked[0].x) * band,
        y: ranked[0].y + (y - ranked[0].y) * band
    };
    const innerB = {
        x: ranked[1].x + (x - ranked[1].x) * band,
        y: ranked[1].y + (y - ranked[1].y) * band
    };

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ranked[0].x, ranked[0].y);
    ctx.lineTo(ranked[1].x, ranked[1].y);
    ctx.lineTo(innerB.x, innerB.y);
    ctx.lineTo(innerA.x, innerA.y);
    ctx.closePath();
    ctx.clip();
    rendererTools.drawSheetTile(ctx, image, meta, x, y, size, meta.blendRow, directionIndex % meta.columns, 0.06);
    ctx.restore();
}

function getHexCorners(x, y, size) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i - Math.PI / 6;
        corners.push({
            x: x + size * Math.cos(angle),
            y: y + size * Math.sin(angle),
            angle
        });
    }
    return corners;
}

function drawAttackEffects() {
    const now = performance.now();
    game.attackEffects = game.attackEffects.filter((effect) => now - effect.startedAt < effect.duration);
    game.attackEffects.forEach((effect) => {
        const progress = Math.min(1, (now - effect.startedAt) / effect.duration);
        const from = hexToPixel(effect.from.q, effect.from.r);
        const to = hexToPixel(effect.to.q, effect.to.r);
        const x = from.x + (to.x - from.x) * progress;
        const y = from.y + (to.y - from.y) * progress;
        const pulse = Math.sin(progress * Math.PI);
        ctx.save();
        if (effect.kind === 'projectile') {
            ctx.strokeStyle = effect.color || '#ff8a72';
            ctx.fillStyle = effect.color || '#ff8a72';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x, y, Math.max(5, from.size * 0.12), 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.strokeStyle = effect.color || '#fff2a7';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(to.x, to.y, to.size * (0.24 + pulse * 0.34), -Math.PI * 0.2, Math.PI * 1.2);
            ctx.stroke();
        }
        ctx.restore();
    });
}

function drawEnemyFacingGuard(cell, x, y, size) {
    if (!enemySystem?.hasBehavior(cell.object, 'armoredFacing') || cell.facingDir == null) return;
    const direction = HEX_DIRECTIONS[cell.facingDir];
    if (!direction) return;
    const neighbor = hexToPixel(cell.q + direction.q, cell.r + direction.r);
    const angle = Math.atan2(neighbor.y - y, neighbor.x - x);
    const pulse = cell.guardFlashUntil && performance.now() < cell.guardFlashUntil
        ? (Math.sin(performance.now() / 60) + 1) / 2
        : 0;
    const radius = size * 0.63;
    const guardX = x + Math.cos(angle) * radius;
    const guardY = y + Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(guardX, guardY);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = `rgba(255, 226, 132, ${0.72 + pulse * 0.2})`;
    ctx.strokeStyle = `rgba(74, 39, 17, ${0.9 + pulse * 0.1})`;
    ctx.lineWidth = 2.2 + pulse * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.18);
    ctx.lineTo(size * 0.2, size * 0.08);
    ctx.quadraticCurveTo(0, size * 0.22, -size * 0.2, size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function addAttackEffect(fromQ, fromR, toQ, toR, sourceObject = '', kind = '') {
    const enemy = getEnemyDef(sourceObject);
    const distance = hexDistance(fromQ, fromR, toQ, toR);
    const effectKind = kind || (distance > 1 ? 'projectile' : 'melee');
    game.attackEffects.push({
        kind: effectKind,
        from: { q: fromQ, r: fromR },
        to: { q: toQ, r: toR },
        color: enemy?.color || (effectKind === 'projectile' ? '#ff8a72' : '#fff2a7'),
        startedAt: performance.now(),
        duration: effectKind === 'projectile' ? 360 : 260
    });
    audioSystem.playEffect(effectKind === 'projectile' ? 'projectile' : 'hit');
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
    return rendererTools.drawTileArt(ctx, image, x, y, size, alpha);
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

function drawMist(x, y, size, softLit = false) {
    ctx.save();
    drawHexPath(x, y, size - 3);
    ctx.fillStyle = softLit ? 'rgba(255, 220, 122, 0.08)' : 'rgba(185, 214, 209, 0.12)';
    ctx.fill();
    ctx.strokeStyle = softLit ? 'rgba(255, 222, 130, 0.42)' : 'rgba(210, 232, 227, 0.12)';
    ctx.lineWidth = softLit ? 2 : 1;
    ctx.stroke();
    if (softLit) {
        drawHexPath(x, y, size - 12);
        ctx.strokeStyle = 'rgba(255, 238, 174, 0.22)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.restore();
}

function drawHexPath(x, y, size) {
    rendererTools.drawHexPath(ctx, x, y, size);
}

function loadSprites() {
    const entries = Object.entries(SPRITE_DEFS);
    const loadableEntries = entries.filter(([, definition]) => definition.src);

    if (!loadableEntries.length) {
        spritesReady = true;
        return;
    }

    loadableEntries.forEach(([key, definition]) => {
        const finish = registerAssetLoad();
        const image = new Image();
        image.onload = () => {
            spriteAssets[key] = createTransparentSpriteCanvas(image);
            spriteFrames = buildSpriteFrames();
            finish();
            draw();
        };
        image.onerror = () => {
            spriteAssets[key] = null;
            spriteFrames = buildSpriteFrames();
            finish();
            draw();
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
    ctx.strokeStyle = getEnemyTimerColor(cell.object);
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

function getEnemyTimerColor(object) {
    const enemy = getEnemyDef(object);
    const behaviorTypes = (enemy?.behaviors || []).map((behavior) => behavior.type);
    if (behaviorTypes.includes('waterDrainAura')) return 'rgba(74, 185, 255, 0.95)';
    if (behaviorTypes.includes('stealResourceAura')) return 'rgba(174, 124, 255, 0.95)';
    if (behaviorTypes.includes('refogAura')) return 'rgba(146, 193, 211, 0.9)';
    if (behaviorTypes.includes('buffEnemiesAura')) return 'rgba(245, 200, 75, 0.95)';
    if (behaviorTypes.includes('spawnEnemyAura') || behaviorTypes.includes('spawnTerrainAura') || behaviorTypes.includes('markCellsAura') || behaviorTypes.includes('burrowAmbush') || behaviorTypes.includes('weakPointWindow')) {
        return 'rgba(255, 166, 65, 0.95)';
    }
    return 'rgba(249, 65, 68, 0.92)';
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
    if (game.player.actionAvailable || game.mode !== 'dungeon' || game.ended) return;

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

function renderInspectPanel() {
    if (!inspectPanelNode) return;
    if (game.mode !== 'dungeon' || game.ended || game.replay) {
        inspectUi.render(inspectPanelNode, { hidden: true });
        return;
    }
    const cell = game.inspectedCell || game.hover?.cell;
    if (!cell) {
        inspectUi.render(inspectPanelNode, { hidden: true });
        return;
    }
    const liveCell = getCell(cell.q, cell.r) || cell;
    const info = getCellInfo(liveCell);
    if (!info) {
        inspectUi.render(inspectPanelNode, { hidden: true });
        return;
    }
    const object = liveCell.revealed || liveCell.litByLamp ? liveCell.object : 'empty';
    if (object === 'empty') {
        inspectUi.render(inspectPanelNode, { hidden: true });
        return;
    }
    const name = info.lines[0] || '';
    const role = info.lines[1] || '';
    const lines = info.lines.slice(2);
    const fallback = getFallbackLabel(object) || name.slice(0, 2).toUpperCase();
    const stats = getInspectStats(liveCell, object);
    inspectUi.render(inspectPanelNode, {
        color: info.color || '#f5c84b',
        fallback,
        name,
        role,
        lines,
        stats
    });
}

function getInspectStats(cell, object) {
    const stats = [];
    const visibilityStats = inspectStatsSystem.getVisibilityStats(cell, game.mode === 'dance');
    if (visibilityStats.some((stat) => stat.kind === 'hidden')) {
        visibilityStats.forEach((stat) => stats.push(stat));
        return stats;
    }
    visibilityStats.forEach((stat) => stats.push(stat));

    if (isEnemyObject(object)) {
        const enemy = getEnemyDef(object);
        inspectStatsSystem.getEnemyStats(object, cell, enemy).forEach((stat) => stats.push(stat));
    } else {
        getObjectEffectStats(object).forEach((stat) => stats.push(stat));
    }

    const preview = getPathPreview(cell);
    inspectStatsSystem.getRouteStats(preview, getRouteMoveBudget()).forEach((stat) => stats.push(stat));

    return stats.slice(0, 8);
}

function getObjectEffectStats(object) {
    return inspectStatsSystem.getObjectEffectStats(object, OBJECTS);
}

function getCellInfo(cell) {
    if (!cell.revealed && !cell.litByLamp && game.mode !== 'dance') {
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
        const maxHp = cell.bossHp || enemy.hp;
        const hp = Math.max(0, maxHp - (cell.hits || 0));
        const status = cell.object === 'sleepingBat' && !cell.awake
            ? (currentLanguage === 'es-419' ? 'Dormido' : 'Sleeping')
            : (currentLanguage === 'es-419' ? 'Activo' : 'Active');
        return {
            color: enemy.color,
            lines: [
                enemy.name,
                `${t('ui', 'hp')} ${hp}/${maxHp} | ${t('ui', 'attack')} ${enemy.attack} | ${t('ui', 'range')} ${enemy.range}`,
                enemy.behavior,
                enemy.lesson,
                ...(enemySystem.hasBehavior(cell.object, 'armoredFacing')
                    ? [currentLanguage === 'es-419'
                        ? 'Guardia frontal: el indicador dorado muestra el lado que bloquea.'
                        : 'Front guard: the gold marker shows the side that blocks stings.']
                    : []),
                ...(enemySystem.hasBehavior(cell.object, 'chargeLane')
                    ? [currentLanguage === 'es-419'
                        ? 'Carril de carga: las celdas marcadas explotan si te quedas ahi.'
                        : 'Charge lane: marked cells will detonate if you stay there.']
                    : []),
                `${currentLanguage === 'es-419' ? 'Estado' : 'Status'}: ${status}`,
                ...getRouteExplanationLines(cell)
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
            getActionPreview(cell),
            ...getRouteExplanationLines(cell)
        ].filter(Boolean)
    };
}

function getPathPreview(cell) {
    return pathfindingSystem.getPathPreview(cell);
}

function findPathToCell(target) {
    return pathfindingSystem.findPathToCell(target);
}

function isPathWalkable(cell, target) {
    return pathfindingSystem.isPathWalkable(cell, target);
}

function isPathBlockedTarget(cell) {
    return pathfindingSystem.isPathBlockedTarget(cell);
}

function annotatePathRisk(preview) {
    return pathfindingSystem.annotatePathRisk(preview);
}

function getRouteMoveBudget() {
    return Math.max(0, game.player.movePoints ?? game.player.stamina ?? 0);
}

function getRouteMoveCost(path = []) {
    return pathfindingSystem.getRouteMoveCost(path);
}

function getObjectRole(object) {
    const roles = I18N[currentLanguage].roles;
    const rule = cellInteractions.getInteractionRule(object);
    if (rule.detail === 'burningCell') return `${roles.hazard} | ${currentLanguage === 'es-419' ? 'gasta 1 agua o recibe 1 dano' : 'spend 1 water or take 1 damage'}`;
    if (rule.detail === 'vine') return `${roles.hazard} | ${VINE_DAMAGE} ${currentLanguage === 'es-419' ? 'daño al cruzar' : 'damage when crossed'}`;
    return roles[rule.role] || roles.item;
}

function getActionPreview(cell) {
    if (!isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        const preview = getPathPreview(cell);
        if (preview?.path?.length) {
            const danger = preview.deathCell
                ? t('messages', 'pathLethalShort')
                : preview.risk?.totalDamage
                ? formatText('messages', 'pathRisk', { damage: preview.risk.totalDamage })
                : '';
            return preview.blockedTarget
                ? t('messages', 'blockedTarget')
                : formatText('messages', 'pathSteps', {
                    steps: preview.path.length,
                    danger: preview.path.length > (preview.reachableLength ?? preview.path.length)
                        ? `${danger} ${currentLanguage === 'es-419' ? `Llegas ${preview.reachableLength}.` : `Reach ${preview.reachableLength}.`}`
                        : danger
                });
        }
        return t('actions', 'moveNext');
    }

    const object = cell.object;
    const rule = cellInteractions.getInteractionRule(object);
    if (isEnemyObject(object)) return game.player.actionAvailable ? t('actions', 'sting') : t('actions', 'waitSting');
    if (rule.action === 'wall') return OBJECTS.wall?.description || t('ui', 'blockedGeneric');
    if (rule.action === 'waxDoor') return game.player.pollen > 0 ? t('actions', 'openPollen') : t('actions', 'openSting');
    if (rule.action === 'crossHazard') return t('actions', 'crossHazard');
    if (rule.action === 'trade') return t('actions', 'trade');
    if (rule.action === 'nextRoom') return t('actions', 'nextRoom');
    if (rule.action === 'finalDance') return t('actions', 'finalDance');
    if (rule.action === 'entrySealed') return currentLanguage === 'es-419' ? 'Accion: la entrada ya esta cerrada.' : 'Action: the entry is sealed.';
    if (isFreeWalkoverObject(object)) return t('actions', 'move');
    return t('actions', 'collect');
}

function getRouteExplanationLines(cell) {
    if (!cell || game.mode !== 'dungeon') return [];
    const preview = getPathPreview(cell);
    if (!preview?.path?.length) return [];
    const reachable = Math.min(preview.path.length, getRouteMoveBudget());
    const fullLength = preview.fullLength || preview.path.length;
    const lines = [];
    const routeLabel = currentLanguage === 'es-419' ? 'Ruta' : 'Route';
    const nowLabel = currentLanguage === 'es-419' ? 'este turno' : 'this turn';
    lines.push(currentLanguage === 'es-419'
        ? `${routeLabel}: cuesta ${fullLength} movimiento; alcanzas ${reachable}/${fullLength} ${nowLabel}.`
        : `${routeLabel}: costs ${fullLength} movement; reach ${reachable}/${fullLength} ${nowLabel}.`);

    if (preview.blockedTarget) {
        lines.push(currentLanguage === 'es-419'
            ? 'Parada: bloqueo. Llega al lado y paga o interactua.'
            : 'Stop: blocker. Move beside it, then pay or interact.');
    } else if (preview.deathCell) {
        lines.push(currentLanguage === 'es-419'
            ? 'Peligro: esta ruta puede terminar la partida.'
            : 'Danger: this route can end the run.');
    } else if (!preview.complete || reachable < fullLength) {
        lines.push(currentLanguage === 'es-419'
            ? 'Parada: se agota tu movimiento antes del objetivo.'
            : 'Stop: movement runs out before the target.');
    } else {
        lines.push(currentLanguage === 'es-419'
            ? 'Resultado: puedes llegar ahora.'
            : 'Result: reachable now.');
    }

    const risk = preview.risk || {};
    const consequences = [];
    if (risk.totalDamage > 0) {
        consequences.push(currentLanguage === 'es-419'
            ? `${risk.totalDamage} dano`
            : `${risk.totalDamage} damage`);
    }
    if (risk.totalBlocked > 0) {
        consequences.push(currentLanguage === 'es-419'
            ? `${risk.totalBlocked} bloqueado por escudo`
            : `${risk.totalBlocked} blocked by shield`);
    }
    if (risk.waterSpent > 0) {
        consequences.push(currentLanguage === 'es-419'
            ? `${risk.waterSpent} agua`
            : `${risk.waterSpent} water`);
    }
    if (consequences.length) {
        lines.push(currentLanguage === 'es-419'
            ? `Costo previsto: ${consequences.join(', ')}.`
            : `Expected cost: ${consequences.join(', ')}.`);
    }

    if (cell.object === 'waxDoor') {
        lines.push(currentLanguage === 'es-419'
            ? 'Leccion: guarda 1 polen para abrir puertas de cera.'
            : 'Lesson: save 1 pollen to open wax doors.');
    } else if (isEnemyObject(cell.object)) {
        lines.push(currentLanguage === 'es-419'
            ? 'Leccion: revisa el alcance y busca una celda segura antes de picar.'
            : 'Lesson: check range and find a safe cell before stinging.');
    } else if (cell.object === 'lampCell') {
        lines.push(currentLanguage === 'es-419'
            ? 'Leccion: las lamparas iluminan vecinos sin revelar todo.'
            : 'Lesson: lamps light neighbors without revealing everything.');
    }

    return lines.slice(0, 4);
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
    if (game.replay || game.ended || game.settingsPaused || !cell || game.player.health <= 0) {
        return;
    }

    if (game.mode === 'dance') {
        handleDanceClick(cell);
        return;
    }

    if (game.mode !== 'dungeon') {
        return;
    }

    const sameCell = cell.q === game.player.q && cell.r === game.player.r;
    if (!sameCell && !isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        followPathTo(cell);
        return;
    }

    const actionState = getCellActionState(cell);
    if (!actionState.available) {
        game.autoPath = [];
        showBlockedAction(cell, actionState.reason);
        return;
    }

    const targetObject = cell.object;
    const registeredMoveHandler = cellInteractions.getMoveHandler(targetObject);
    if (registeredMoveHandler?.timing === 'beforeMove') {
        registeredMoveHandler.run({ cell, targetObject });
        return;
    }

    if (isEnemyObject(targetObject)) {
        attackEnemyCell(cell);
        return;
    }

    const collectOnMove = isCollectOnMoveObject(targetObject);
    const targetRequiresAction = !collectOnMove && !isFreeWalkoverObject(targetObject);
    if (targetRequiresAction && !game.player.actionAvailable) {
        game.autoPath = [];
        showBlockedAction(cell, currentLanguage === 'es-419' ? 'Ya usaste tu acción este turno.' : 'You already used your action this turn.');
        return;
    }

    const previousPosition = { q: game.player.q, r: game.player.r };
    game.lastMoveDirection = {
        q: cell.q - game.player.q,
        r: cell.r - game.player.r
    };
    if (!spendMovePoints(1)) {
        game.autoPath = [];
        showBlockedAction(cell, t('ui', 'blockedStamina'));
        return;
    }
    game.metrics.movesMade += 1;
    game.metrics.cellsMoved += 1;
    audioSystem.playEffect(isEnemyObject(targetObject) ? 'sting' : isFreeWalkoverObject(targetObject) ? 'move' : 'pick');
    game.player.q = cell.q;
    game.player.r = cell.r;
    startPlayerMotion(previousPosition.q, previousPosition.r, cell.q, cell.r);
    game.player.steps += 1;
    cell.visited = true;
    if (targetRequiresAction) {
        game.autoPath = [];
    }

    if (registeredMoveHandler?.timing === 'afterMove') {
        registeredMoveHandler.run({ cell, targetObject, previousPosition });
        return;
    }

    const interaction = resolveInteraction(targetObject, cell);
    if (cell.isBoss && game.roomDepth >= FINAL_ROOM) {
        interaction.consume = true;
    }
    const actionObject = !collectOnMove && !isFreeWalkoverObject(targetObject);
    if (actionObject && !consumeAction(`interact:${targetObject}`)) {
        showBlockedAction(cell, currentLanguage === 'es-419' ? 'Ya usaste tu acción este turno.' : 'You already used your action this turn.');
        return;
    }
    applyRelicCollectionBonus(targetObject, interaction);
    game.message = interaction.message;
    addLog(OBJECTS[targetObject].name, interaction.message);
    addStatPopups(cell.q, cell.r, interaction.deltas);
    if (interaction.blocked) {
        addWarningPopup(cell.q, cell.r, currentLanguage === 'es-419' ? 'Frente bloqueado' : 'Front blocked');
    }
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
            if (cell.isBoss) {
                game.autoPath = [];
                audioSystem.playEffect('win');
                endRun('boss-defeated');
                return;
            }
        } else if (!['empty', 'entry', 'exit', 'finalExit', 'vine', 'stickyTrap'].includes(targetObject)) {
            if (['pollen', 'water', 'honeyDrop', 'nectarCache', 'cleanWater'].includes(targetObject)) {
                game.objectiveProgress.supplies += 1;
            }
            trackCollectedResources(interaction.deltas);
            awardXp(getItemXp(targetObject), OBJECTS[targetObject]?.name, { silent: true });
        }
        cell.object = 'empty';
    }
    updateObjectiveProgress();
    recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r });
    if (!game.autoPath.length) endPlayerTurn(actionObject ? 'action' : 'move');
    draw();
}

function attackEnemyCell(cell) {
    if (!game.player.actionAvailable) {
        game.autoPath = [];
        showBlockedAction(cell, currentLanguage === 'es-419' ? 'Ya atacaste este turno.' : 'You already attacked this turn.');
        return;
    }
    const range = getActionRange(cell);
    if (hexDistance(game.player.q, game.player.r, cell.q, cell.r) > range) {
        followPathTo(cell);
        return;
    }
    consumeAction('attack');
    if (cell.isBoss || game.roomDepth >= FINAL_ROOM) {
        game.bossEngaged = true;
    }
    game.autoPath = [];
    game.metrics.attacksMade += 1;
    game.metrics.lastAttack = { turn: game.metrics.turns, q: cell.q, r: cell.r, object: cell.object };
    audioSystem.playEffect('sting');
    addAttackEffect(game.player.q, game.player.r, cell.q, cell.r, cell.object, 'melee');
    const targetObject = cell.object;
    const interaction = resolveInteraction(targetObject, cell);
    if (cell.isBoss && game.roomDepth >= FINAL_ROOM) {
        interaction.consume = true;
    }
    game.message = interaction.message;
    addLog(OBJECTS[targetObject].name, interaction.message);
    addStatPopups(cell.q, cell.r, interaction.deltas);
    if (interaction.blocked) {
        addWarningPopup(cell.q, cell.r, currentLanguage === 'es-419' ? 'Frente bloqueado' : 'Front blocked');
    }
    if (interaction.consume) {
        game.objectiveProgress.kills += 1;
        awardXp(getEnemyXp(targetObject), getEnemyDef(targetObject).name);
        applyEnemyKillRelics(cell);
        if (targetObject === 'waspHive' && game.roomDepth >= FINAL_ROOM) {
            clearBossHiveSummons(cell);
        }
        if (cell.isBoss) {
            game.autoPath = [];
            audioSystem.playEffect('win');
            endRun('boss-defeated');
            return;
        }
        cell.object = 'empty';
    }
    updateObjectiveProgress();
    recordReplayEvent('playerAction', { object: targetObject, q: cell.q, r: cell.r, action: 'attack' });
    endPlayerTurn('attack');
    draw();
}

function clearBossHiveSummons(hiveCell) {
    let cleared = 0;
    game.cells.forEach((cell) => {
        if (cell.object === 'enemy' && hexDistance(cell.q, cell.r, hiveCell.q, hiveCell.r) <= 3) {
            cell.object = 'empty';
            cell.hits = 0;
            cell.nextAuraAt = 0;
            cleared += 1;
        }
    });
    if (cleared > 0) {
        addLog(currentLanguage === 'es-419' ? 'Colmena rota' : 'Hive Broken', currentLanguage === 'es-419'
            ? 'La avispa invocada se dispersó.'
            : 'The summoned wasp scattered.');
    }
}

function getActionRange(cell) {
    return tacticalCombat.getActionRange(game, cell, isEnemyObject, START_ATTACK_RANGE);
}

function followPathTo(cell) {
    const preview = getPathPreview(cell);
    if (!preview?.path?.length) {
        showBlockedAction(cell, t('ui', 'blockedNotAdjacent'));
        return;
    }
    if (preview.deathCell) {
        showBlockedAction(cell, t('messages', 'pathLethal'));
        return;
    }
    const reachablePath = preview.path.slice(0, getRouteMoveBudget());
    if (!reachablePath.length) {
        showBlockedAction(cell, t('ui', 'blockedStamina'));
        return;
    }
    game.autoPath = reachablePath.slice(1).map((step) => ({ q: step.q, r: step.r }));
    moveTo(reachablePath[0]);
}

function spendStamina(amount) {
    spendMovePoints(amount);
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

function trackCollectedResources(deltas = []) {
    deltas.forEach((delta) => {
        if (['pollen', 'water', 'honey'].includes(delta.stat) && delta.amount > 0) {
            game.metrics.resourcesCollected[delta.stat] += delta.amount;
        }
    });
}

function captureRoomEndMetrics() {
    game.metrics.roomEndUnspent.push({
        room: game.roomDepth,
        pollen: game.player.pollen,
        water: game.player.water,
        honey: game.player.honey,
        shield: game.player.upgrades
    });
}

function applyEnemyKillRelics(cell) {
    if (!hasRelic('battleRhythm')) return;
    if (game.player.movePoints >= game.player.maxMovePoints) return;
    game.player.movePoints = Math.min(game.player.maxMovePoints, game.player.movePoints + 1);
    syncLegacyStamina();
    addStatPopups(cell.q, cell.r, [{ stat: 'stamina', amount: 1 }]);
    addLog('Battle Rhythm', 'Enemy defeat restored 1 movement point.');
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
    if (!game.player.actionAvailable) {
        showBlockedAction(cell, currentLanguage === 'es-419' ? 'Ya usaste tu acción este turno.' : 'You already used your action this turn.');
        return;
    }
    if (game.freeWaxDoorAvailable) {
        audioSystem.playEffect('open');
        consumeAction('openDoor');
        game.freeWaxDoorAvailable = false;
        cell.object = 'empty';
        game.message = 'Path Carver opened the wax door for free.';
        addLog('Path Carver', game.message);
        recordReplayEvent('playerAction', { object: 'waxDoor', q: cell.q, r: cell.r, method: 'pathCarver' });
        endPlayerTurn('action');
        draw();
        return;
    }

    if (game.player.pollen > 0) {
        audioSystem.playEffect('open');
        consumeAction('openDoor');
        game.player.pollen -= 1;
        cell.object = 'empty';
        addStatPopups(cell.q, cell.r, [{ stat: 'pollen', amount: -1 }]);
        game.message = 'Spent 1 pollen to open the wax door.';
        addLog('Wax Door', game.message);
        recordReplayEvent('playerAction', { object: 'waxDoor', q: cell.q, r: cell.r, method: 'pollen' });
        endPlayerTurn('action');
        draw();
        return;
    }

    if (game.player.actionAvailable) {
        audioSystem.playEffect('sting');
        consumeAction('openDoorSting');
        game.player.attackAnimationUntil = performance.now() + 520;
        cell.object = 'empty';
        game.message = 'Stung through the wax door.';
        addLog('Wax Door', game.message);
        recordReplayEvent('playerAction', { object: 'waxDoor', q: cell.q, r: cell.r, method: 'sting' });
        endPlayerTurn('action');
        draw();
        return;
    }

    game.message = 'Wax door needs 1 pollen or an unused action.';
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
    recordReplayEvent('blockedAction', { q: cell?.q, r: cell?.r, reason: message });
    draw();
}

function addWarningPopup(q, r, message) {
    showTopToast(currentLanguage === 'es-419' ? 'Aviso' : 'Notice', message, 'warning');
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
        if (object === 'waxSentinel' && (!cell.weakPointUntil || performance.now() > cell.weakPointUntil)) {
            return {
                message: `${enemy.name} is sealed. Wait for its weak point to open.`,
                deltas: [],
                consume: false
            };
        }
        if (isAttackBlockedByFacing(cell)) {
            cell.guardFlashUntil = performance.now() + 850;
            return {
                message: currentLanguage === 'es-419'
                    ? `${enemy.name} bloquea con su frente. Flanquea desde el lado o la espalda.`
                    : `${enemy.name} blocks with its front. Flank from the side or back.`,
                deltas: [],
                consume: false,
                blocked: true
            };
        }
        if (game.roomFirstStingAvailable) game.roomFirstStingAvailable = false;
        game.player.attackAnimationUntil = performance.now() + 520;
        const usesDoubleSting = (object === 'bat' || object === 'sleepingBat') && game.player.stingCharges > 0;
        const facingBehavior = enemySystem.getBehavior(object, 'armoredFacing');
        const flankBonus = facingBehavior?.flankBonus || 0;
        const hitPower = (usesDoubleSting ? 2 : 1) + flankBonus;
        cell.hits = (cell.hits || 0) + hitPower;
        cell.nextAttackAt = 0;
        cell.nextAuraAt = 0;
        if (enemySystem.hasBehavior(object, 'armoredFacing')) {
            cell.guardFlashUntil = performance.now() + 500;
        }
        if (usesDoubleSting) {
            game.player.stingCharges -= 1;
        }
        const maxHp = cell.bossHp || enemy.hp;
        const killed = cell.hits >= maxHp;
        if (killed) {
            game.runStats.kills += 1;
            game.metrics.enemiesKilled += 1;
        }
        return {
            message: !killed
                ? `${enemy.name} hit ${cell.hits}/${maxHp}${flankBonus ? ' with a flanking sting' : ''}. It still blocks the way.`
                : usesDoubleSting
                ? `Double sting defeated the ${enemy.name.toLowerCase()}.`
                : flankBonus
                ? `Flanking sting defeated the ${enemy.name.toLowerCase()}.`
                : `${enemy.name} defeated.`,
            deltas: [
                ...(usesDoubleSting ? [{ stat: 'stingCharges', amount: -1 }] : []),
                ...(flankBonus ? [{ stat: 'attack', amount: flankBonus }] : [])
            ],
            consume: killed
        };
    }

    if (object === 'water' && isWaterDrained(cell.q, cell.r)) {
        return {
            message: 'Water Leech drained this water before the bee could use it.',
            deltas: [],
            consume: true
        };
    }

    return itemSystem.resolve(object, cell);
}

function isWaterDrained(q, r) {
    return game.cells.some((cell) => (
        cell.object === 'waterLeech'
        && hexDistance(cell.q, cell.r, q, r) <= (getEnemyDef('waterLeech')?.range || 2)
    ));
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
    const movers = game.cells.filter((cell) => {
        const behavior = enemySystem.getBehavior(cell.object, 'moveEverySteps');
        if (!behavior) return false;
        return game.player.steps % (behavior.stepInterval || MITE_MOVE_STEP_INTERVAL) === 0;
    });
    const plannedMoves = [];

    movers.forEach((mite) => {
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
            plannedMoves.push({ from: mite, to: best.cell, object: mite.object, hits: mite.hits || 0 });
        }
    });

    plannedMoves.forEach((move) => {
        move.from.object = 'empty';
        move.from.nextAuraAt = 0;
        move.to.object = move.object;
        move.to.nextAuraAt = 0;
        move.to.hits = move.hits || 0;
        move.from.hits = 0;
    });

    if (plannedMoves.length) {
        addLog('Enemy Movement', `${plannedMoves.length} moving threat${plannedMoves.length === 1 ? '' : 's'} crept closer.`);
        recordReplayEvent('enemyMove', { enemy: 'stepMover', count: plannedMoves.length });
    }
}

function moveMirrorWasps() {
    const direction = game.lastMoveDirection;
    if (!direction || (!direction.q && !direction.r)) return;

    const plannedMoves = [];
    game.cells
        .filter((cell) => enemySystem.hasBehavior(cell.object, 'mirrorMove'))
        .forEach((wasp) => {
            const target = getCell(wasp.q + direction.q, wasp.r + direction.r);
            if (!target || target.object !== 'empty' || (target.q === game.player.q && target.r === game.player.r)) return;
            if (plannedMoves.some((move) => move.to === target)) return;
            plannedMoves.push({ from: wasp, to: target, object: wasp.object, hits: wasp.hits || 0 });
        });

    plannedMoves.forEach((move) => {
        move.from.object = 'empty';
        move.from.hits = 0;
        move.from.nextAuraAt = 0;
        move.to.object = move.object;
        move.to.hits = move.hits;
        move.to.nextAuraAt = 0;
        move.to.revealed = move.from.revealed;
    });

    if (plannedMoves.length) {
        addLog('Mirror Wasp', `${plannedMoves.length} mirror wasp${plannedMoves.length === 1 ? '' : 's'} copied the bee's move.`);
        recordReplayEvent('enemyMove', { enemy: 'mirrorWasp', count: plannedMoves.length });
    }
}

function updateTerrainEffects() {
    const now = performance.now();
    game.cells.forEach((cell) => {
        if (cell.object === 'burrowWarningCell' && cell.emergeAt && now >= cell.emergeAt) {
            const onPlayer = cell.q === game.player.q && cell.r === game.player.r;
            if (onPlayer) {
                applyDamage(1, cell.q, cell.r, 'Burrow Beetle Emerge');
                cell.object = 'empty';
            } else {
                cell.object = cell.emergeObject || 'burrowBeetle';
                cell.hits = 0;
                cell.nextAuraAt = 0;
            }
            cell.emergeAt = 0;
            cell.emergeObject = null;
            recordReplayEvent('enemySpecial', { enemy: 'burrowBeetle', q: cell.q, r: cell.r, effect: 'emerge' });
        }

        if (cell.object === 'bomberMarkedCell' && cell.detonateAt && now >= cell.detonateAt) {
            if (cell.q === game.player.q && cell.r === game.player.r) {
                applyDamage(cell.detonateDamage || 1, cell.q, cell.r, 'Comb Bomber Blast');
            }
            cell.object = 'empty';
            cell.detonateAt = 0;
            cell.detonateDamage = 0;
            recordReplayEvent('enemySpecial', { enemy: 'combBomber', q: cell.q, r: cell.r, effect: 'detonate' });
        }
    });
}

function updateAutoPath() {
    if (!game.autoPath?.length || game.replay || game.ended || game.mode !== 'dungeon' || game.playerMotion) return;
    const next = game.autoPath.shift();
    const cell = getCell(next.q, next.r);
    if (!cell || !isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        game.autoPath = [];
        return;
    }
    moveTo(cell);
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
        game.deathTip = runSummarySystem.getDeathTip(source);
        game.metrics.damageBySource[source] = (game.metrics.damageBySource[source] || 0) + healthDamage;
    }

    addStatPopups(q, r, deltas);
    addAttackEffect(q, r, game.player.q, game.player.r, getObjectAt(q, r));

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

function isEnemyObject(object) {
    return Boolean(ENEMY_DEFS[object]);
}

function getEnemyDef(object) {
    return ENEMY_DEFS[object] || null;
}

function hasTimedAura(object) {
    return enemySystem.hasTimedThreat(object);
}

function getObjectAt(q, r) {
    return getCell(q, r)?.object || '';
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
        ? formatText('messages', 'gameOver', { source: game.lastDamageSource || 'The last hit' })
        : reason === 'boss-defeated'
        ? t('messages', 'bossDefeated')
        : reason === 'dance-failed'
        ? formatText('messages', 'danceFailed', { percent: danceComplete })
        : t('messages', 'runComplete');
    addLog(reason === 'death' ? t('logs', 'gameOver') : reason === 'boss-defeated' ? t('logs', 'bossDefeated') : reason === 'dance-failed' ? t('logs', 'danceFailed') : t('logs', 'runComplete'), game.message);

    const stats = [
        [currentLanguage === 'es-419' ? 'Bajas' : 'Kills', game.runStats.kills],
        [t('stats', 'pollen')[0], game.runStats.pollen],
        [t('stats', 'water')[0], game.runStats.water],
        [t('ui', 'honey'), game.runStats.honey],
        ...(game.dance ? [[currentLanguage === 'es-419' ? 'Multiplicador de baile' : 'Dance Multiplier', `x${game.dance.multiplier.toFixed(1)}`]] : []),
        [currentLanguage === 'es-419' ? 'XP ganada' : 'XP Gained', game.runStats.xp],
        [currentLanguage === 'es-419' ? 'Nivel de abeja' : 'Bee Level', progression.level],
        [currentLanguage === 'es-419' ? 'Tiempo sobrevivido' : 'Time Survived', `${minutes}:${String(remainingSeconds).padStart(2, '0')}`],
        [currentLanguage === 'es-419' ? 'Progreso final' : 'Final Progress', reason === 'death' ? '0%' : reason === 'boss-defeated' ? '100%' : `${danceComplete}%`],
        ...(reason === 'death' ? [
            [currentLanguage === 'es-419' ? 'Causa' : 'Cause', game.lastDamageSource || 'Unknown'],
            [currentLanguage === 'es-419' ? 'Consejo' : 'Tip', game.deathTip || runSummarySystem.getDeathTip()]
        ] : []),
        [currentLanguage === 'es-419' ? 'Polen total' : 'Lifetime Pollen', progression.lifetimePollen],
        [currentLanguage === 'es-419' ? 'Miel total' : 'Lifetime Honey', progression.lifetimeHoney],
        [currentLanguage === 'es-419' ? 'Turnos' : 'Turns', game.metrics.turns],
        [currentLanguage === 'es-419' ? 'Ataques' : 'Attacks', game.metrics.attacksMade],
        [currentLanguage === 'es-419' ? 'Celdas movidas' : 'Cells Moved', game.metrics.cellsMoved],
        [currentLanguage === 'es-419' ? 'Bucles ataque-retirada' : 'Attack-Retreat Loops', game.metrics.repeatedAttackRetreatPatterns],
        [currentLanguage === 'es-419' ? 'Daño por fuente' : 'Damage Sources', formatDamageMetrics()],
        [currentLanguage === 'es-419' ? 'Recomendación' : 'Recommendation', runSummarySystem.getRunRecommendation({
            reason,
            metrics: game.metrics,
            player: game.player,
            runStats: game.runStats
        })],
        [currentLanguage === 'es-419' ? 'Desbloqueos' : 'Unlocks', getProgressionUnlockText()],
        [currentLanguage === 'es-419' ? 'Semilla' : 'Seed', game.runSeed]
    ];

    const danceOffset = game.dance ? 1 : 0;
    const deathOffset = reason === 'death' ? 2 : 0;
    const progressionIndex = 4 + danceOffset;
    const timeIndex = progressionIndex + 2;
    const deathIndex = timeIndex + 2;
    const lifetimeIndex = deathIndex + deathOffset;
    const tacticsIndex = lifetimeIndex + 2;
    const groupedStats = [
        [currentLanguage === 'es-419' ? 'Run' : 'Run', stats.slice(0, progressionIndex).concat(stats.slice(timeIndex, timeIndex + 2))],
        ...(reason === 'death' ? [[currentLanguage === 'es-419' ? 'Derrota' : 'Defeat', stats.slice(deathIndex, deathIndex + 2)]] : []),
        [currentLanguage === 'es-419' ? 'Progreso' : 'Progression', stats.slice(progressionIndex, progressionIndex + 2).concat(stats.slice(lifetimeIndex, lifetimeIndex + 2), stats.slice(-2, -1))],
        [currentLanguage === 'es-419' ? 'Tactica' : 'Tactics', stats.slice(tacticsIndex, -2).concat(stats.slice(-1))]
    ];

    endStatsNode.innerHTML = groupedStats.map(([title, entries]) => (
        `<section class="end-stat-group"><h3>${escapeHtml(title)}</h3>${entries.map(([label, value]) => (
            `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
        )).join('')}</section>`
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

function formatDamageMetrics() {
    const entries = Object.entries(game.metrics.damageBySource || {});
    if (!entries.length) return currentLanguage === 'es-419' ? 'Ninguno' : 'None';
    return entries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([source, amount]) => `${source}: ${amount}`)
        .join(', ');
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
    replaySystem.record(type, payload);
}

function createReplaySnapshot() {
    return {
        capturedAt: performance.now(),
        seed: game.runSeed,
        mode: game.mode,
        roomDepth: game.roomDepth,
        cells: game.cells.map((cell) => ({ ...cell })),
        currentRoomCells: game.currentRoomCells.map((cell) => ({ ...cell })),
        caveMetadata: game.caveMetadata ? JSON.parse(JSON.stringify(game.caveMetadata)) : null,
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
    game.currentRoomCells = (snapshot.currentRoomCells || snapshot.cells || []).map((cell) => ({
        q: cell.q,
        r: cell.r,
        roomIndex: cell.roomIndex,
        kind: cell.kind
    }));
    game.caveMetadata = snapshot.caveMetadata ? JSON.parse(JSON.stringify(snapshot.caveMetadata)) : null;
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
    return replaySystem.normalizeDanceTiming(dance, capturedAt, now);
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
    const events = replaySystem.cloneEvents();
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
    showTopToast(title, message, getToastTone(title, message));
}

function showTopToast(title, message, tone = 'info') {
    if (!eventToastNode) return;
    game.lastToastId += 1;
    game.toast = {
        id: game.lastToastId,
        title,
        message,
        tone,
        createdAt: performance.now()
    };
    renderTopToast();
    if (toastHideTimer) clearTimeout(toastHideTimer);
    const toastId = game.lastToastId;
    toastHideTimer = setTimeout(() => {
        if (game.toast?.id !== toastId) return;
        game.toast = null;
        renderTopToast();
    }, tone === 'danger' ? 3800 : tone === 'warning' ? 2600 : 2400);
}

function openSettingsOverlay() {
    menuController.openSettingsOverlay();
}

function closeSettingsOverlay() {
    menuController.closeSettingsOverlay();
}

function getToastTone(title = '', message = '') {
    const text = `${title} ${message}`.toLowerCase();
    if (text.includes('damage') || text.includes('daño') || text.includes('game over') || text.includes('fin de partida') || text.includes('blocked') || text.includes('bloqueada')) {
        return 'danger';
    }
    if (text.includes('objective') || text.includes('objetivo') || text.includes('level') || text.includes('nivel') || text.includes('relic') || text.includes('reliquia')) {
        return 'warning';
    }
    return 'info';
}

function renderTopToast() {
    if (!eventToastNode) return;
    const toast = game.toast;
    eventToastNode.classList.toggle('visible', Boolean(toast));
    eventToastNode.classList.toggle('warning', toast?.tone === 'warning');
    eventToastNode.classList.toggle('danger', toast?.tone === 'danger');
    eventToastNode.setAttribute('aria-label', toast ? `${toast.title}. ${toast.message}` : '');
    eventToastNode.innerHTML = toast
        ? `<strong>${escapeHtml(toast.title)}</strong> <span>${escapeHtml(toast.message)}</span>`
        : '';
    if (!toast) return;
    eventToastNode.classList.remove('toast-swap');
    void eventToastNode.offsetWidth;
    eventToastNode.classList.add('toast-swap');
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
    renderBottomCombatHud();
}

function renderStatsHud(statsText) {
    if (game.mode === 'dance') {
        hudRenderer.renderStats([]);
        return;
    }
    const firstRoom = game.roomDepth === 1;
    const items = [
        { id: 'objective', value: game.roomObjective?.isComplete() ? 'OK' : '...', title: roomTemplateSystem.getRoomObjectiveText() || (currentLanguage === 'es-419' ? 'Objetivo de sala' : 'Room objective'), hudIcon: HUD_ICON_ROWS.objective, fallback: 'OBJ', color: '#9ee7ff', tone: game.roomObjective?.isComplete() ? '' : 'warning' }
    ];
    if (!firstRoom || game.player.pollen > 0) {
        items.splice(1, 0, { id: 'pollen', value: game.player.pollen, title: `${statsText.pollen[0]}: ${statsText.pollen[1]}`, hudIcon: HUD_ICON_ROWS.pollen, sprite: 'pollen', fallback: 'P', color: '#f7d45c' });
    }
    if (!firstRoom || game.player.water > 0) {
        items.splice(2, 0, { id: 'water', value: game.player.water, title: `${statsText.water[0]}: ${statsText.water[1]}`, hudIcon: HUD_ICON_ROWS.water, sprite: 'water', fallback: 'W', color: '#4bb6f2' });
    }
    if (!firstRoom || game.player.honey > 0) {
        items.push({ id: 'honey', value: game.player.honey, title: `${t('ui', 'honey')}: ${t('ui', 'honeyHint')}`, hudIcon: HUD_ICON_ROWS.honey, sprite: 'honeyDrop', fallback: 'H', color: '#f2b544' });
    }
    if (!firstRoom || game.player.stingCharges > 0) {
        items.push({ id: 'sting', value: game.player.stingCharges, title: `${statsText.doubleSting[0]}: ${statsText.doubleSting[1]}`, hudIcon: HUD_ICON_ROWS.sting, sprite: 'stingUpgrade', fallback: '2x', color: '#f28f3b' });
    }
    if (!firstRoom || progression.xp > 0) {
        items.push({ id: 'level', value: getPlayerLevel(), title: `XP ${progression.xp}/${getXpForNextLevel()} - ${currentLanguage === 'es-419' ? 'desbloquea objetos y enemigos gradualmente' : 'gradually unlocks objects and enemies'}`, hudIcon: HUD_ICON_ROWS.level, fallback: 'LV', color: '#fff2a7' });
    }
    if (!firstRoom) {
        items.push({ id: 'room', value: game.roomDepth, title: `${statsText.room[0]}: ${statsText.room[1]}`, hudIcon: HUD_ICON_ROWS.room, icon: 'room', color: '#43aa8b' });
    }
    hudRenderer.renderStats(items);
}

function renderBottomCombatHud() {
    if (!bottomCombatHudNode) return;
    if (game.mode === 'dance' || game.mode === 'menu' || game.ended) {
        bottomCombatHudNode.innerHTML = '';
        bottomCombatHudNode.classList.add('hidden');
        return;
    }

    bottomCombatHudNode.classList.remove('hidden');
    const healthPercent = Math.max(0, Math.min(1, game.player.health / Math.max(1, game.player.maxHealth)));
    const shieldPercent = Math.max(0, Math.min(1, game.player.upgrades / Math.max(1, game.player.maxShield || MAX_SHIELD)));
    const movePercent = Math.max(0, Math.min(1, game.player.movePoints / Math.max(1, game.player.maxMovePoints)));
    const xpNeeded = getXpForNextLevel();
    const xpPercent = Math.max(0, Math.min(1, progression.xp / Math.max(1, xpNeeded)));
    const moveLoss = getPreviewMoveLoss();
    const dangerClass = game.player.health <= Math.max(2, Math.ceil(game.player.maxHealth * 0.3)) ? ' danger' : '';

    bottomCombatHudNode.innerHTML = `
        <div class="combat-orb life-orb${dangerClass}" style="--orb-percent:${healthPercent}; --orb-fill:#d84636" aria-label="${escapeAttr(`${t('stats', 'health')[0]} ${game.player.health}/${game.player.maxHealth}, ${t('stats', 'shield')[0]} ${game.player.upgrades}/${game.player.maxShield}`)}">
            <div class="orb-stack">
                <span class="orb-value">${escapeHtml(game.player.health)}</span>
                <span class="orb-subvalue">+${escapeHtml(game.player.upgrades)} ${currentLanguage === 'es-419' ? 'esc' : 'shd'}</span>
            </div>
            <span class="orb-loss" style="display:${shieldPercent > 0 ? 'grid' : 'none'}">${escapeHtml(game.player.upgrades)}</span>
        </div>
        <div class="xp-hud" style="--xp-percent:${xpPercent}" aria-label="${escapeAttr(`Level ${getPlayerLevel()} XP ${progression.xp}/${xpNeeded}`)}">
            <div class="xp-label">
                <span>${currentLanguage === 'es-419' ? 'Nivel' : 'Level'} ${escapeHtml(getPlayerLevel())}</span>
                <span>${escapeHtml(progression.xp)}/${escapeHtml(xpNeeded)} XP</span>
            </div>
            <div class="xp-track"><div class="xp-fill"></div></div>
        </div>
        <div class="combat-orb move-orb" style="--orb-percent:${movePercent}; --orb-fill:#f5c84b" aria-label="${escapeAttr(`${t('ui', 'stamina')} ${game.player.movePoints}/${game.player.maxMovePoints}`)}">
            <div class="orb-stack">
                <span class="orb-value">${escapeHtml(game.player.movePoints)}</span>
                <span class="orb-subvalue">/${escapeHtml(game.player.maxMovePoints)} ${currentLanguage === 'es-419' ? 'mov' : 'move'}</span>
            </div>
            <span class="orb-loss" style="display:${moveLoss > 0 ? 'grid' : 'none'}">-${escapeHtml(moveLoss)}</span>
        </div>
    `;
}

function getPreviewMoveLoss() {
    const preview = game.pathPreview;
    if (!preview || !preview.path?.length) return 0;
    return Math.max(0, Math.min(game.player.movePoints, preview.reachableLength || 0));
}

function renderTimerHud() {
    if (game.mode === 'dance') {
        hudRenderer.renderTimers([]);
        return;
    }
    const items = [];
    if (!game.player.actionAvailable) {
        items.push({
            id: 'attackCooldown',
            value: '0',
            title: currentLanguage === 'es-419' ? 'Acción usada este turno' : 'Action used this turn',
            hudIcon: HUD_ICON_ROWS.attackCooldown,
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
                    hudIcon: HUD_ICON_ROWS.danger,
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
    const ready = Boolean(game.player.actionAvailable);
    const progress = ready ? 100 : 0;

    cooldownWidget.classList.toggle('ready', ready);
    cooldownWidget.classList.toggle('locked', !ready);
    cooldownWidget.style.setProperty('--cooldown-progress', `${progress}%`);
    cooldownText.textContent = ready ? (currentLanguage === 'es-419' ? 'Acción lista' : 'Action ready') : (currentLanguage === 'es-419' ? 'Acción usada' : 'Action used');
    cooldownHint.textContent = ready ? `${currentLanguage === 'es-419' ? 'Alcance' : 'Range'} ${game.player.attackRange || START_ATTACK_RANGE}` : (currentLanguage === 'es-419' ? 'Termina el turno para recuperar acción' : 'End the turn to refresh action');
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
    if (!isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        const preview = getPathPreview(cell);
        if (preview?.path?.length) {
            if ((preview.reachableLength ?? 0) <= 0) {
                return { available: false, reason: t('ui', 'blockedStamina'), symbol: 'S', color: '#f5c84b' };
            }
            if (preview.deathCell) {
                return {
                    available: false,
                    reason: t('messages', 'pathLethal'),
                    symbol: 'X',
                    color: '#ff4857'
                };
            }
            return {
                available: true,
                reason: preview.complete ? '' : t('ui', 'blockedNotAdjacent'),
                symbol: '>',
                color: preview.complete ? '#f5c84b' : '#ffad42'
            };
        }
        return { available: false, reason: t('ui', 'blockedNotAdjacent'), symbol: 'i', color: '#b8c2aa' };
    }
    if (!cell.revealed && !cell.litByLamp) {
        const canStepIntoMist = cell.object === 'empty' || isFreeWalkoverObject(cell.object);
        return {
            available: canStepIntoMist,
            reason: canStepIntoMist ? '' : t('ui', 'blockedHidden'),
            symbol: '?',
            color: canStepIntoMist ? '#d6c889' : '#b8c2aa'
        };
    }
    const object = cell.object;
    const rule = cellInteractions.getInteractionRule(object);
    if (isEnemyObject(object)) {
        const ready = game.player.actionAvailable && hexDistance(game.player.q, game.player.r, cell.q, cell.r) <= getActionRange(cell);
        return {
            available: ready,
            reason: ready ? '' : (game.player.actionAvailable ? t('ui', 'blockedNotAdjacent') : t('ui', 'blockedGeneric')),
            symbol: '!',
            color: '#ff8a72'
        };
    }
    if (rule.action === 'wall') {
        return {
            available: false,
            reason: OBJECTS.wall?.description || t('ui', 'blockedGeneric'),
            symbol: rule.cursor.symbol,
            color: rule.cursor.color
        };
    }
    if (rule.action === 'waxDoor') {
        const canOpen = game.player.actionAvailable && (game.freeWaxDoorAvailable || game.player.pollen > 0 || game.player.actionAvailable);
        return {
            available: canOpen,
            reason: canOpen ? '' : t('ui', 'blockedWaxDoor'),
            symbol: rule.cursor.symbol,
            color: rule.cursor.color
        };
    }
    if (rule.action === 'crossHazard' || rule.action === 'trade' || rule.role === 'route') {
        return { available: true, symbol: rule.cursor.symbol, color: rule.cursor.color };
    }
    if (isFreeWalkoverObject(object)) {
        const canMove = (game.player.movePoints ?? game.player.stamina) > 0;
        return { available: canMove, reason: canMove ? '' : t('ui', 'blockedStamina'), symbol: rule.cursor.symbol, color: rule.cursor.color };
    }
    return { available: true, symbol: rule.cursor.symbol, color: rule.cursor.color };
}

function updateCursor(cell) {
    canvas.style.cursor = getCursorForCell(cell);
}

function getCursorForCell(cell) {
    if (!cell || game.ended || game.mode === 'relicChoice') return 'default';
    const action = getCellActionState(cell);
    return makeCursor(action.symbol, action.color, action.available);
}

window.HW_TEST_API = {
    areAssetsReady: () => assetLoader.ready,
    getTestObjectEntries: () => getTestObjectEntries().map((entry) => ({ ...entry })),
    startTestScenario: (objectId) => {
        startObjectTestScenario(objectId);
        const target = getCell(1, 0);
        return {
            activeTestObject: game.activeTestObject,
            mode: game.mode,
            isTestScenario: game.isTestScenario,
            targetObject: target?.object || null,
            player: { q: game.player.q, r: game.player.r },
            message: game.message
        };
    },
    getObjectEffectStatCoverage: () => Object.entries(OBJECTS)
        .filter(([, object]) => Array.isArray(object.effects) && object.effects.length > 0)
        .map(([id, object]) => ({
            id,
            effectTypes: object.effects.map((effect) => effect.type),
            statCount: getObjectEffectStats(id).length,
            stats: getObjectEffectStats(id).map((stat) => ({
                kind: stat.kind,
                label: stat.label,
                hudRow: stat.hudRow
            }))
        })),
    getState: () => ({
        mode: game.mode,
        isTestScenario: game.isTestScenario,
        testPaused: game.testPaused,
        activeTestObject: game.activeTestObject,
        cells: game.cells.length,
        cave: game.caveMetadata ? {
            roomCount: game.caveMetadata.roomCount,
            farthestRoomIndex: game.caveMetadata.farthestRoomIndex,
            bossRoom: game.caveMetadata.bossRoom
        } : null,
        roomTemplate: game.roomTemplate,
        dungeonTheme: getCurrentTheme() ? {
            id: getCurrentTheme().id,
            name: getCurrentTheme().name
        } : null,
        equipment: { ...game.equipment },
        entryCell: game.entryCell ? { ...game.entryCell } : null,
        exitCell: game.exitCell ? { ...game.exitCell } : null,
        metrics: JSON.parse(JSON.stringify(game.metrics)),
        player: { ...game.player }
    }),
    getCellPoint: (q, r) => {
        const point = hexToPixel(q, r);
        const rect = canvas.getBoundingClientRect();
        return {
            x: rect.left + point.x,
            y: rect.top + point.y,
            size: point.size
        };
    },
    getObjectCounts: () => game.cells.reduce((acc, cell) => {
        acc[cell.object] = (acc[cell.object] || 0) + 1;
        return acc;
    }, {}),
    getThemeTileDebug: () => {
        const board = layout();
        const environmentCells = getVisibleEnvironmentCells(board);
        const environmentMap = new Map(environmentCells.map((cell) => [cellKey(cell.q, cell.r), cell]));
        const playableKeys = new Set(game.cells.map((cell) => cellKey(cell.q, cell.r)));
        return {
            themeId: getCurrentTheme()?.id || null,
            loadedSheets: Object.keys(themeTileSheetAssets).filter((key) => themeTileSheetAssets[key]),
            meta: JSON.parse(JSON.stringify(themeTileSheetMeta)),
            environmentCells: environmentCells.length,
            playableCells: game.cells.length,
            overlapsPlayable: environmentCells.filter((cell) => playableKeys.has(cellKey(cell.q, cell.r))).length,
            rows: [...new Set(environmentCells.map((cell) => cell.themeTileRow).filter((row) => row != null))],
            blendEdges: environmentCells.reduce((count, cell) => count + HEX_DIRECTIONS.filter((direction) => {
                const neighbor = environmentMap.get(cellKey(cell.q + direction.q, cell.r + direction.r));
                return neighbor && neighbor.themeTileRow != null && neighbor.themeTileRow !== cell.themeTileRow;
            }).length, 0)
        };
    },
    getCells: () => game.cells.map((cell) => ({ ...cell })),
    setDungeonTheme: (themeId) => {
        if (!DUNGEON_THEMES?.[themeId]) return false;
        game.dungeonTheme = DUNGEON_THEMES[themeId];
        applyDungeonTheme();
        draw();
        return true;
    },
    equipItem: (equipmentId) => equipItem(equipmentId),
    getCellObject: (q, r) => getCell(q, r)?.object || null,
    isEnemyObject: (object) => isEnemyObject(object),
    getCellData: (q, r) => {
        const cell = getCell(q, r);
        return cell ? { ...cell } : null;
    },
    setCellObject: (q, r, object, revealed = true) => {
        const cell = getCell(q, r);
        if (!cell) return false;
        cell.object = object;
        cell.revealed = revealed;
        cell.litByLamp = false;
        cell.facingDir = null;
        initializeEnemyFacing(cell);
        cell.visited = false;
        updateLampLightFields();
        draw();
        return true;
    },
    setTacticalState: (state = {}) => {
        if (Number.isFinite(state.movePoints)) game.player.movePoints = state.movePoints;
        if (Number.isFinite(state.maxMovePoints)) game.player.maxMovePoints = state.maxMovePoints;
        if (typeof state.actionAvailable === 'boolean') game.player.actionAvailable = state.actionAvailable;
        game.autoPath = [];
        syncLegacyStamina();
        draw();
    },
    setPlayerPosition: (q, r) => {
        const cell = getCell(q, r);
        if (!cell) return false;
        game.player.q = q;
        game.player.r = r;
        cell.visited = true;
        revealAroundPlayer();
        draw();
        return true;
    },
    moveToCell: (q, r) => {
        const cell = getCell(q, r);
        if (!cell) return false;
        moveTo(cell);
        return true;
    },
    generateRoomAtDepth: (depth) => {
        const nextDepth = Number(depth);
        if (!Number.isFinite(nextDepth) || nextDepth < 1 || nextDepth > FINAL_ROOM) return false;
        game.roomDepth = Math.floor(nextDepth);
        generateRoom('test');
        return true;
    },
    inspectCell: (q, r) => {
        const cell = getCell(q, r);
        if (!cell) return false;
        game.inspectedCell = { q, r };
        game.inspectPinned = true;
        draw();
        return true;
    },
    triggerEnemyTelegraph: (q, r) => {
        const cell = getCell(q, r);
        if (!cell || !isEnemyObject(cell.object)) return false;
        const enemy = getEnemyDef(cell.object);
        const triggered = enemySystem.handleTimedThreat(cell, enemy, performance.now());
        updateLampLightFields();
        draw();
        return triggered;
    },
    openMarketAt: (q, r) => {
        const cell = getCell(q, r);
        if (!cell) return false;
        openTraderMarket(cell);
        return true;
    },
    getPathPreview: () => game.pathPreview ? {
        complete: game.pathPreview.complete,
        length: game.pathPreview.path.length,
        reachableLength: game.pathPreview.reachableLength,
        fullLength: game.pathPreview.fullLength,
        lethal: Boolean(game.pathPreview.deathCell),
        risk: game.pathPreview.risk,
        deathCell: game.pathPreview.deathCell,
        blockedTarget: game.pathPreview.blockedTarget,
        end: game.pathPreview.path.length ? {
            q: game.pathPreview.path[game.pathPreview.path.length - 1].q,
            r: game.pathPreview.path[game.pathPreview.path.length - 1].r
        } : null
    } : null,
    getPathPreviewFor: (q, r) => {
        const cell = getCell(q, r);
        const preview = cell ? getPathPreview(cell) : null;
        return preview ? {
            complete: preview.complete,
            length: preview.path.length,
            reachableLength: preview.reachableLength,
            fullLength: preview.fullLength,
            lethal: Boolean(preview.deathCell),
            risk: preview.risk,
            deathCell: preview.deathCell,
            blockedTarget: preview.blockedTarget,
            end: preview.path.length ? {
                q: preview.path[preview.path.length - 1].q,
                r: preview.path[preview.path.length - 1].r
            } : null
        } : null;
    },
    generateBossRoom: () => generateBossRoom(),
    endRun: (reason = 'final-exit') => endRun(reason)
};

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
    if (cell && game.mode === 'dungeon') {
        game.inspectedCell = { q: cell.q, r: cell.r };
        game.inspectPinned = true;
    }
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
    game.pathPreview = cell && game.mode === 'dungeon' ? getPathPreview(cell) : null;
    game.inspectPinned = false;
    game.inspectedCell = cell ? { q: cell.q, r: cell.r } : null;
    updateCursor(game.hover.cell);
    renderBottomCombatHud();
});

function updateBoardHoverFromClientPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
    const cell = pixelToClosestHex(x, y);
    const previousKey = game.hover?.cell ? cellKey(game.hover.cell.q, game.hover.cell.r) : '';
    const nextKey = cell ? cellKey(cell.q, cell.r) : '';
    game.hover = {
        x,
        y,
        cell,
        startedAt: previousKey === nextKey ? game.hover.startedAt : performance.now()
    };
    game.pathPreview = cell && game.mode === 'dungeon' ? getPathPreview(cell) : null;
    game.inspectPinned = false;
    game.inspectedCell = cell ? { q: cell.q, r: cell.r } : null;
    updateCursor(game.hover.cell);
    renderBottomCombatHud();
    return cell;
}

function forwardHudPointerToBoard(event, shouldClick = false) {
    const cell = updateBoardHoverFromClientPoint(event.clientX, event.clientY);
    if (shouldClick && cell) {
        moveTo(cell);
    }
}

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
    if (!game.inspectPinned) game.inspectedCell = null;
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
testDanceButton.addEventListener('click', openTestMenu);
testBackButton.addEventListener('click', closeTestMenu);
statsToggle.addEventListener('click', () => {
    statsPanel.classList.toggle('open');
    logPanel.classList.remove('open');
});
logToggle.addEventListener('click', () => {
    logPanel.classList.toggle('open');
    statsPanel.classList.remove('open');
});
[statsHudNode, timerHudNode].forEach((node) => {
    node?.addEventListener('mousemove', (event) => forwardHudPointerToBoard(event, false));
    node?.addEventListener('click', (event) => forwardHudPointerToBoard(event, true));
});
optionsButton.addEventListener('click', () => menuController.toggleOptions());
settingsToggle?.addEventListener('click', openSettingsOverlay);
settingsCloseButton?.addEventListener('click', closeSettingsOverlay);
resetProgressionButton?.addEventListener('click', resetBeeProgression);
musicVolumeInput?.addEventListener('input', () => {
    audioSettings.music = Number(musicVolumeInput.value) / 100;
    applyAudioSettings();
    saveAudioSettings();
});
effectsVolumeInput?.addEventListener('input', () => {
    audioSettings.effects = Number(effectsVolumeInput.value) / 100;
    applyAudioSettings();
    saveAudioSettings();
});
languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
menuLanguageSelect.addEventListener('change', () => setLanguage(menuLanguageSelect.value));
themeSelect?.addEventListener('change', () => setDungeonThemePreference(themeSelect.value));
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
testPauseButton.addEventListener('click', toggleTestPause);
testListButton.addEventListener('click', returnToTestList);
testObjectListNode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-test-object]');
    if (button) {
        startObjectTestScenario(button.dataset.testObject);
    }
});
window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    if (settingsScreen?.classList.contains('visible')) {
        closeSettingsOverlay();
        return;
    }
    if (!startScreen.classList.contains('hidden') || game.ended || game.replay) return;
    event.preventDefault();
    openSettingsOverlay();
});
window.addEventListener('resize', resizeCanvas);

setLanguage(currentLanguage);
setDungeonThemePreference(selectedThemeId);
applyAudioSettings();
renderStats();
renderRelics();
resizeCanvas();
requestAnimationFrame(animate);

