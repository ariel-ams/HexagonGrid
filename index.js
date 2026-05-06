const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statsNode = document.getElementById('stats');
const logListNode = document.getElementById('logList');
const turnTextNode = document.getElementById('turnText');
const restartButton = document.getElementById('restartButton');
const cooldownWidget = document.getElementById('cooldownWidget');
const cooldownText = document.getElementById('cooldownText');
const cooldownHint = document.getElementById('cooldownHint');
const startScreen = document.getElementById('startScreen');
const newRunButton = document.getElementById('newRunButton');
const testDanceButton = document.getElementById('testDanceButton');
const relicScreen = document.getElementById('relicScreen');
const relicChoicesNode = document.getElementById('relicChoices');
const relicListNode = document.getElementById('relicList');
const endScreen = document.getElementById('endScreen');
const endStatsNode = document.getElementById('endStats');
const endRestartButton = document.getElementById('endRestartButton');
const endMenuButton = document.getElementById('endMenuButton');

const HEX_RADIUS = 4;
const VISIBLE_RADIUS = 4;
const DUNGEON_CELL_TARGET = 154;
const FINAL_ROOM = 5;
const BAT_ATTACK_MS = 1000;
const BAT_ATTACK_DAMAGE = 6;
const WASP_AURA_MS = 500;
const WASP_AURA_DAMAGE = 3;
const VINE_DAMAGE = 2;
const DANCE_MOVES_REQUIRED = 12;
const DANCE_ARROW_MS = 1000;
const DANCE_HOLD_MS = 1000;
const DANCE_SEQUENCE_LENGTH = 3;
const DANCE_MULTI_MAX_CLICKS = 5;
const DANCE_MAX_MISSES = 3;
const HEX_DIRECTIONS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
];

const RELICS = [
    {
        id: 'waxArmor',
        name: 'Wax Armor',
        description: 'Gain +4 shield at the start of each room.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => addShield(4, 'Wax Armor')
    },
    {
        id: 'sharpStinger',
        name: 'Sharp Stinger',
        description: 'The first sting in each room has no cooldown.',
        minDepth: 1,
        rarity: 'common',
        apply: () => {
            game.roomFirstStingAvailable = true;
        },
        onRoomStart: () => {
            game.roomFirstStingAvailable = true;
        }
    },
    {
        id: 'goldenAntennae',
        name: 'Golden Antennae',
        description: 'The exit direction is revealed through the mist.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => revealExitHint()
    },
    {
        id: 'royalJelly',
        name: 'Royal Jelly',
        description: 'Every 3 pollen collected heals +3 health.',
        minDepth: 1,
        rarity: 'common'
    },
    {
        id: 'mistpiercerWings',
        name: 'Mistpiercer Wings',
        description: 'Reveal radius increases from 2 to 3.',
        minDepth: 1,
        rarity: 'common',
        apply: () => {
            game.revealRadius = 3;
            revealAroundPlayer();
        }
    },
    {
        id: 'storedVenom',
        name: 'Stored Venom',
        description: 'Start each room with +1 Double Sting.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => {
            game.player.stingCharges += 1;
            addLog('Stored Venom', 'Gained +1 Double Sting.');
        }
    }
];

