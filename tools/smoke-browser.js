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

async function main() {
    const browser = await chromium.launch({ headless: true, executablePath });
    const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
    const logs = [];
    page.on('console', (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));

    await page.goto(gameUrl, { waitUntil: 'load' });
    await page.click('#newRunButton');
    await page.waitForFunction(() => window.HW_TEST_API && window.HW_TEST_API.getState().mode === 'dungeon');
    assert(await page.locator('#eventToast.visible').count() === 1, 'Top-center toast should appear after starting a run.');

    const routeResult = await page.evaluate(async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const api = window.HW_TEST_API;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const center = api.getState().player;
        let first = null;
        let second = null;

        for (const direction of dirs) {
            const a = window.getCell(center.q + direction.q, center.r + direction.r);
            const b = window.getCell(center.q + direction.q * 2, center.r + direction.r * 2);
            if (a && b) {
                first = { q: a.q, r: a.r };
                second = { q: b.q, r: b.r };
                break;
            }
        }

        if (!first || !second) throw new Error('No two-step route available for smoke test.');
        api.setCellObject(first.q, first.r, 'pollen', true);
        api.setCellObject(second.q, second.r, 'water', true);
        api.setTacticalState({ movePoints: 2, maxMovePoints: 2, actionAvailable: true });
        api.moveToCell(second.q, second.r);
        await wait(180);
        const state = api.getState();
        return {
            player: { q: state.player.q, r: state.player.r },
            expectedStop: first,
            firstObject: api.getCellObject(first.q, first.r),
            secondObject: api.getCellObject(second.q, second.r),
            actionAvailable: state.player.actionAvailable,
            movePoints: state.player.movePoints,
            turns: state.metrics.turns
        };
    });

    assert(routeResult.player.q === routeResult.expectedStop.q && routeResult.player.r === routeResult.expectedStop.r, 'Auto-walk should stop on the first action object.');
    assert(routeResult.firstObject === 'empty', 'First pickup should be consumed.');
    assert(routeResult.secondObject === 'water', 'Second pickup should remain for the next turn.');
    assert(routeResult.actionAvailable === true, 'Next tactical turn should be ready after the first pickup.');

    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const cell = dirs.map((direction) => window.getCell(player.q + direction.q, player.r + direction.r)).find(Boolean);
        api.inspectCell(cell.q, cell.r);
    });
    const inspectStats = await page.locator('#inspectPanel .inspect-stat').count();
    assert(inspectStats > 0, 'Inspect panel should show stat chips.');

    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        api.openMarketAt(player.q, player.r);
    });
    assert(await page.locator('#campScreen.visible').count() === 1, 'Market screen should open.');
    assert(await page.locator('#campScreen .camp-action').count() > 0, 'Market should render buy choices.');
    assert(await page.locator('#campScreen .camp-action-cost').count() > 0, 'Market choices should show separated costs.');
    assert(await page.locator('#campScreen .camp-action-effect').count() > 0, 'Market choices should show separated effects.');

    assert(!logs.some((line) => line.startsWith('pageerror:')), `Browser errors found:\n${logs.join('\n')}`);
    await browser.close();
    console.log('Browser smoke checks passed');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
