const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statsNode = document.getElementById('stats');
const logListNode = document.getElementById('logList');
const turnTextNode = document.getElementById('turnText');
const restartButton = document.getElementById('restartButton');
const cooldownWidget = document.getElementById('cooldownWidget');
const cooldownText = document.getElementById('cooldownText');
const cooldownHint = document.getElementById('cooldownHint');

const HEX_RADIUS = 4;
const ENTRY_CELL = { q: -4, r: 0 };
const EXIT_CELL = { q: 4, r: 0 };
const HEX_DIRECTIONS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
];

const SPRITE_SHEET = {
    src: 'assets/sprites-idle.png',
    columns: 4,
    rows: 6,
    frameMs: 180,
    sprites: {
        player: { row: 0 },
        enemy: { row: 1 },
        npc: { row: 2 },
        pollen: { row: 3 },
        water: { row: 4 },
        upgrade: { row: 5 }
    }
};

const spritesImage = new Image();
let spritesReady = false;
let spriteFrames = {};
spritesImage.onload = () => {
    spriteFrames = buildSpriteFrames();
    spritesReady = true;
    draw();
};
spritesImage.src = SPRITE_SHEET.src;

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
    entry: {
        name: 'Entry',
        color: '#45b17a',
        description: 'Return to the previous room.'
    },
    exit: {
        name: 'Exit',
        color: '#f2bd4b',
        description: 'Open the next room.'
    }
};

const game = {
    cells: [],
    logs: [],
    roomStack: [],
    roomDepth: 1,
    statPopups: [],
    player: {
        q: 0,
        r: 0,
        health: 100,
        pollen: 0,
        water: 0,
        upgrades: 0,
        steps: 0,
        attackCooldownMs: 3000,
        attackReadyAt: 0
    },
    message: 'The scout starts at the center. Click a glowing neighbor to move.'
};

function randomObjectFor(q, r) {
    if (q === ENTRY_CELL.q && r === ENTRY_CELL.r) {
        return 'entry';
    }

    if (q === EXIT_CELL.q && r === EXIT_CELL.r) {
        return 'exit';
    }

    if (q === 0 && r === 0) {
        return 'empty';
    }

    const distance = hexDistance(0, 0, q, r);
    const roll = Math.random();

    if (distance === 1 && roll < 0.28) return 'pollen';
    if (distance === 1 && roll < 0.50) return 'water';
    if (roll < 0.13) return 'enemy';
    if (roll < 0.21) return 'bat';
    if (roll < 0.32) return 'npc';
    if (roll < 0.43) return 'upgrade';
    if (roll < 0.58) return 'pollen';
    if (roll < 0.73) return 'water';
    return 'empty';
}

function createGrid() {
    game.logs = [];
    game.roomStack = [];
    game.roomDepth = 1;
    game.player = createFreshPlayer();
    generateRoom('restart');
}

function createFreshPlayer() {
    return {
        q: ENTRY_CELL.q,
        r: ENTRY_CELL.r,
        health: 100,
        pollen: 0,
        water: 0,
        upgrades: 0,
        steps: 0,
        attackCooldownMs: 3000,
        attackReadyAt: 0
    };
}

function generateRoom(reason) {
    game.cells = [];
    game.statPopups = [];
    game.player.q = ENTRY_CELL.q;
    game.player.r = ENTRY_CELL.r;
    game.message = 'A new chamber opens. Find the exit.';

    for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q++) {
        const rMin = Math.max(-HEX_RADIUS, -q - HEX_RADIUS);
        const rMax = Math.min(HEX_RADIUS, -q + HEX_RADIUS);

        for (let r = rMin; r <= rMax; r++) {
            game.cells.push({
                q,
                r,
                object: randomObjectFor(q, r),
                visited: q === ENTRY_CELL.q && r === ENTRY_CELL.r
            });
        }
    }

    if (reason === 'restart') {
        addLog('Start', 'Scout the dungeon, manage sting cooldown, and use exits to crawl deeper.');
    } else {
        addLog('Exit', `Entered chamber ${game.roomDepth}.`);
    }
    draw();
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
    const padding = 28;
    const hexes = game.cells.length ? game.cells : [{ q: -HEX_RADIUS, r: 0 }, { q: HEX_RADIUS, r: 0 }];
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

    return {
        width: rect.width,
        height: rect.height,
        size,
        originX: rect.width / 2 - (minX + unitWidth / 2) * size,
        originY: rect.height / 2 - (minY + unitHeight / 2) * size
    };
}