const SPRITE_DEFS = {
    playerIdle: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 0, frameMs: 180 },
    playerAttack: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 1, frameMs: 120 },
    enemy: { src: 'assets/wasp-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 180 },
    bat: { src: 'assets/bat-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    npc: { src: 'assets/bettle-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    pollen: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    water: { src: 'assets/water_drop-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    upgrade: { src: 'assets/shield-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    stingUpgrade: { src: 'assets/sting-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    vine: { src: 'assets/vines-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    entry: { src: 'assets/entry-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    exit: { src: 'assets/exit-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    finalExit: { src: 'assets/exit-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 140 }
};

const spriteAssets = {};
let spriteFrames = {};
let spritesReady = false;
loadSprites();

const OBJECTS = {
    empty: {
        name: 'Open Cell',
        color: '#3c544d',
        description: 'Move here safely.'
    },
    enemy: {
        name: 'Wasp',
        color: '#d95c50',
        description: 'Costs health.'
    },
    bat: {
        name: 'Bat',
        color: '#8b6bd6',
        description: 'Moves toward you.'
    },
    npc: {
        name: 'Trade Beetle',
        color: '#64b5f6',
        description: 'Reduces sting cooldown.'
    },
    upgrade: {
        name: 'Shield Upgrade',
        color: '#b787f4',
        description: 'Improves your scout.'
    },
    stingUpgrade: {
        name: 'Double Sting',
        color: '#f28f3b',
        description: 'One-use stronger sting.'
    },
    pollen: {
        name: 'Pollen',
        color: '#5fc77e',
        description: 'Adds pollen.'
    },
    water: {
        name: 'Water',
        color: '#4bb6f2',
        description: 'Adds water.'
    },
    vine: {
        name: 'Vines',
        color: '#547b3d',
        description: 'Persistent thorny hazard.'
    },
    entry: {
        name: 'Entry',
        color: '#45b17a',
        description: 'Return to the previous room.'
    },
    exit: {
        name: 'Exit',
        color: '#f2bd4b',
        description: 'Open the next room.'
    },
    finalExit: {
        name: 'Final Exit',
        color: '#fff2a7',
        description: 'End the run.'
    }
};

const game = {
    cells: [],
    logs: [],
    roomStack: [],
    roomDepth: 1,
    entryCell: null,
    exitCell: null,
    statPopups: [],
    runStartedAt: 0,
    ended: false,
    mode: 'dungeon',
    dance: null,
    playerMotion: null,
    relics: [],
    relicChoices: [],
    pendingNextRoomReason: null,
    revealRadius: 2,
    roomFirstStingAvailable: false,
    royalJellyPollen: 0,
    currentRoomCells: [],
    runStats: {
        kills: 0,
        pollen: 0,
        water: 0
    },
    player: {
        q: 0,
        r: 0,
        health: 100,
        pollen: 0,
        water: 0,
        upgrades: 0,
        stingCharges: 0,
        batHits: 0,
        steps: 0,
        attackCooldownMs: 3000,
        attackReadyAt: 0,
        attackAnimationUntil: 0
    },
    message: 'The scout starts at the center. Click a glowing neighbor to move.'
};

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

    const distance = hexDistance(entryCell.q, entryCell.r, q, r);
    const roll = Math.random();

    if (distance === 1 && roll < 0.28) return 'pollen';
    if (distance === 1 && roll < 0.50) return 'water';
    if (distance <= 1 && roll < 0.45) return 'empty';
    if (roll < 0.15) return 'enemy';
    if (roll < 0.29) return 'npc';
    if (roll < 0.40) return 'upgrade';
    if (roll < 0.48) return 'stingUpgrade';
    if (roll < 0.60) return 'vine';
    if (roll < 0.72) return 'pollen';
    if (roll < 0.84) return 'water';
    return 'empty';
}

function createGrid() {
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
    game.dance = null;
    game.playerMotion = null;
    game.relics = [];
    game.relicChoices = [];
    game.pendingNextRoomReason = null;
    game.revealRadius = 2;
    game.roomFirstStingAvailable = false;
    game.royalJellyPollen = 0;
    game.currentRoomCells = [];
    game.runStats = {
        kills: 0,
        pollen: 0,
        water: 0
    };
    game.player = createFreshPlayer();
    relicScreen.classList.remove('visible');
    endScreen.classList.remove('visible');
    renderRelics();
}

function testDanceRun() {
    startScreen.classList.add('hidden');
    startRunState();
    game.roomDepth = FINAL_ROOM;
    generateDanceRoom();
}

function showMainMenu() {
    game.ended = true;
    game.mode = 'menu';
    game.dance = null;
    game.playerMotion = null;
    relicScreen.classList.remove('visible');
    endScreen.classList.remove('visible');
    startScreen.classList.remove('hidden');
    renderMessage();
}

function createFreshPlayer() {
    return {
        q: 0,
        r: 0,
        health: 100,
        pollen: 0,
        water: 0,
        upgrades: 0,
        stingCharges: 0,
        batHits: 0,
        steps: 0,
        attackCooldownMs: 3000,
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
    game.currentRoomCells = generateCaveBlob(DUNGEON_CELL_TARGET);
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

    placeBats();
    const startCell = getCell(game.player.q, game.player.r);
    if (startCell) startCell.visited = true;
    runRelicHook('onRoomStart');
    revealAroundPlayer();

    if (reason === 'restart') {
        addLog('Start', 'Scout the dungeon, manage sting cooldown, and use exits to crawl deeper.');
    } else {
        addLog('Exit', `Entered chamber ${game.roomDepth}.`);
    }
    draw();
}

function generateCaveBlob(targetCount) {
    const cells = new Map();
    const frontier = [{ q: 0, r: 0 }];
    cells.set(cellKey(0, 0), { q: 0, r: 0 });

    while (cells.size < targetCount) {
        const origin = randomFrom(frontier);
        const shuffled = [...HEX_DIRECTIONS].sort(() => Math.random() - 0.5);

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

            if (Math.random() < acceptance) {
                const cell = { q, r };
                cells.set(key, cell);
                frontier.push(cell);
            }
        });

        if (Math.random() < 0.12) {
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
    return items[Math.floor(Math.random() * items.length)];
}

function placeBats() {
    const batCount = Math.random() < 0.5 ? 1 : 2;
    const candidates = game.cells.filter((cell) => (
        cell.object === 'empty'
        && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 2
        && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 1
    ));

    for (let i = 0; i < batCount && candidates.length; i++) {
        const index = Math.floor(Math.random() * candidates.length);
        const [cell] = candidates.splice(index, 1);
        cell.object = 'bat';
        cell.nextAttackAt = 0;
        cell.hits = 0;
    }
}

function revealAroundPlayer() {
    game.cells.forEach((cell) => {
        if (hexDistance(game.player.q, game.player.r, cell.q, cell.r) <= game.revealRadius) {
            cell.revealed = true;
        }
    });
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
}

function openRelicChoice() {
    game.mode = 'relicChoice';
    game.pendingNextRoomReason = 'exit';
    game.relicChoices = chooseRelicRewards();
    game.message = 'Choose a relic before entering the next chamber.';
    renderRelicChoices();
    relicScreen.classList.add('visible');
    draw();
}

function chooseRelicRewards() {
    const available = RELICS.filter((relic) => (
        relic.minDepth <= game.roomDepth && !hasRelic(relic.id)
    ));
    const pool = available.length >= 3 ? available : RELICS.filter((relic) => relic.minDepth <= game.roomDepth);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

function renderRelicChoices() {
    relicChoicesNode.innerHTML = game.relicChoices.map((relic) => (
        `<button class="relic-card" type="button" data-relic-id="${relic.id}">
            <strong>${relic.name}</strong>
            <span>${relic.description}</span>
        </button>`
    )).join('');
}

function chooseRelic(id) {
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
        relicListNode.innerHTML = '<span class="relic-empty">None yet</span>';
        return;
    }
    relicListNode.innerHTML = game.relics.map((id) => {
        const relic = getRelic(id);
        return `<span class="relic-chip">${relic?.name || id}</span>`;
    }).join('');
}

function generateDanceRoom() {
    game.mode = 'dance';
    game.playerMotion = null;
    game.cells = [];
    game.statPopups = [];
    game.entryCell = null;
    game.exitCell = null;
    game.message = 'Final dance: follow the arrows to reveal the good stuff.';

    for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q++) {
        const rMin = Math.max(-HEX_RADIUS, -q - HEX_RADIUS);
        const rMax = Math.min(HEX_RADIUS, -q + HEX_RADIUS);

        for (let r = rMin; r <= rMax; r++) {
            game.cells.push({
                q,
                r,
                object: 'empty',
                visited: false,
                nextAttackAt: 0,
                nextAuraAt: 0,
                hits: 0
            });
        }
    }

    const start = randomFrom(game.cells);
    game.player.q = start.q;
    game.player.r = start.r;
    start.visited = true;
    game.dance = {
        completed: 0,
        misses: 0,
        move: null,
        active: null,
        holding: false,
        lastType: null
    };
    addLog('Final Dance', 'Follow 12 arrows. Miss 3 and the path is lost.');
    spawnDanceMove();
    draw();
}

function spawnDanceMove() {
    if (!game.dance || game.ended) return;

    const types = ['fastSequence', 'hold', 'multiClick', 'spreadSequence'];
    const options = types.filter((type) => type !== game.dance.lastType);
    const type = randomFrom(options);
    game.dance.lastType = type;
    game.dance.holding = false;

    if (type === 'fastSequence') {
        game.dance.move = {
            type,
            label: 'Fast 3-step',
            steps: buildAdjacentSequence(game.player.q, game.player.r, DANCE_SEQUENCE_LENGTH),
            index: 0
        };
        activateDanceStep();
        return;
    }

    if (type === 'hold') {
        const step = randomAdjacentStep(game.player.q, game.player.r);
        game.dance.move = {
            type,
            label: 'Hold',
            steps: [step],
            index: 0
        };
        activateDanceStep();
        return;
    }

    if (type === 'multiClick') {
        const step = randomAdjacentStep(game.player.q, game.player.r);
        const clicks = 2 + Math.floor(Math.random() * (DANCE_MULTI_MAX_CLICKS - 1));
        game.dance.move = {
            type,
            label: 'Multi-click',
            steps: [step],
            index: 0,
            clicksLeft: clicks
        };
        activateDanceStep();
        return;
    }

    const spread = buildSpreadSequence();
    game.dance.move = {
        type,
        label: 'Spread path',
        steps: spread.steps,
        index: 0,
        finalStep: spread.finalStep
    };
    activateDanceStep();
}

function activateDanceStep() {
    const move = game.dance?.move;
    if (!move) {
        spawnDanceMove();
        return;
    }

    const next = move.steps[move.index];
    if (!next) {
        completeDanceMove();
        return;
    }

    game.dance.active = {
        q: next.q,
        r: next.r,
        directionIndex: next.directionIndex,
        expiresAt: performance.now() + DANCE_ARROW_MS,
        holdStartedAt: 0
    };
    game.dance.holding = false;
}

function buildAdjacentSequence(startQ, startR, length) {
    const sequence = [];
    let cursor = { q: startQ, r: startR };

    for (let i = 0; i < length; i++) {
        const next = randomAdjacentStep(cursor.q, cursor.r);
        sequence.push(next);
        cursor = next;
    }

    return sequence;
}

function randomAdjacentStep(q, r) {
    const options = HEX_DIRECTIONS
        .map((direction, index) => ({
            q: q + direction.q,
            r: r + direction.r,
            directionIndex: index
        }))
        .filter((step) => getCell(step.q, step.r));

    return randomFrom(options);
}

function buildSpreadSequence() {
    const distantCells = game.cells
        .filter((cell) => hexDistance(game.player.q, game.player.r, cell.q, cell.r) >= 3)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map((cell) => ({
            q: cell.q,
            r: cell.r,
            directionIndex: directionIndexToward(game.player.q, game.player.r, cell.q, cell.r)
        }));
    const finalStep = randomAdjacentStep(game.player.q, game.player.r);

    return {
        steps: [...distantCells, finalStep],
        finalStep
    };
}

function directionIndexToward(fromQ, fromR, toQ, toR) {
    return HEX_DIRECTIONS
        .map((direction, index) => ({
            index,
            distance: hexDistance(fromQ + direction.q, fromR + direction.r, toQ, toR)
        }))
        .sort((a, b) => a.distance - b.distance)[0].index;
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
        originX: rect.width / 2 - cameraPixel.x,
        originY: rect.height / 2 - cameraPixel.y
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
    if (game.mode === 'dance') {
        updateDanceArrow();
    } else if (game.mode === 'dungeon') {
        updateEnemyAuras();
        updateBatAttacks();
    }

    const board = layout();
    ctx.clearRect(0, 0, board.width, board.height);
    drawBackground(board);

    game.cells.forEach(drawCell);
    if (game.mode === 'dance') {
        drawDanceArrow();
    }
    drawPlayer();
    drawStatPopups();
    renderStats();
    renderCooldown();
    renderMessage();
}

function animate() {
    draw();
    requestAnimationFrame(animate);
}

function drawBackground(board) {
    ctx.fillStyle = '#16211c';
    ctx.fillRect(0, 0, board.width, board.height);

    if (game.mode === 'dance') {
        drawDiscoFloor(board);
    }

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#f5c84b';
    ctx.lineWidth = 1;
    for (let x = -80; x < board.width + 80; x += 84) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 180, board.height);
        ctx.stroke();
    }
    ctx.restore();
}

function drawDiscoFloor(board) {
    const now = performance.now();
    const colors = ['#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#4d96ff', '#b66dff'];

    game.cells.forEach((cell, index) => {
        const { x, y, size } = hexToPixel(cell.q, cell.r);
        const pulse = (Math.sin(now / 180 + index * 0.9) + 1) / 2;
        drawHexPath(x, y, size - 4);
        ctx.fillStyle = colors[(index + Math.floor(now / 260)) % colors.length];
        ctx.globalAlpha = 0.16 + pulse * 0.16;
        ctx.fill();
    });

    ctx.globalAlpha = 1;
}

function drawCell(cell) {
    const isPlayer = cell.q === game.player.q && cell.r === game.player.r;
    const canMove = game.mode !== 'dance' && !isPlayer && isAdjacent(game.player.q, game.player.r, cell.q, cell.r);
    const { x, y, size } = hexToPixel(cell.q, cell.r);
    const object = OBJECTS[cell.object];
    const hidden = game.mode !== 'dance' && !cell.revealed;

    drawHexPath(x, y, size - 2);
    ctx.fillStyle = hidden ? '#17211d' : cell.visited ? shade(object.color, -18) : object.color;
    ctx.globalAlpha = hidden ? 0.96 : game.mode === 'dance'
        ? (cell.visited ? 0.54 : 0.34)
        : (cell.visited ? 0.78 : 0.96);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.lineWidth = canMove ? 4 : 1.5;
    ctx.strokeStyle = canMove ? '#fff2a7' : 'rgba(243, 240, 223, 0.32)';
    ctx.stroke();

    if (canMove) {
        drawHexPath(x, y, size - 8);
        ctx.strokeStyle = 'rgba(255, 242, 167, 0.48)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    if (!hidden && cell.object !== 'empty') {
        drawSprite(cell.object, x, y, size);
    }

    if (!hidden && cell.object === 'bat') {
        drawBatAttackTimer(cell, x, y, size);
    }

    if (!hidden && cell.object === 'enemy') {
        drawWaspAuraTimer(cell, x, y, size);
    }

    if (hidden) {
        drawMist(x, y, size);
    }
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

function drawDanceArrow() {
    if (!game.dance?.active) return;

    const active = game.dance.active;
    const move = game.dance.move;
    const target = hexToPixel(active.q, active.r);
    const color = getDirectionColor(active.directionIndex);
    const remaining = Math.max(0, active.expiresAt - performance.now());
    const holdProgress = active.holdStartedAt
        ? Math.min(1, (performance.now() - active.holdStartedAt) / DANCE_HOLD_MS)
        : 0;
    const timeoutProgress = remaining / DANCE_ARROW_MS;
    const angle = getDirectionAngle(active.directionIndex);

    drawDancePreviewArrows();

    drawHexPath(target.x, target.y, target.size - 7);
    ctx.fillStyle = `${color}44`;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(17, 22, 19, 0.86)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(target.size * 0.34, 0);
    ctx.lineTo(-target.size * 0.12, -target.size * 0.24);
    ctx.lineTo(-target.size * 0.05, -target.size * 0.08);
    ctx.lineTo(-target.size * 0.36, -target.size * 0.08);
    ctx.lineTo(-target.size * 0.36, target.size * 0.08);
    ctx.lineTo(-target.size * 0.05, target.size * 0.08);
    ctx.lineTo(-target.size * 0.12, target.size * 0.24);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
        target.x,
        target.y,
        target.size * 0.54,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * (active.holdStartedAt ? holdProgress : timeoutProgress)
    );
    ctx.stroke();
    ctx.restore();

    if (move?.type === 'multiClick') {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(17, 22, 19, 0.9)';
        ctx.lineWidth = 5;
        ctx.font = `800 ${Math.round(target.size * 0.42)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(String(move.clicksLeft), target.x, target.y);
        ctx.fillText(String(move.clicksLeft), target.x, target.y);
        ctx.restore();
    }

    drawDanceStepReference(target, move, active, color);
}

function drawDanceStepReference(target, move, active, color) {
    const label = getDanceStepLabel(move);
    if (!label) return;

    const holdProgress = active.holdStartedAt
        ? Math.min(1, (performance.now() - active.holdStartedAt) / DANCE_HOLD_MS)
        : 0;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(target.size * 1.28, 86);
    const height = 26;
    const x = Math.max(8, Math.min(target.x - width / 2, rect.width - width - 8));
    const y = Math.max(8, Math.min(target.y - target.size * 0.95, rect.height - height - 8));
    const centerX = x + width / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(17, 22, 19, 0.88)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 7);
    ctx.fill();
    ctx.stroke();

    if (move?.type === 'hold') {
        ctx.fillStyle = `${color}88`;
        ctx.fillRect(x + 4, y + height - 6, (width - 8) * holdProgress, 3);
    }

    ctx.fillStyle = '#f3f0df';
    ctx.font = '800 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, y + height / 2 - 1);
    ctx.restore();
}

function getDanceStepLabel(move) {
    if (!move) return '';
    if (move.type === 'hold') return 'HOLD';
    if (move.type === 'multiClick') return `CLICK x${move.clicksLeft}`;
    if (move.type === 'fastSequence') return 'CLICK FAST';
    if (move.type === 'spreadSequence') return 'CLICK PATH';
    return 'CLICK';
}

function drawDancePreviewArrows() {
    const move = game.dance?.move;
    if (!move?.steps?.length) return;

    move.steps.slice(move.index + 1).forEach((step, index) => {
        const point = hexToPixel(step.q, step.r);
        const color = getDirectionColor(step.directionIndex);
        const angle = getDirectionAngle(step.directionIndex);

        ctx.save();
        ctx.globalAlpha = move.type === 'spreadSequence' ? 0.46 : index === 0 ? 0.38 : 0.22;
        ctx.translate(point.x, point.y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(point.size * 0.22, 0);
        ctx.lineTo(-point.size * 0.12, -point.size * 0.16);
        ctx.lineTo(-point.size * 0.12, point.size * 0.16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    });
}

function getDirectionColor(index) {
    return ['#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#4d96ff', '#b66dff'][index];
}

function getDirectionAngle(index) {
    const direction = HEX_DIRECTIONS[index];
    return Math.atan2(direction.r * 1.5, Math.sqrt(3) * (direction.q + direction.r / 2));
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
    let loaded = 0;

    entries.forEach(([key, definition]) => {
        const image = new Image();
        spriteAssets[key] = image;
        image.onload = () => {
            loaded += 1;
            if (loaded === entries.length) {
                spriteFrames = buildSpriteFrames();
                spritesReady = true;
                draw();
            }
        };
        image.onerror = () => {
            loaded += 1;
            if (loaded === entries.length) {
                spriteFrames = buildSpriteFrames();
                spritesReady = true;
                draw();
            }
        };
        image.src = definition.src;
    });
}

function buildSpriteFrames() {
    const frames = {};
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });

    Object.entries(SPRITE_DEFS).forEach(([key, definition]) => {
        const image = spriteAssets[key];
        if (!image || !image.naturalWidth || !image.naturalHeight) {
            frames[key] = [];
            return;
        }

        frames[key] = [];

        for (let column = 0; column < definition.columns; column++) {
            const sourceX = Math.round(column * image.naturalWidth / definition.columns);
            const nextSourceX = Math.round((column + 1) * image.naturalWidth / definition.columns);
            const sourceY = Math.round(definition.row * image.naturalHeight / definition.rows);
            const nextSourceY = Math.round((definition.row + 1) * image.naturalHeight / definition.rows);
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

            const imageData = analysisCtx.getImageData(0, 0, sourceWidth, sourceHeight).data;
            const bounds = findAlphaBounds(imageData, sourceWidth, sourceHeight);

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

function drawSprite(type, x, y, size) {
    const spriteKey = type === 'player'
        ? (performance.now() < game.player.attackAnimationUntil ? 'playerAttack' : 'playerIdle')
        : type;
    const definition = SPRITE_DEFS[spriteKey];
    const image = spriteAssets[spriteKey];

    if (!spritesReady || !definition || !image || !spriteFrames[spriteKey]?.length) {
        drawTokenFallback(type, x, y, size);
        return;
    }

    const frame = Math.floor(performance.now() / definition.frameMs) % definition.columns;
    const spriteFrame = spriteFrames[spriteKey][frame];
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
        x - drawWidth / 2,
        y - drawHeight / 2 + bob,
        drawWidth,
        drawHeight
    );
    ctx.restore();
}

function drawTokenFallback(type, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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
    if (!isAdjacent(cell.q, cell.r, game.player.q, game.player.r) || game.player.health <= 0) {
        return;
    }

    const now = performance.now();
    const remaining = Math.max(0, cell.nextAuraAt - now);
    const progress = 1 - remaining / WASP_AURA_MS;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(249, 65, 68, 0.92)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.restore();
}

function drawPlayer() {
    const position = getPlayerDrawPosition();
    const { x, y, size } = position;

    if (spritesReady) {
        drawSprite('player', x, y, size * 1.1);
        drawPlayerCooldownOverlay(x, y, size);
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
        return current;
    }

    const progress = Math.min(1, (performance.now() - motion.startedAt) / motion.duration);
    const eased = 1 - Math.pow(1 - progress, 3);

    if (progress >= 1) {
        game.playerMotion = null;
        return current;
    }

    const from = hexToPixel(motion.fromQ, motion.fromR);
    const to = hexToPixel(motion.toQ, motion.toR);
    return {
        x: from.x + (to.x - from.x) * eased,
        y: from.y + (to.y - from.y) * eased,
        size: current.size
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
        if (popup.icon === 'heart') {
            drawHeartIcon(iconX, textY, 11, popup.color);
        } else if (popup.icon === 'shield') {
            drawShieldIcon(iconX, textY, 12, popup.color);
        }
        ctx.strokeText(popup.label, popup.x, textY);
        ctx.fillText(popup.label, popup.x, textY);
        ctx.restore();
    });
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
    if (game.ended || !cell || game.player.health <= 0) {
        return;
    }

    if (game.mode === 'dance') {
        handleDanceClick(cell);
        return;
    }

    if (game.mode !== 'dungeon') {
        return;
    }

    if (!isAdjacent(game.player.q, game.player.r, cell.q, cell.r)) {
        return;
    }

    const targetObject = cell.object;
    if ((targetObject === 'enemy' || targetObject === 'bat') && getAttackCooldownRemaining() > 0) {
        const seconds = (getAttackCooldownRemaining() / 1000).toFixed(1);
        game.message = `Sting is cooling down. Wait ${seconds}s before attacking.`;
        addLog('Sting Cooldown', game.message);
        return;
    }

    const previousPosition = { q: game.player.q, r: game.player.r };
    game.player.q = cell.q;
    game.player.r = cell.r;
    startPlayerMotion(previousPosition.q, previousPosition.r, cell.q, cell.r);
    game.player.steps += 1;
    cell.visited = true;

    if (targetObject === 'exit') {
        game.roomStack.push(createRoomSnapshot());
        openRelicChoice();
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

    const interaction = resolveInteraction(targetObject, cell);
    game.message = interaction.message;
    addLog(OBJECTS[targetObject].name, interaction.message);
    addStatPopups(cell.q, cell.r, interaction.deltas);
    if (targetObject === 'bat' && !interaction.consume) {
        game.player.q = previousPosition.q;
        game.player.r = previousPosition.r;
        game.playerMotion = null;
        game.player.steps -= 1;
    }
    revealAroundPlayer();
    if (interaction.consume) {
        cell.object = 'empty';
    }
    moveBats();
    draw();
}

function handleDanceClick(cell) {
    return;
}

function startDanceHold(cell) {
    const active = game.dance?.active;
    const move = game.dance?.move;
    if (!active) return;

    if (cell.q !== active.q || cell.r !== active.r) {
        registerDanceMiss('Wrong arrow.');
        return;
    }

    if (move.type === 'hold') {
        active.holdStartedAt = performance.now();
        game.dance.holding = true;
        return;
    }

    if (move.type === 'multiClick') {
        move.clicksLeft -= 1;
        active.expiresAt = performance.now() + DANCE_ARROW_MS;
        if (move.clicksLeft <= 0) {
            completeDanceStep();
        }
        return;
    }

    completeDanceStep();
}

function endDanceHold() {
    const active = game.dance?.active;
    const move = game.dance?.move;
    if (!active?.holdStartedAt || game.ended) return;
    if (move?.type !== 'hold') return;

    registerDanceMiss('Released too early.');
}

function completeDanceStep() {
    const active = game.dance?.active;
    if (!active) return;

    const cell = getCell(active.q, active.r);
    if (!cell) return;

    const previousPosition = { q: game.player.q, r: game.player.r };
    game.player.q = cell.q;
    game.player.r = cell.r;
    startPlayerMotion(previousPosition.q, previousPosition.r, cell.q, cell.r);
    cell.visited = true;
    game.player.steps += 1;
    game.dance.move.index += 1;

    if (game.dance.move.index >= game.dance.move.steps.length) {
        completeDanceMove();
        return;
    }

    activateDanceStep();
}

function completeDanceMove() {
    game.dance.completed += 1;
    game.message = `Dance move ${game.dance.completed}/${DANCE_MOVES_REQUIRED}: ${game.dance.move.label}.`;
    addLog('Dance Move', game.message);

    if (game.dance.completed >= DANCE_MOVES_REQUIRED) {
        endRun('dance-complete');
        return;
    }

    spawnDanceMove();
}

function updateDanceArrow() {
    if (!game.dance?.active || game.ended) return;

    const active = game.dance.active;
    if (game.dance.move?.type === 'hold' && active.holdStartedAt && performance.now() - active.holdStartedAt >= DANCE_HOLD_MS) {
        completeDanceStep();
        return;
    }

    if (game.dance.move?.type !== 'hold' && performance.now() >= active.expiresAt) {
        registerDanceMiss('Arrow missed.');
    }
}

function registerDanceMiss(reason) {
    if (!game.dance || game.ended) return;

    game.dance.misses += 1;
    game.message = `${reason} Miss ${game.dance.misses}/${DANCE_MAX_MISSES}.`;
    addLog('Dance Miss', game.message);

    if (game.dance.misses >= DANCE_MAX_MISSES) {
        endRun('dance-failed');
        return;
    }

    spawnDanceMove();
}

function resolveInteraction(object, cell) {
    if (object === 'enemy' || object === 'bat') {
        if (game.roomFirstStingAvailable) {
            game.roomFirstStingAvailable = false;
            game.player.attackReadyAt = performance.now();
        } else {
            game.player.attackReadyAt = performance.now() + game.player.attackCooldownMs;
        }
        game.player.attackAnimationUntil = performance.now() + 520;
        const usesDoubleSting = object === 'bat' && game.player.stingCharges > 0;
        const hitPower = usesDoubleSting ? 2 : 1;
        const batKilled = object === 'bat' && (cell.hits || 0) + hitPower >= 2;
        if (object === 'bat') {
            cell.hits = (cell.hits || 0) + hitPower;
            cell.nextAttackAt = 0;
            if (usesDoubleSting) {
                game.player.stingCharges -= 1;
            }
        }
        if (object === 'enemy' || batKilled) {
            game.runStats.kills += 1;
        }
        return {
            message: object === 'bat' && !batKilled
                ? `Bat hit ${cell.hits}/2. It is still flying.`
                : object === 'bat' && usesDoubleSting
                ? 'Double sting defeated the bat.'
                : `${OBJECTS[object].name} defeated.`,
            deltas: usesDoubleSting ? [{ stat: 'stingCharges', amount: -1 }] : [],
            consume: object === 'enemy' || batKilled
        };
    }

    if (object === 'npc') {
        if (game.player.pollen > 0 && game.player.water > 0) {
            game.player.pollen -= 1;
            game.player.water -= 1;
            game.player.attackCooldownMs = Math.max(800, game.player.attackCooldownMs - 100);
            if (getAttackCooldownRemaining() > 0) {
                game.player.attackReadyAt = Math.max(performance.now(), game.player.attackReadyAt - 100);
            }
            return {
                message: 'Trade beetle tuned your sting. Cooldown reduced by 0.1s.',
                deltas: [
                    { stat: 'pollen', amount: -1 },
                    { stat: 'water', amount: -1 },
                    { stat: 'cooldown', amount: -0.1 }
                ],
                consume: true
            };
        }
        return {
            message: 'Trade beetle needs 1 pollen and 1 water to reduce sting cooldown.',
            deltas: [],
            consume: true
        };
    }

    if (object === 'upgrade') {
        game.player.upgrades += 8;
        return {
            message: 'Shield upgrade collected. Added 8 shield.',
            deltas: [{ stat: 'upgrades', amount: 8 }],
            consume: true
        };
    }

    if (object === 'stingUpgrade') {
        game.player.stingCharges += 1;
        return {
            message: 'Double sting stored. It will be used before regular sting.',
            deltas: [{ stat: 'stingCharges', amount: 1 }],
            consume: true
        };
    }

    if (object === 'pollen') {
        game.player.pollen += 1;
        game.runStats.pollen += 1;
        const deltas = [{ stat: 'pollen', amount: 1 }];
        let message = 'Collected a pollen bundle.';
        if (hasRelic('royalJelly')) {
            game.royalJellyPollen += 1;
            if (game.royalJellyPollen >= 3) {
                game.royalJellyPollen = 0;
                const previousHealth = game.player.health;
                game.player.health = Math.min(100, game.player.health + 3);
                const healthDelta = game.player.health - previousHealth;
                if (healthDelta > 0) {
                    deltas.push({ stat: 'health', amount: healthDelta });
                    message = 'Collected pollen. Royal Jelly healed the bee.';
                }
            }
        }
        return {
            message,
            deltas,
            consume: true
        };
    }

    if (object === 'water') {
        const previousHealth = game.player.health;
        game.player.water += 1;
        game.runStats.water += 1;
        game.player.health = Math.min(100, game.player.health + 4);
        const healthDelta = game.player.health - previousHealth;
        const deltas = [{ stat: 'water', amount: 1 }];
        if (healthDelta > 0) {
            deltas.push({ stat: 'health', amount: healthDelta });
        }
        return {
            message: healthDelta > 0
                ? 'Collected a water drop and recovered a little health.'
                : 'Collected a water drop.',
            deltas,
            consume: true
        };
    }

    return {
        message: 'Moved to an open cell.',
        deltas: [],
        consume: false
    };
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
    const bats = game.cells.filter((cell) => cell.object === 'bat');
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
            plannedMoves.push({ from: bat, to: best.cell });
        }
    });

    plannedMoves.forEach((move) => {
        move.from.object = 'empty';
        move.from.nextAttackAt = 0;
        move.to.object = 'bat';
        move.to.nextAttackAt = 0;
    });

    if (plannedMoves.length) {
        addLog('Bat Movement', `${plannedMoves.length} bat${plannedMoves.length === 1 ? '' : 's'} moved closer.`);
    }
}

function updateBatAttacks() {
    if (game.ended || game.player.health <= 0) return;

    const now = performance.now();
    game.cells
        .filter((cell) => cell.object === 'bat')
        .forEach((bat) => {
            if (!isAdjacent(bat.q, bat.r, game.player.q, game.player.r)) {
                bat.nextAttackAt = 0;
                return;
            }

            if (!bat.nextAttackAt) {
                bat.nextAttackAt = now + BAT_ATTACK_MS;
                return;
            }

            if (now >= bat.nextAttackAt) {
                applyDamage(BAT_ATTACK_DAMAGE, bat.q, bat.r, 'Bat Bite');
                addLog('Bat Bite', `A nearby bat hit you for ${BAT_ATTACK_DAMAGE} health.`);
                bat.nextAttackAt = now + BAT_ATTACK_MS;
            }
        });
}

function updateEnemyAuras() {
    if (game.ended || game.player.health <= 0) return;

    const now = performance.now();
    game.cells
        .filter((cell) => cell.object === 'enemy')
        .forEach((wasp) => {
            if (!isAdjacent(wasp.q, wasp.r, game.player.q, game.player.r)) {
                wasp.nextAuraAt = 0;
                return;
            }

            if (!wasp.nextAuraAt) {
                wasp.nextAuraAt = now + WASP_AURA_MS;
                return;
            }

            if (now >= wasp.nextAuraAt) {
                applyDamage(WASP_AURA_DAMAGE, wasp.q, wasp.r, 'Wasp Sting');
                wasp.nextAuraAt = now + WASP_AURA_MS;
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
        deltas.push({ stat: 'health', amount: -healthDamage });
    }

    addStatPopups(q, r, deltas);

    if (blocked > 0 && healthDamage === 0) {
        game.message = `${source} blocked by shield.`;
    } else if (healthDamage > 0) {
        game.message = `${source} dealt ${healthDamage} health damage.`;
    }

    if (game.player.health <= 0) {
        endRun('death');
    }
}

function endRun(reason = 'final-exit') {
    if (game.ended) return;
    game.ended = true;
    const survivedMs = performance.now() - game.runStartedAt;
    const seconds = Math.floor(survivedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const danceComplete = game.dance
        ? Math.round(game.dance.completed / DANCE_MOVES_REQUIRED * 100)
        : 100;

    game.message = reason === 'death'
        ? 'Game over. The bee ran out of health.'
        : reason === 'dance-failed'
        ? `The path to food faded. ${danceComplete}% complete.`
        : 'The dance revealed the path to food.';
    addLog(reason === 'death' ? 'Game Over' : reason === 'dance-failed' ? 'Dance Failed' : 'Dance Complete', game.message);

    const stats = [
        ['Kills', game.runStats.kills],
        ['Pollen', game.runStats.pollen],
        ['Water', game.runStats.water],
        ['Time Survived', `${minutes}:${String(remainingSeconds).padStart(2, '0')}`],
        ['Path to Food', reason === 'death' ? '0%' : `${danceComplete}%`]
    ];

    endStatsNode.innerHTML = stats.map(([label, value]) => (
        `<div><span>${label}</span><strong>${value}</strong></div>`
    )).join('');
    endScreen.classList.add('visible');
}

function getCell(q, r) {
    return game.cells.find((cell) => cell.q === q && cell.r === r);
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
        health: 'Health',
        pollen: 'Pollen',
        water: 'Water',
        upgrades: 'Shield',
        stingCharges: 'Double Sting',
        cooldown: 'Cooldown',
        blocked: 'blocked'
    };
    if (delta.stat === 'blocked') {
        return `${delta.amount} blocked`;
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
    const stats = [
        ['Health', game.player.health, 'Keep this above zero'],
        ['Pollen', game.player.pollen, 'Trade with beetles'],
        ['Water', game.player.water, 'Small recovery source'],
        ['Shield', game.player.upgrades, 'Blocks incoming damage'],
        ['Double Sting', game.player.stingCharges, 'One-use bat finisher'],
        [game.mode === 'dance' ? 'Dance' : 'Room', game.mode === 'dance' ? `${game.dance?.completed || 0}/${DANCE_MOVES_REQUIRED}` : game.roomDepth, game.mode === 'dance' ? `${DANCE_MAX_MISSES - (game.dance?.misses || 0)} misses left` : 'Dungeon depth'],
        ['Steps', game.player.steps, 'Cells moved']
    ];

    statsNode.innerHTML = stats.map(([label, value, hint]) => (
        `<div class="stat"><span>${label}<small>${hint}</small></span><strong>${value}</strong></div>`
    )).join('');
}

function renderCooldown() {
    const remaining = getAttackCooldownRemaining();
    const total = game.player.attackCooldownMs;
    const ready = remaining <= 0;
    const progress = ready ? 100 : Math.max(0, Math.min(100, 100 - remaining / total * 100));

    cooldownWidget.classList.toggle('ready', ready);
    cooldownWidget.classList.toggle('locked', !ready);
    cooldownWidget.style.setProperty('--cooldown-progress', `${progress}%`);
    cooldownText.textContent = ready ? 'Sting ready' : `Sting locked ${(remaining / 1000).toFixed(1)}s`;
    cooldownHint.textContent = ready ? `Cooldown ${(total / 1000).toFixed(1)}s` : 'Avoid enemy cells until it refills';
}

function renderLog() {
    logListNode.innerHTML = game.logs.map((entry) => (
        `<div class="log-entry">
            <strong>${entry.turn === 0 ? 'Start' : `Turn ${entry.turn}: ${entry.title}`}</strong>
            ${entry.message}
        </div>`
    )).join('');
    logListNode.scrollTop = logListNode.scrollHeight;
}

function renderMessage() {
    turnTextNode.textContent = game.ended
        ? 'Run complete.'
        : game.player.health <= 0
        ? 'The run is over. Restart the draft.'
        : game.mode === 'dance'
        ? 'Click the colored arrow before it fades.'
        : game.mode === 'relicChoice'
        ? 'Choose one relic to shape the next chamber.'
        : 'Choose a highlighted neighboring cell.';
}

canvas.addEventListener('click', (event) => {
    if (game.mode === 'dance') return;

    const rect = canvas.getBoundingClientRect();
    const cell = pixelToClosestHex(event.clientX - rect.left, event.clientY - rect.top);
    moveTo(cell);
});

canvas.addEventListener('pointerdown', (event) => {
    if (game.mode !== 'dance' || game.ended) return;

    const rect = canvas.getBoundingClientRect();
    const cell = pixelToClosestHex(event.clientX - rect.left, event.clientY - rect.top);
    if (cell) {
        startDanceHold(cell);
    }
});

canvas.addEventListener('pointerup', () => {
    if (game.mode === 'dance') {
        endDanceHold();
    }
});

canvas.addEventListener('pointerleave', () => {
    if (game.mode === 'dance') {
        endDanceHold();
    }
});

restartButton.addEventListener('click', createGrid);
endRestartButton.addEventListener('click', createGrid);
endMenuButton.addEventListener('click', showMainMenu);
newRunButton.addEventListener('click', createGrid);
testDanceButton.addEventListener('click', testDanceRun);
relicChoicesNode.addEventListener('click', (event) => {
    const button = event.target.closest('[data-relic-id]');
    if (button) {
        chooseRelic(button.dataset.relicId);
    }
});
window.addEventListener('resize', resizeCanvas);

renderStats();
renderRelics();
resizeCanvas();
requestAnimationFrame(animate);
