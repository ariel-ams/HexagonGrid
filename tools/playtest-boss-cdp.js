const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const GAME_URL = process.env.GAME_URL || 'http://localhost:8080/index.html';
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.CDP_PORT || 9233);
const ATTEMPTS = Number(process.env.ATTEMPTS || 5);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
    return response.json();
}

async function waitForCdp() {
    for (let i = 0; i < 60; i += 1) {
        try {
            return await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
        } catch {
            await sleep(250);
        }
    }
    throw new Error('Chrome remote debugging did not become available.');
}

function createCdpClient(webSocketDebuggerUrl) {
    const socket = new WebSocket(webSocketDebuggerUrl);
    let nextId = 1;
    const pending = new Map();

    socket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);
        if (!message.id || !pending.has(message.id)) return;
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
    });

    return {
        ready: new Promise((resolve, reject) => {
            socket.addEventListener('open', resolve, { once: true });
            socket.addEventListener('error', reject, { once: true });
        }),
        send(method, params = {}) {
            const id = nextId;
            nextId += 1;
            socket.send(JSON.stringify({ id, method, params }));
            return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
        },
        close() {
            socket.close();
        }
    };
}

async function evaluate(client, expression) {
    const result = await client.send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true
    });
    if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
}

async function runAttempt(client, attempt) {
    await evaluate(client, `
        (async () => {
            localStorage.setItem('honeycombDungeonTheme', 'waspHive');
            document.getElementById('newRunButton').click();
            await new Promise(resolve => setTimeout(resolve, 250));
            window.HW_TEST_API.generateBossRoom();
            await new Promise(resolve => setTimeout(resolve, 250));
            return window.HW_TEST_API.getState();
        })()
    `);

    const report = await evaluate(client, `
        (async () => {
            const api = window.HW_TEST_API;
            const directions = [
                { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
                { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
            ];
            const dist = (a, b) => {
                const aq = a.q, ar = a.r, as = -aq - ar;
                const bq = b.q, br = b.r, bs = -bq - br;
                return Math.max(Math.abs(aq - bq), Math.abs(ar - br), Math.abs(as - bs));
            };
            const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const nearest = (cells, from) => cells
                .slice()
                .sort((a, b) => dist(a, from) - dist(b, from))[0];
            const openNeighborToward = (target, player, cells) => {
                const byKey = new Map(cells.map(cell => [cell.q + ',' + cell.r, cell]));
                return directions
                    .map(direction => byKey.get((player.q + direction.q) + ',' + (player.r + direction.r)))
                    .filter(Boolean)
                    .filter(cell => !['wall', 'waxDoor', 'burningCell', 'vine'].includes(cell.object))
                    .sort((a, b) => dist(a, target) - dist(b, target))[0];
            };
            const log = [];

            for (let turn = 0; turn < 90; turn += 1) {
                const state = api.getState();
                const player = state.player;
                const cells = api.getCells();
                const queen = cells.find(cell => cell.object === 'queenSignaler');
                const hives = cells.filter(cell => cell.object === 'waspHive');
                const enemies = cells.filter(cell => cell.object && !['empty', 'entry', 'pollen', 'water', 'upgrade', 'stingUpgrade'].includes(cell.object));
                if (!queen) {
                    return { attempt: ${attempt}, result: 'won', turn, player, counts: api.getObjectCounts(), metrics: state.metrics, log };
                }
                if (player.health <= 0 || state.mode === 'ended') {
                    return { attempt: ${attempt}, result: 'dead', turn, player, counts: api.getObjectCounts(), metrics: state.metrics, log };
                }
                const target = nearest(hives.length ? hives : [queen], player);
                const targetDistance = dist(player, target);
                if (targetDistance <= player.attackRange) {
                    api.moveToCell(target.q, target.r);
                    log.push({ turn, action: 'attack', target: target.object, hp: player.health });
                } else {
                    const next = openNeighborToward(target, player, cells);
                    if (!next) {
                        log.push({ turn, action: 'stuck', target: target.object, hp: player.health });
                        return { attempt: ${attempt}, result: 'stuck', turn, player, counts: api.getObjectCounts(), metrics: state.metrics, log };
                    }
                    api.moveToCell(target.q, target.r);
                    log.push({ turn, action: 'moveToward', target: target.object, distance: targetDistance, hp: player.health });
                }
                await wait(180);
            }

            const state = api.getState();
            return { attempt: ${attempt}, result: 'timeout', player: state.player, counts: api.getObjectCounts(), metrics: state.metrics, log };
        })()
    `);

    return report;
}

(async () => {
    if (!fs.existsSync(CHROME)) {
        throw new Error(`Chrome was not found at ${CHROME}`);
    }
    const userDataDir = path.join(os.tmpdir(), `bee-grid-cdp-${Date.now()}`);
    const chrome = spawn(CHROME, [
        '--headless=new',
        '--disable-gpu',
        '--mute-audio',
        `--remote-debugging-port=${PORT}`,
        `--user-data-dir=${userDataDir}`,
        GAME_URL
    ], { stdio: 'ignore' });

    let client;
    try {
        await waitForCdp();
        const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
        const target = targets.find((item) => item.type === 'page') || targets[0];
        client = createCdpClient(target.webSocketDebuggerUrl);
        await client.ready;
        await client.send('Page.enable');
        await client.send('Runtime.enable');
        await client.send('Page.navigate', { url: GAME_URL });
        await sleep(800);
        await evaluate(client, 'window.HW_TEST_API && window.HW_TEST_API.getState()');

        const reports = [];
        for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
            reports.push(await runAttempt(client, attempt));
            await client.send('Page.navigate', { url: GAME_URL });
            await sleep(500);
        }
        console.log(JSON.stringify(reports, null, 2));
    } finally {
        if (client) client.close();
        chrome.kill();
    }
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
