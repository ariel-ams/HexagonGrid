const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const defaultUrl = `file:///${path.join(root, 'roadmap-viewer', 'index.html').replace(/\\/g, '/')}`;
const roadmapUrl = process.env.ROADMAP_URL || defaultUrl;
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const screenshotPath = path.join(root, '.codex-video-frames', 'roadmap-viewer.png');

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
    page.on('requestfailed', (request) => logs.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));

    try {
        await page.goto(roadmapUrl, { waitUntil: 'load' });
        await page.waitForSelector('.react-flow__node', { timeout: 30000 });
        await page.waitForFunction(() => window.HW_ROADMAP_VIEWER?.getState()?.lanes?.length > 0);
    } catch (error) {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        throw new Error(`${error.message}\nBrowser logs:\n${logs.join('\n')}`);
    }

    const nodeCount = await page.locator('.react-flow__node').count();
    assert(nodeCount >= 6, 'Roadmap viewer should render the roadmap nodes.');
    assert(await page.locator('#statusFilters [data-status-filter]').count() >= 5, 'Roadmap viewer should render status filter buttons.');
    await page.locator('.react-flow__node').first().click();
    const detailTitle = await page.locator('#detailTitle').textContent();
    assert(detailTitle && detailTitle.trim() !== 'Select a node', 'Selecting a node should update the detail panel.');
    await page.locator('#statusFilters [data-status-filter="active"]').click();
    await page.waitForFunction(() => window.HW_ROADMAP_VIEWER?.getActiveStatus?.() === 'active');
    const activeNodeIds = await page.evaluate(() => window.HW_ROADMAP_VIEWER.getVisibleNodeIds());
    assert(activeNodeIds.length === 1, 'Active status filter should isolate the current active roadmap node.');
    assert(await page.locator('#statusSummary').textContent().then((text) => text.includes('active')), 'Status summary should describe the active filter.');
    await page.locator('#statusFilters [data-status-filter="all"]').click();
    await page.waitForFunction((expectedCount) => window.HW_ROADMAP_VIEWER?.getVisibleNodeIds?.().length === expectedCount, nodeCount);
    assert(!logs.some((line) => line.startsWith('pageerror:')), `Browser errors found:\n${logs.join('\n')}`);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    await browser.close();
    console.log(`Roadmap browser smoke checks passed: ${screenshotPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
