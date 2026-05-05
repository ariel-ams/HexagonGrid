const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statsNode = document.getElementById('stats');
const legendNode = document.getElementById('legend');
const logNode = document.getElementById('log');
const turnTextNode = document.getElementById('turnText');
const restartButton = document.getElementById('restartButton');

const HEX_RADIUS = 4;
const HEX_DIRECTIONS = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 }
];

const OBJECTS = {
    empty: {
        name: 'Open Cell',
        color: '#3c544d',
        description: 'Move here safely.'
    },
    enemy: {
        name: 'Enemy',
        color: '#d95c50',
        description: 'Costs health.'
    },
    npc: {
        name: 'NPC',
        color: '#64b5f6',
        description: 'Trades supplies for hints.'
    },
    upgrade: {
        name: 'Upgrade',
        color: '#b787f4',
        description: 'Improves your scout.'
    },
    item: {
        name: 'Item',
        color: '#5fc77e',
        description: 'Adds pollen or water.'
    },
    cache: {
        name: 'Supply Cache',
        color: '#f2bd4b',
        description: 'Restores health.'
    }
};

const game = {
    cells: [],
    player: {
        q: 0,
        r: 0,
        health: 100,
        pollen: 0,
        water: 0,
        upgrades: 0,
        steps: 0
    },
    message: 'The scout starts at the center. Click a glowing neighbor to move.'
};

function randomObjectFor(q, r) {
    if (q === 0 && r === 0) {
        return 'empty';
    }

    const distance = hexDistance(0, 0, q, r);
    const roll = Math.random();

    if (distance === 1 && roll < 0.45) return 'item';
    if (roll < 0.16) return 'enemy';
    if (roll < 0.28) return 'npc';
    if (roll < 0.40) return 'upgrade';
    if (roll < 0.58) return 'item';
    if (roll < 0.68) return 'cache';
    return 'empty';
}

function createGrid() {
    game.cells = [];
    game.player = {
        q: 0,
        r: 0,
        health: 100,
        pollen: 0,
        water: 0,
        upgrades: 0,
        steps: 0
    };
    game.message = 'The scout starts at the center. Click a glowing neighbor to move.';

    for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q++) {
        const rMin = Math.max(-HEX_RADIUS, -q - HEX_RADIUS);
        const rMax = Math.min(HEX_RADIUS, -q + HEX_RADIUS);

        for (let r = rMin; r <= rMax; r++) {
            game.cells.push({
                q,
                r,
                object: randomObjectFor(q, r),
                visited: q === 0 && r === 0
            });
        }
    }

    renderLegend();
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
    const shortest = Math.min(rect.width, rect.height);

    return {
        width: rect.width,
        height: rect.height,
        size: Math.max(28, Math.min(54, shortest / 11)),
        originX: rect.width / 2,
        originY: rect.height / 2
    };
}

function hexToPixel(q, r) {
    const board = layout();
    const x = board.originX + board.size * Math.sqrt(3) * (q + r / 2);
    const y = board.originY + board.size * 1.5 * r;
    return { x, y, size: board.size };
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
    renderStats();
    renderMessage();
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
        drawToken(cell.object, x, y, size);
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

function drawToken(type, x, y, size) {
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

    if (type === 'item') {
        ctx.fillStyle = '#f3f0df';
        ctx.beginPath();
        ctx.arc(-size * 0.08, -size * 0.02, size * 0.11, 0, Math.PI * 2);
        ctx.arc(size * 0.08, -size * 0.02, size * 0.11, 0, Math.PI * 2);
        ctx.arc(0, size * 0.1, size * 0.11, 0, Math.PI * 2);
        ctx.fill();
    }

    if (type === 'cache') {
        ctx.fillStyle = '#7a4f1c';
        ctx.fillRect(-size * 0.22, -size * 0.16, size * 0.44, size * 0.32);
        ctx.strokeStyle = '#fff2a7';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size * 0.22, -size * 0.16, size * 0.44, size * 0.32);
    }

    ctx.restore();
}

function drawPlayer() {
    const { x, y, size } = hexToPixel(game.player.q, game.player.r);

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

    game.player.q = cell.q;
    game.player.r = cell.r;
    game.player.steps += 1;
    cell.visited = true;
    game.message = resolveInteraction(cell);
    cell.object = 'empty';
    draw();
}

function resolveInteraction(cell) {
    if (cell.object === 'enemy') {
        const damage = Math.max(8, 24 - game.player.upgrades * 4);
        game.player.health = Math.max(0, game.player.health - damage);
        return game.player.health > 0
            ? `Enemy encounter. Lost ${damage} health.`
            : 'The scout is out of health. Restart to try another route.';
    }

    if (cell.object === 'npc') {
        if (game.player.pollen > 0) {
            game.player.pollen -= 1;
            game.player.water += 1;
            return 'NPC trade complete. Spent 1 pollen and gained 1 water.';
        }
        return 'NPC wants pollen. Come back with supplies.';
    }

    if (cell.object === 'upgrade') {
        game.player.upgrades += 1;
        return 'Upgrade collected. Future enemy damage is reduced.';
    }

    if (cell.object === 'item') {
        if (Math.random() > 0.5) {
            game.player.pollen += 2;
            return 'Collected a pollen bundle.';
        }
        game.player.water += 2;
        return 'Collected a water drop.';
    }

    if (cell.object === 'cache') {
        game.player.health = Math.min(100, game.player.health + 18);
        return 'Opened a supply cache. Restored health.';
    }

    return 'Moved to an open cell.';
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

function renderStats() {
    const stats = [
        ['Health', game.player.health],
        ['Pollen', game.player.pollen],
        ['Water', game.player.water],
        ['Upgrades', game.player.upgrades],
        ['Steps', game.player.steps]
    ];

    statsNode.innerHTML = stats.map(([label, value]) => (
        `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`
    )).join('');
}

function renderLegend() {
    legendNode.innerHTML = Object.entries(OBJECTS).map(([key, object]) => (
        `<div class="legend-row">
            <span><span class="swatch" style="display:inline-block;background:${object.color}"></span> ${object.name}</span>
            <span>${key === 'empty' ? 'move' : object.description}</span>
        </div>`
    )).join('');
}

function renderMessage() {
    logNode.textContent = game.message;
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