function hexToPixel(q, r) {
    const board = layout();
    const x = board.originX + board.size * Math.sqrt(3) * (q + r / 2);
    const y = board.originY + board.size * 1.5 * r;
    return { x, y, size: board.size };
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

    const board = layout();
    ctx.clearRect(0, 0, board.width, board.height);
    drawBackground(board);

    game.cells.forEach(drawCell);
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

function drawCell(cell) {
    const isPlayer = cell.q === game.player.q && cell.r === game.player.r;
    const canMove = !isPlayer && isAdjacent(game.player.q, game.player.r, cell.q, cell.r);
    const { x, y, size } = hexToPixel(cell.q, cell.r);
    const object = OBJECTS[cell.object];

    drawHexPath(x, y, size - 2);
    ctx.fillStyle = cell.visited ? shade(object.color, -18) : object.color;
    ctx.globalAlpha = cell.visited ? 0.78 : 0.96;
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

    if (cell.object !== 'empty') {
        drawSprite(cell.object, x, y, size);
    }
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

function buildSpriteFrames() {
    const frames = {};
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });

    Object.entries(SPRITE_SHEET.sprites).forEach(([type, sprite]) => {
        frames[type] = [];

        for (let column = 0; column < SPRITE_SHEET.columns; column++) {
            const sourceX = Math.round(column * spritesImage.naturalWidth / SPRITE_SHEET.columns);
            const nextSourceX = Math.round((column + 1) * spritesImage.naturalWidth / SPRITE_SHEET.columns);
            const sourceY = Math.round(sprite.row * spritesImage.naturalHeight / SPRITE_SHEET.rows);
            const nextSourceY = Math.round((sprite.row + 1) * spritesImage.naturalHeight / SPRITE_SHEET.rows);
            const sourceWidth = nextSourceX - sourceX;
            const sourceHeight = nextSourceY - sourceY;

            analysisCanvas.width = sourceWidth;
            analysisCanvas.height = sourceHeight;
            analysisCtx.clearRect(0, 0, sourceWidth, sourceHeight);
            analysisCtx.drawImage(
                spritesImage,
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

            frames[type].push({
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
    const sprite = SPRITE_SHEET.sprites[type];
    if (!spritesReady || !sprite) {
        drawTokenFallback(type, x, y, size);
        return;
    }

    const frame = Math.floor(performance.now() / SPRITE_SHEET.frameMs) % SPRITE_SHEET.columns;
    const spriteFrame = spriteFrames[type][frame];
    const bob = Math.sin(performance.now() / 260 + sprite.row) * size * 0.035;
    const maxDrawSize = size * (type === 'upgrade' ? 1.08 : 1.22);
    const scale = maxDrawSize / Math.max(spriteFrame.sourceWidth, spriteFrame.sourceHeight);
    const drawWidth = spriteFrame.sourceWidth * scale;
    const drawHeight = spriteFrame.sourceHeight * scale;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(
        spritesImage,
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

    if (type === 'entry' || type === 'exit') {
        const isExit = type === 'exit';
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

function drawPlayer() {
    const { x, y, size } = hexToPixel(game.player.q, game.player.r);

    if (spritesReady) {
        drawSprite('player', x, y, size * 1.1);
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
        ctx.strokeText(popup.label, popup.x, popup.y - lift + popup.offsetY);
        ctx.fillText(popup.label, popup.x, popup.y - lift + popup.offsetY);
        ctx.restore();
    });
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
    if (!cell || !isAdjacent(game.player.q, game.player.r, cell.q, cell.r) || game.player.health <= 0) {
        return;
    }

    const targetObject = cell.object;
    if ((targetObject === 'enemy' || targetObject === 'bat') && getAttackCooldownRemaining() > 0) {
        const seconds = (getAttackCooldownRemaining() / 1000).toFixed(1);
        game.message = `Sting is cooling down. Wait ${seconds}s before attacking.`;
        addLog('Sting Cooldown', game.message);
        return;
    }

    game.player.q = cell.q;
    game.player.r = cell.r;
    game.player.steps += 1;
    cell.visited = true;

    if (targetObject === 'exit') {
        game.roomStack.push(createRoomSnapshot());
        game.roomDepth += 1;
        generateRoom('exit');
        return;
    }

    if (targetObject === 'entry') {
        loadPreviousRoom();
        return;
    }

    const interaction = resolveInteraction(targetObject);
    game.message = interaction.message;
    addLog(OBJECTS[targetObject].name, interaction.message);
    addStatPopups(cell.q, cell.r, interaction.deltas);
    if (interaction.consume) {
        cell.object = 'empty';
    }
    moveBats();
    draw();
}

function resolveInteraction(object) {
    if (object === 'enemy' || object === 'bat') {
        const baseDamage = object === 'bat' ? 14 : 20;
        const minimumDamage = object === 'bat' ? 5 : 8;
        const damage = Math.max(minimumDamage, baseDamage - game.player.upgrades * 4);
        game.player.health = Math.max(0, game.player.health - damage);
        game.player.attackReadyAt = performance.now() + game.player.attackCooldownMs;
        return {
            message: game.player.health > 0
                ? `${OBJECTS[object].name} fight. Lost ${damage} health.`
                : 'The scout is out of health. Restart to try another route.',
            deltas: [{ stat: 'health', amount: -damage }],
            consume: true
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
                consume: false
            };
        }
        return {
            message: 'Trade beetle needs 1 pollen and 1 water to reduce sting cooldown.',
            deltas: [],
            consume: false
        };
    }

    if (object === 'upgrade') {
        game.player.upgrades += 1;
        return {
            message: 'Shield upgrade collected. Future enemy damage is reduced.',
            deltas: [{ stat: 'upgrades', amount: 1 }],
            consume: true
        };
    }

    if (object === 'pollen') {
        game.player.pollen += 1;
        return {
            message: 'Collected a pollen bundle.',
            deltas: [{ stat: 'pollen', amount: 1 }],
            consume: true
        };
    }

    if (object === 'water') {
        const previousHealth = game.player.health;
        game.player.water += 1;
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
        playerQ: EXIT_CELL.q,
        playerR: EXIT_CELL.r
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
    game.statPopups = [];
    game.player.q = previousRoom.playerQ;
    game.player.r = previousRoom.playerR;
    const playerCell = getCell(game.player.q, game.player.r);
    if (playerCell) playerCell.visited = true;
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
        move.to.object = 'bat';
    });

    if (plannedMoves.length) {
        addLog('Bat Movement', `${plannedMoves.length} bat${plannedMoves.length === 1 ? '' : 's'} moved closer.`);
    }
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
        game.statPopups.push({
            x: point.x,
            y: point.y - point.size * 0.62,
            offsetY: index * 22,
            label: formatDelta(delta),
            color: delta.amount < 0 ? '#ff8a72' : '#fff2a7',
            createdAt: performance.now() + index * 70,
            duration: 920
        });
    });
}

function formatDelta(delta) {
    const prefix = delta.amount > 0 ? '+' : '';
    const labels = {
        health: 'Health',
        pollen: 'Pollen',
        water: 'Water',
        upgrades: 'Shield',
        cooldown: 'Cooldown'
    };
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
        ['Shield', game.player.upgrades, 'Reduces wasp damage'],
        ['Room', game.roomDepth, 'Dungeon depth'],
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
    cooldownWidget.style.setProperty('--cooldown-progress', `${progress}%`);
    cooldownText.textContent = ready ? 'Sting ready' : `Sting ${(remaining / 1000).toFixed(1)}s`;
    cooldownHint.textContent = `Cooldown ${(total / 1000).toFixed(1)}s`;
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
    turnTextNode.textContent = game.player.health <= 0
        ? 'The run is over. Restart the draft.'
        : 'Choose a highlighted neighboring cell.';
}

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const cell = pixelToClosestHex(event.clientX - rect.left, event.clientY - rect.top);
    moveTo(cell);
});

restartButton.addEventListener('click', createGrid);
window.addEventListener('resize', resizeCanvas);

createGrid();
resizeCanvas();
requestAnimationFrame(animate);
