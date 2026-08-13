const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const defaultUrl = `file:///${path.join(root, 'index.html').replace(/\\/g, '/')}`;
const gameUrl = process.env.GAME_URL || defaultUrl;
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

async function rect(page, selector) {
    return page.locator(selector).evaluate((element) => {
        const box = element.getBoundingClientRect();
        return {
            left: box.left,
            top: box.top,
            right: box.right,
            bottom: box.bottom,
            width: box.width,
            height: box.height
        };
    });
}

async function layoutSnapshot(page) {
    return page.evaluate(() => {
        const box = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return null;
            const rect = element.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
            };
        };
        return {
            hud: box('#bottomCombatHud'),
            life: box('#bottomCombatHud .life-orb'),
            move: box('#bottomCombatHud .move-orb'),
            xp: box('#bottomCombatHud .xp-hud'),
            toast: box('#eventToast.visible'),
            stats: box('#statsHud'),
            timers: box('#timerHud')
        };
    });
}

async function startRun(page) {
    await page.goto(gameUrl, { waitUntil: 'load' });
    await page.click('#newRunButton');
    await page.waitForFunction(() => window.HW_TEST_API && window.HW_TEST_API.getState().mode === 'dungeon');
}

async function inspectNeighbor(page) {
    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const cell = dirs.map((direction) => window.getCell(player.q + direction.q, player.r + direction.r)).find(Boolean);
        if (!cell) throw new Error('No inspectable neighbor found.');
        api.setCellObject(cell.q, cell.r, 'pollen', true);
        api.inspectCell(cell.q, cell.r);
    });
    await page.waitForSelector('#inspectPanel:not(.hidden)');
}

async function assertGameplayLayout(page, viewport) {
    await page.waitForSelector('#bottomCombatHud .life-orb');
    await page.waitForSelector('#bottomCombatHud .move-orb');
    await page.waitForSelector('#bottomCombatHud .xp-hud');
    const { hud, life, move, xp, toast, stats, timers } = await layoutSnapshot(page);
    assert(hud && life && move && xp, 'HUD, orb, and XP elements should be measurable.');

    assert(hud.left >= 0 && hud.right <= viewport.width, 'Bottom HUD should fit inside the viewport width.');
    assert(life.left <= hud.left + 4, 'Life orb should be anchored on the left side of the HUD.');
    assert(
        move.left > xp.right && move.right <= hud.right + 4,
        `Movement orb should stay on the right side of the HUD. hud=${JSON.stringify(hud)} xp=${JSON.stringify(xp)} move=${JSON.stringify(move)}`
    );
    assert(xp.left >= life.right - 1, 'XP bar should not overlap the life orb.');
    assert(xp.right <= move.left + 1, 'XP bar should not overlap the movement orb.');
    if (toast) {
        assert(toast.right < viewport.width * 0.55 || viewport.width < 700, 'Toast should stay away from the board center on desktop.');
        if (stats?.height > 0) assert(!overlaps(toast, stats), 'Toast should not overlap the top-left stat HUD.');
        if (timers?.height > 0) assert(!overlaps(toast, timers), 'Toast should not overlap nearby-enemy timers.');
    }

    await inspectNeighbor(page);
    const inspect = await rect(page, '#inspectPanel');
    assert(!overlaps(inspect, move), 'Inspect panel should not overlap the movement orb.');
    assert(!overlaps(inspect, life), 'Inspect panel should not overlap the life orb.');
    assert(inspect.bottom <= hud.top || viewport.width < 700, 'Desktop inspect panel should sit above the bottom HUD.');
}

async function assertCrowdedFeedbackLayout(page) {
    await page.evaluate(() => window.HW_TEST_API.startTestScenario('queenSignaler'));
    await page.waitForFunction(() => document.querySelectorAll('#statsHud .hud-pill').length >= 6);
    await page.evaluate(() => window.HW_TEST_API.startTestScenario('queenSignaler'));
    await page.waitForSelector('#eventToast.visible');
    const { toast, stats, timers } = await layoutSnapshot(page);
    assert(toast && stats, 'Crowded feedback layout should expose toast and stat HUD bounds.');
    assert(!overlaps(toast, stats), 'Toast should move below wrapped stat icons in crowded rooms.');
    if (timers?.height > 0) assert(!overlaps(toast, timers), 'Toast should move below active enemy timers.');
    if (page.viewportSize()?.width === 390) {
        await page.screenshot({ path: path.join(root, '.codex-video-frames', 'toast-hud-clearance.png') });
    }
}

async function assertEndStats(page, viewport) {
    await page.evaluate(() => window.HW_TEST_API.endRun('death'));
    await page.waitForSelector('#endScreen.visible');
    const groups = await page.locator('#endStats .end-stat-group').count();
    const stats = await rect(page, '#endStats');
    assert(groups >= 4, 'End screen should group run, defeat, progression, and tactics stats.');
    assert(stats.bottom <= viewport.height, 'End stats should fit within the viewport.');
}

async function runViewport(browser, viewport) {
    const page = await browser.newPage({ viewport });
    const logs = [];
    page.on('console', (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));

    await startRun(page);
    await assertGameplayLayout(page, viewport);
    await assertCrowdedFeedbackLayout(page);
    await assertEndStats(page, viewport);
    assert(!logs.some((line) => line.startsWith('pageerror:')), `Browser errors found:\n${logs.join('\n')}`);
    await page.close();
}

async function main() {
    const browser = await chromium.launch({ headless: true, executablePath });
    await runViewport(browser, { width: 1365, height: 768 });
    await runViewport(browser, { width: 390, height: 844 });
    await browser.close();
    console.log('UI layout smoke checks passed');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
