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

async function assertDialogSemantics(page, selector, expected) {
    const attrs = await page.locator(selector).evaluate((node) => ({
        role: node.getAttribute('role'),
        modal: node.getAttribute('aria-modal'),
        labelledBy: node.getAttribute('aria-labelledby'),
        describedBy: node.getAttribute('aria-describedby')
    }));
    assert(attrs.role === 'dialog' && attrs.modal === 'true', `${selector} should expose modal dialog semantics.`);
    assert(
        attrs.labelledBy === expected.labelledBy && attrs.describedBy === expected.describedBy,
        `${selector} should reference its accessible title and description.`
    );
}

async function main() {
    const browser = await chromium.launch({ headless: true, executablePath });
    const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
    const logs = [];
    page.on('console', (message) => logs.push(`${message.type()}: ${message.text()}`));
    page.on('pageerror', (error) => logs.push(`pageerror: ${error.message}`));
    await page.addInitScript(() => {
        localStorage.removeItem('honeycombProgression');
        localStorage.setItem('honeycombLanguage', 'en');
        localStorage.setItem('honeycombDungeonTheme', 'forest');
    });

    await page.goto(gameUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => window.HW_TEST_API && window.HW_TEST_API.areAssetsReady && window.HW_TEST_API.areAssetsReady());
    assert(await page.locator('#loadingScreen.ready').count() === 1, 'Loading screen should hide after assets are ready.');
    const startupThemeSheets = await page.evaluate(() => window.HW_TEST_API.getThemeTileDebug().loadedSheets);
    assert(
        startupThemeSheets.length === 1 && startupThemeSheets[0] === 'forest',
        `Startup should load only the selected theme surroundings sheet, received ${startupThemeSheets.join(', ')}`
    );
    const testObjectEntries = await page.evaluate(() => window.HW_TEST_API.getTestObjectEntries());
    assert(testObjectEntries.length > 0, 'Test menu should expose testable game objects.');
    const effectStatCoverage = await page.evaluate(() => window.HW_TEST_API.getObjectEffectStatCoverage());
    assert(effectStatCoverage.length > 0, 'Inspectable effect stat coverage should include item objects.');
    effectStatCoverage.forEach((entry) => {
        assert(entry.statCount > 0, `Object ${entry.id} has effects but no inspect stat metadata.`);
        entry.stats.forEach((stat) => {
            assert(stat.kind && stat.label, `Object ${entry.id} has an inspect stat without kind or label.`);
            assert(Number.isInteger(stat.hudRow), `Object ${entry.id} inspect stat ${stat.kind} needs a HUD sprite row.`);
        });
    });
    await page.click('#testDanceButton');
    await page.waitForSelector('#testScreen.visible');
    await assertDialogSemantics(page, '#testScreen', {
        labelledBy: 'testDialogTitle',
        describedBy: 'testDialogCopy'
    });
    assert(
        await page.evaluate(() => document.activeElement?.hasAttribute('data-test-object')),
        'Opening the Test dialog should focus the first test scenario.'
    );
    await page.keyboard.press('Shift+Tab');
    assert(
        await page.evaluate(() => document.activeElement?.id === 'testBackButton'),
        'Shift+Tab from the first Test choice should wrap to Main Menu.'
    );
    await page.keyboard.press('Tab');
    assert(
        await page.evaluate(() => document.activeElement?.hasAttribute('data-test-object')),
        'Tab from Main Menu should wrap to the first Test choice.'
    );
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#testScreen.visible'));
    assert(
        await page.evaluate(() => document.activeElement?.id === 'testDanceButton'),
        'Escape should close the Test dialog and return focus to its launcher.'
    );
    await page.click('#testDanceButton');
    await page.waitForSelector('#testScreen.visible');
    const renderedTestObjects = await page.locator('#testObjectList [data-test-object]').evaluateAll((nodes) => (
        nodes.map((node) => node.getAttribute('data-test-object'))
    ));
    assert(renderedTestObjects.length === testObjectEntries.length, 'Test menu should render every generated test object.');
    const renderedTestObjectSet = new Set(renderedTestObjects);
    testObjectEntries.forEach((entry) => {
        assert(renderedTestObjectSet.has(entry.id), `Test menu is missing ${entry.id}.`);
    });
    ['empty', 'entry', 'exit', 'finalExit'].forEach((objectId) => {
        assert(!renderedTestObjectSet.has(objectId), `Test menu should not include navigation/internal object ${objectId}.`);
    });
    assert(await page.locator('#testObjectList canvas.test-object-icon').count() === testObjectEntries.length, 'Each test object should render an icon canvas.');
    const scenarioResults = await page.evaluate((entries) => (
        entries.map((entry) => window.HW_TEST_API.startTestScenario(entry.id))
    ), testObjectEntries);
    scenarioResults.forEach((result, index) => {
        const entry = testObjectEntries[index];
        assert(result.mode === 'dungeon', `Test scenario ${entry.id} should enter dungeon mode.`);
        assert(result.isTestScenario === true, `Test scenario ${entry.id} should mark test mode.`);
        assert(result.activeTestObject === entry.id, `Test scenario ${entry.id} should become the active test object.`);
        assert(result.targetObject === entry.id, `Test scenario ${entry.id} should place the object in the target cell.`);
        assert(result.player.q === 0 && result.player.r === 0, `Test scenario ${entry.id} should reset the bee at the scenario start.`);
        assert(typeof result.message === 'string' && result.message.includes(entry.name), `Test scenario ${entry.id} should explain the tested object.`);
    });
    await page.click('#testListButton');
    await page.waitForSelector('#testScreen.visible');
    await page.click('#testBackButton');
    await page.waitForFunction(() => !document.querySelector('#testScreen.visible'));
    assert(
        await page.evaluate(() => document.activeElement?.id === 'testDanceButton'),
        'Closing the Test dialog should return focus to its launcher.'
    );
    await page.click('#optionsButton');
    await page.selectOption('#themeSelect', 'cave');
    assert(
        (await page.locator('#themeDescription').textContent()).includes('Darker navigation'),
        'Theme options should explain the selected run style in English.'
    );
    await page.evaluate(() => window.setLanguage('es-419'));
    assert(
        (await page.locator('#themeDescription').textContent()).includes('Salas oscuras'),
        'Theme options should explain the selected run style in Latin American Spanish.'
    );
    assert(
        await page.locator('#themeDescription').evaluate((node) => getComputedStyle(node).color === 'rgb(76, 44, 29)'),
        'Theme description should use readable dark text on parchment.'
    );
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'theme-options.png') });
    await page.evaluate(() => window.setLanguage('en'));
    await page.click('#optionsButton');
    await page.click('#newRunButton');
    await page.waitForFunction(() => window.HW_TEST_API && window.HW_TEST_API.getState().mode === 'dungeon');
    assert(await page.locator('#eventToast.visible').count() === 1, 'Top-center toast should appear after starting a run.');
    const firstRoomPacing = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        return {
            state: api.getState(),
            counts: api.getObjectCounts()
        };
    });
    assert(firstRoomPacing.state.roomTemplate === 'onboardingPath', 'Level-1 room 1 should use the onboarding path template.');
    assert((firstRoomPacing.counts.enemy || 0) === 0, 'Onboarding room should not start with a wasp enemy.');
    assert((firstRoomPacing.counts.pollen || 0) >= 1, 'Onboarding room should include pollen.');
    assert((firstRoomPacing.counts.water || 0) >= 1, 'Onboarding room should include water.');
    assert((firstRoomPacing.counts.lampCell || 0) >= 1, 'Onboarding room should include a lamp cell.');
    assert((firstRoomPacing.counts.upgrade || 0) >= 1, 'Onboarding room should include shield upgrade.');
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'lamp-style-first-run.png') });
    await page.keyboard.press('Escape');
    await page.waitForSelector('#settingsScreen.visible');
    await assertDialogSemantics(page, '#settingsScreen', {
        labelledBy: 'settingsDialogTitle',
        describedBy: 'settingsDialogCopy'
    });
    assert(await page.evaluate(() => document.activeElement?.id === 'settingsCloseButton'), 'Escape pause should focus the Resume button.');
    await page.keyboard.press('Tab');
    assert(await page.evaluate(() => document.activeElement?.id === 'musicVolumeInput'), 'Tab from Resume should wrap to the first settings control.');
    await page.keyboard.press('Shift+Tab');
    assert(await page.evaluate(() => document.activeElement?.id === 'settingsCloseButton'), 'Shift+Tab from the first settings control should wrap to Resume.');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#settingsScreen.visible'));
    assert(await page.evaluate(() => document.activeElement?.id === 'settingsToggle'), 'Closing settings should return focus to the Settings button.');
    const startingEquipment = await page.evaluate(() => window.HW_TEST_API.getEquipment());
    assert(startingEquipment.helmet === 'waxScoutHelmet', 'New runs should equip the starter helmet.');
    assert(startingEquipment.jacket === 'leafJacket', 'New runs should equip the starter jacket.');
    assert(startingEquipment.abdomen === 'nectarPouch', 'New runs should equip the starter abdomen guard.');
    assert(startingEquipment.sting === 'barbedSting', 'New runs should equip the starter sting.');
    assert(startingEquipment.wings === 'scoutWings', 'New runs should equip the starter wings.');
    assert(await page.locator('#equipmentList .equipment-chip').count() === 5, 'Side panel should show one equipped gear chip per slot.');
    assert(await page.locator('#equipmentEffects .equipment-effect-chip').count() > 0, 'Side panel should summarize equipped gear effects.');
    const equipmentTooltip = await page.locator('#equipmentList .equipment-chip').first().getAttribute('title');
    assert(equipmentTooltip && equipmentTooltip.includes('Future'), 'Side panel gear chips should expose equipment effect details in hover text.');
    const initialRewardOverlay = await page.evaluate(() => window.HW_TEST_API.openRewardFlowForTest({ roomDepth: 2, level: 2 }));
    assert(initialRewardOverlay.visible, 'Reward overlay should open between rooms.');
    await assertDialogSemantics(page, '#relicScreen', {
        labelledBy: 'relicDialogTitle',
        describedBy: 'relicDialogCopy'
    });
    assert(initialRewardOverlay.rewardFlowSteps.join(',') === 'relic,equipment', 'Reward overlay should sequence relic rewards before equipment rewards.');
    assert(initialRewardOverlay.title === 'Choose a Relic', 'Reward overlay should start on the relic step.');
    assert(initialRewardOverlay.relicIds.length > 0, 'Reward overlay should render relic choices first.');
    assert(
        await page.evaluate(() => document.activeElement?.hasAttribute('data-relic-id')),
        'Opening the Reward dialog should focus the first relic choice.'
    );
    assert(await page.locator('#relicChoices .relic-card-kicker').count() === initialRewardOverlay.relicIds.length, 'Relic cards should show rarity/depth kicker text.');
    assert(await page.locator('#relicChoices .relic-card-effect').count() === initialRewardOverlay.relicIds.length, 'Relic cards should separate effect copy from the title.');
    await page.click('#relicChoices [data-relic-id]');
    await page.waitForFunction(() => window.HW_TEST_API.getRewardOverlayState().title === 'Choose Gear');
    const equipmentRewardOverlay = await page.evaluate(() => window.HW_TEST_API.getRewardOverlayState());
    assert(equipmentRewardOverlay.completedRewardSteps.includes('relic'), 'Reward overlay should mark the relic step complete before gear.');
    assert(equipmentRewardOverlay.equipmentIds.length > 0, 'Reward overlay should render eligible equipment choices after relic selection.');
    assert(
        await page.evaluate(() => document.activeElement?.hasAttribute('data-equipment-id')),
        'Advancing the Reward dialog should focus the first gear choice.'
    );
    await page.click('#relicChoices [data-equipment-id]');
    await page.waitForFunction(() => !window.HW_TEST_API.getRewardOverlayState().visible);
    const selectedEquipmentOverlay = await page.evaluate(() => window.HW_TEST_API.getRewardOverlayState());
    assert(selectedEquipmentOverlay.roomDepth === 3, 'Completing reward flow should advance to the next room.');
    assert(Object.values(selectedEquipmentOverlay.equipment).some((id) => id && !Object.values(startingEquipment).includes(id)), 'Choosing gear should update one equipment slot.');
    await page.evaluate(() => {
        window.HW_TEST_API.setProgressionLevel(1);
        window.HW_TEST_API.restartRunForTest();
    });
    await page.waitForFunction(() => window.HW_TEST_API.getState().roomTemplate === 'onboardingPath');

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
        await wait(1000);
        const state = api.getState();
        return {
            player: { q: state.player.q, r: state.player.r },
            expectedStop: second,
            firstObject: api.getCellObject(first.q, first.r),
            secondObject: api.getCellObject(second.q, second.r),
            actionAvailable: state.player.actionAvailable,
            movePoints: state.player.movePoints,
            turns: state.metrics.turns
        };
    });

    assert(routeResult.player.q === routeResult.expectedStop.q && routeResult.player.r === routeResult.expectedStop.r, 'Auto-walk should collect multiple pickups along the reachable path.');
    assert(routeResult.firstObject === 'empty', 'First pickup should be consumed.');
    assert(routeResult.secondObject === 'empty', 'Second pickup should also be consumed.');
    assert(routeResult.actionAvailable === true, 'Next tactical turn should be ready after the path finishes.');
    const roomState = await page.evaluate(() => window.HW_TEST_API.getState());
    assert(roomState.roomTemplate, 'Room template should be exposed for playtest/debugging.');
    await page.waitForFunction(() => {
        const debug = window.HW_TEST_API.getThemeTileDebug();
        const meta = debug.meta[debug.themeId] || debug.meta.forest;
        return meta && meta.columns === 6 && meta.rows >= 5 && debug.rows.length > 0 && debug.environmentCells > 0;
    });
    const themeTileDebug = await page.evaluate(() => window.HW_TEST_API.getThemeTileDebug());
    const activeThemeMeta = themeTileDebug.meta[themeTileDebug.themeId] || themeTileDebug.meta.forest;
    assert(activeThemeMeta.baseRows >= 5, 'Theme tile sheets should expose at least five mosaic rows.');
    assert(activeThemeMeta.blendRow >= activeThemeMeta.baseRows, 'Theme tile sheets should reserve the last row for edge blending when available.');
    assert(themeTileDebug.overlapsPlayable === 0, 'Theme environment should not replace playable cell backgrounds.');
    assert(themeTileDebug.environmentCells > themeTileDebug.playableCells, 'Theme environment should fill non-playable surroundings around the room.');
    assert(
        [1, 2, 3, 4].every((size) => themeTileDebug.pieceSizes.includes(size)),
        'Theme environment should place deterministic 1-4 hex mosaic pieces.'
    );
    const repeatedThemeTileDebug = await page.evaluate(() => {
        const first = window.HW_TEST_API.getThemeTileDebug();
        const second = window.HW_TEST_API.getThemeTileDebug();
        return {
            ...second,
            cacheHitDelta: second.cache.hits - first.cache.hits,
            cacheBuildDelta: second.cache.builds - first.cache.builds
        };
    });
    assert(
        repeatedThemeTileDebug.placementFingerprint === themeTileDebug.placementFingerprint,
        'Theme environment placement should remain stable between renders.'
    );
    assert(repeatedThemeTileDebug.cacheHitDelta === 1, 'Repeated surroundings queries should reuse the cached viewport.');
    assert(repeatedThemeTileDebug.cacheBuildDelta === 0, 'Repeated surroundings queries should not rebuild an unchanged viewport.');
    const themeSurroundingsCoverage = await page.evaluate(async () => {
        const themeIds = ['forest', 'cave', 'waspHive', 'underground'];
        const coverage = [];
        for (const themeId of themeIds) {
            await window.HW_TEST_API.setDungeonTheme(themeId);
            const debug = window.HW_TEST_API.getThemeTileDebug();
            coverage.push({
                themeId,
                activeThemeId: debug.themeId,
                sheetLoaded: debug.loadedSheets.includes(themeId),
                environmentCells: debug.environmentCells,
                overlapsPlayable: debug.overlapsPlayable
            });
        }
        return coverage;
    });
    themeSurroundingsCoverage.forEach((coverage) => {
        assert(coverage.activeThemeId === coverage.themeId, `Theme ${coverage.themeId} should become the active surroundings theme.`);
        assert(coverage.sheetLoaded, `Theme ${coverage.themeId} should load its surroundings sheet.`);
        assert(coverage.environmentCells > 0, `Theme ${coverage.themeId} should render non-playable surroundings.`);
        assert(coverage.overlapsPlayable === 0, `Theme ${coverage.themeId} surroundings should not overlap playable cells.`);
    });
    await page.evaluate(() => window.HW_TEST_API.setDungeonTheme('forest'));
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'theme-surroundings.png') });

    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const cell = dirs.map((direction) => window.getCell(player.q + direction.q, player.r + direction.r)).find(Boolean);
        api.setCellObject(cell.q, cell.r, 'pollen', true);
        api.inspectCell(cell.q, cell.r);
    });
    const inspectStats = await page.locator('#inspectPanel .inspect-stat').count();
    assert(inspectStats > 0, 'Inspect panel should show stat chips.');
    assert(await page.locator('#inspectPanel .has-sheet-icon').count() > 0, 'Inspect stat chips should use HUD sprite sheet icons.');
    assert(
        await page.locator('#inspectPanel .inspect-stat-caption').count() === inspectStats,
        'Every inspect stat should label whether it represents a gain, cost, danger, or route value.'
    );
    assert(
        await page.locator('#inspectPanel .inspect-stat-caption').allTextContents().then((labels) => labels.includes('Gain')),
        'Collectable inspect stats should identify gained value.'
    );
    assert(
        await page.locator('#inspectPanel .inspect-stat-value').allTextContents().then((values) => values.includes('+1')),
        'Collectable inspect stats should emphasize the exact gained amount.'
    );
    await page.evaluate(() => window.setLanguage('es-419'));
    await page.waitForFunction(() => (
        [...document.querySelectorAll('#inspectPanel .inspect-stat-caption')]
            .some((node) => node.textContent === 'Ganas')
    ));
    await page.evaluate(() => window.setLanguage('en'));
    const routeInspectText = await page.locator('#inspectPanel').textContent();
    assert(routeInspectText.includes('Route: costs'), 'Inspect panel should explain route movement cost.');
    assert(routeInspectText.includes('Result:') || routeInspectText.includes('Stop:'), 'Inspect panel should explain the route outcome.');

    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const cell = dirs.map((direction) => window.getCell(player.q + direction.q, player.r + direction.r)).find(Boolean);
        api.setCellObject(cell.q, cell.r, 'burningCell', true);
        api.inspectCell(cell.q, cell.r);
    });
    const hazardCaptions = await page.locator('#inspectPanel .inspect-stat-caption').allTextContents();
    assert(hazardCaptions.includes('Damage'), 'Hazard inspect stats should label incoming damage.');
    assert(hazardCaptions.includes('Cost'), 'Hazard inspect stats should label the resource cost that avoids damage.');

    const waspScenario = await page.evaluate(() => window.HW_TEST_API.startTestScenario('enemy'));
    assert(waspScenario.targetObject === 'enemy', 'The normal Wasp should retain its focused Test scenario.');
    await page.waitForTimeout(220);
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'lamp-style-wasp.png') });

    const batScenario = await page.evaluate(() => window.HW_TEST_API.startTestScenario('bat'));
    assert(batScenario.targetObject === 'bat', 'The normal Bat should retain its focused Test scenario.');
    await page.waitForTimeout(220);
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'lamp-style-bat.png') });

    await page.evaluate(() => window.HW_TEST_API.startTestScenario('crawlingFire'));
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'lamp-style-crawling-fire.png') });
    const extinguishResult = await page.evaluate(async () => {
        const api = window.HW_TEST_API;
        const before = api.getState();
        api.moveToCell(1, 0);
        await new Promise((resolve) => setTimeout(resolve, 120));
        const after = api.getState();
        return {
            waterBefore: before.player.water,
            waterAfter: after.player.water,
            targetObject: api.getCellObject(1, 0),
            attacksMade: after.metrics.attacksMade,
            popupColors: api.getStatPopups().map((popup) => popup.color)
        };
    });
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'tactical-water-counter.png') });
    assert(extinguishResult.waterAfter === extinguishResult.waterBefore - 1, 'Water should extinguish Crawling Fire when the player interacts with it.');
    assert(extinguishResult.targetObject === 'empty', 'Extinguished Crawling Fire should leave an empty cell.');
    assert(extinguishResult.attacksMade === 0, 'Extinguishing Crawling Fire should be a resource action, not a sting attack.');
    assert(!extinguishResult.popupColors.includes('#ff8a72'), 'Water costs should use utility blue instead of reserved danger red.');

    const lampResult = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        for (const direction of dirs) {
            const lamp = window.getCell(player.q + direction.q, player.r + direction.r);
            const target = window.getCell(player.q + direction.q * 2, player.r + direction.r * 2);
            if (lamp && target) {
                api.setCellObject(lamp.q, lamp.r, 'lampCell', true);
                api.setCellObject(target.q, target.r, 'pollen', false);
                api.inspectCell(target.q, target.r);
                return api.getCellData(target.q, target.r);
            }
        }
        throw new Error('No lamp lighting route available for smoke test.');
    });
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'lamp-cell.png') });
    assert(lampResult.litByLamp === true, 'Lamp cells should softly light adjacent hidden cells.');
    assert(lampResult.revealed === false, 'Lamp light should not fully reveal adjacent cells until explored.');
    assert(await page.locator('#inspectPanel:not(.hidden)').count() === 1, 'Lamp-lit objects should be inspectable.');

    const mistMoveResult = await page.evaluate(async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const target = dirs
            .map((direction) => window.getCell(player.q + direction.q, player.r + direction.r))
            .find(Boolean);
        if (!target) throw new Error('No adjacent mist movement target available.');
        api.setCellObject(target.q, target.r, 'empty', false);
        api.setTacticalState({ movePoints: 1, maxMovePoints: 1, actionAvailable: true });
        api.moveToCell(target.q, target.r);
        await wait(450);
        const state = api.getState();
        return {
            player: { q: state.player.q, r: state.player.r },
            target: { q: target.q, r: target.r },
            cell: api.getCellData(target.q, target.r)
        };
    });
    assert(mistMoveResult.player.q === mistMoveResult.target.q && mistMoveResult.player.r === mistMoveResult.target.r, 'The bee should be able to step into hidden empty mist cells.');
    assert(mistMoveResult.cell.revealed === true, 'Stepping into mist should reveal the destination.');

    const positionalCombat = await page.evaluate(async () => {
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const api = window.HW_TEST_API;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const cells = api.getCells();
        const setup = cells.map((target) => {
            const front = dirs
                .map((direction) => window.getCell(target.q - direction.q, target.r - direction.r))
                .find(Boolean);
            const flank = dirs
                .map((direction) => window.getCell(target.q + direction.q, target.r + direction.r))
                .find((cell) => cell && (!front || cell.q !== front.q || cell.r !== front.r));
            return front && flank ? { target, front, flank } : null;
        }).find(Boolean);
        if (!setup) throw new Error('No positional combat setup cells available.');

        api.setCellObject(setup.front.q, setup.front.r, 'empty', true);
        api.setCellObject(setup.flank.q, setup.flank.r, 'empty', true);
        api.setPlayerPosition(setup.front.q, setup.front.r);
        api.setCellObject(setup.target.q, setup.target.r, 'thornBeetle', true);
        api.setTacticalState({ movePoints: 2, maxMovePoints: 2, actionAvailable: true });
        api.moveToCell(setup.target.q, setup.target.r);
        await wait(450);
        const frontBlocked = api.getCellData(setup.target.q, setup.target.r);

        api.setPlayerPosition(setup.flank.q, setup.flank.r);
        api.setTacticalState({ movePoints: 2, maxMovePoints: 2, actionAvailable: true });
        api.moveToCell(setup.target.q, setup.target.r);
        await wait(450);
        const flanked = api.getCellData(setup.target.q, setup.target.r);

        return {
            frontHits: frontBlocked.hits || 0,
            sideHits: flanked.hits || 0,
            object: flanked.object
        };
    });
    assert(positionalCombat.frontHits === 0, 'Armored enemies should block stings from their guarded front.');
    assert(positionalCombat.sideHits > positionalCombat.frontHits, 'Armored enemies should take damage when flanked from the side or back.');
    assert(positionalCombat.object === 'thornBeetle', 'Flanking one hit should damage, not instantly remove, thorn beetles.');

    await page.evaluate(() => {
        window.HW_TEST_API.startTestScenario('guardWasp');
        window.HW_TEST_API.inspectCell(1, 0);
    });
    const guardInspectText = await page.locator('#inspectPanel').textContent();
    assert(guardInspectText.includes('Push'), 'Guard Wasp inspect details should warn about forced movement.');
    const guardPush = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const distance = (a, b) => {
            const dq = a.q - b.q;
            const dr = a.r - b.r;
            return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
        };
        const guard = { q: 1, r: 0 };
        const destination = { q: 0, r: 1 };
        api.moveToCell(destination.q, destination.r);
        const player = api.getState().player;
        const landing = api.getCellData(player.q, player.r);
        return {
            destination,
            player: { q: player.q, r: player.r },
            distanceBefore: distance(destination, guard),
            distanceAfter: distance(player, guard),
            landingObject: landing.object,
            landingDamage: landing.detonateDamage,
            landingSource: landing.sourceEnemy,
            landingDelay: Math.round((landing.detonateAt || 0) - performance.now())
        };
    });
    assert(guardPush.distanceAfter > guardPush.distanceBefore, 'Guard Wasp attacks should push the bee one cell farther away.');
    assert(guardPush.player.q !== guardPush.destination.q || guardPush.player.r !== guardPush.destination.r, 'Forced movement should visibly change the bee position.');
    assert(guardPush.landingObject === 'bomberMarkedCell', 'Guard Wasp should mark the pushed landing cell as delayed danger.');
    assert(guardPush.landingDamage === 1, 'Guard Wasp landing warning should deal one damage if ignored.');
    assert(guardPush.landingSource === 'guardWasp', 'Guard Wasp landing warning should preserve its damage source.');
    assert(guardPush.landingDelay > 1400, 'Guard Wasp landing warning should leave a clear response window.');
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'guard-wasp-push.png') });

    const hivePressureSpawn = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const distance = (a, b) => {
            const dq = a.q - b.q;
            const dr = a.r - b.r;
            return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
        };
        api.startTestScenario('waspHive');
        const player = api.getState().player;
        const hive = api.getCells().find((cell) => cell.object === 'waspHive');
        const candidates = api.getCells().filter((cell) => (
            cell.object === 'empty'
            && distance(cell, hive) === 1
            && (cell.q !== player.q || cell.r !== player.r)
        ));
        const nearestDistance = Math.min(...candidates.map((cell) => distance(cell, player)));
        const triggered = api.triggerEnemyTelegraph(hive.q, hive.r);
        const spawned = api.getCells().find((cell) => cell.object === 'enemy');
        return {
            triggered,
            spawnedDistance: spawned ? distance(spawned, player) : null,
            nearestDistance
        };
    });
    assert(hivePressureSpawn.triggered, 'Wasp Hive test scenario should trigger its reinforcement behavior.');
    assert(hivePressureSpawn.spawnedDistance === hivePressureSpawn.nearestDistance, 'Wasp Hive should place its reinforcement on the nearest legal cell to the bee.');
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'wasp-hive-pressure-spawn.png') });

    const stagChargeLane = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];
        const player = api.getState().player;
        const lane = dirs
            .map((direction) => ({
                near: window.getCell(player.q + direction.q, player.r + direction.r),
                far: window.getCell(player.q + direction.q * 2, player.r + direction.r * 2)
            }))
            .find((candidate) => candidate.near && candidate.far);
        if (!lane) throw new Error('No straight charge-lane route available for smoke test.');

        api.setCellObject(lane.near.q, lane.near.r, 'empty', true);
        api.setCellObject(lane.far.q, lane.far.r, 'stagBeetle', true);
        const triggered = api.triggerEnemyTelegraph(lane.far.q, lane.far.r);
        api.inspectCell(lane.far.q, lane.far.r);
        const marked = api.getCellData(lane.near.q, lane.near.r);
        return {
            triggered,
            laneObject: marked.object,
            laneRevealed: marked.revealed,
            laneDamage: marked.detonateDamage
        };
    });
    assert(stagChargeLane.triggered, 'Stag Beetle telegraph should be triggerable.');
    assert(stagChargeLane.laneObject === 'bomberMarkedCell', 'Stag Beetle should mark its facing lane.');
    assert(stagChargeLane.laneRevealed, 'Stag Beetle charge lane should be visible.');
    assert(stagChargeLane.laneDamage === 1, 'Stag Beetle charge lane should carry damage.');
    const stagInspectText = await page.locator('#inspectPanel').textContent();
    assert(stagInspectText.includes('Charge lane'), 'Stag Beetle inspect panel should explain charge lane.');

    const lessonRooms = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const distance = (a, b) => {
            const dq = a.q - b.q;
            const dr = a.r - b.r;
            return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
        };
        const dirs = [{ q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 }, { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }];

        api.setProgressionLevel(1);
        api.generateRoomAtDepth(2);
        const roomTwo = api.getState();
        const roomTwoCells = api.getCells();
        const roomTwoEntry = roomTwo.entryCell;
        const roomTwoExit = roomTwo.exitCell;
        const roomTwoDoors = roomTwoCells.filter((cell) => cell.object === 'waxDoor');
        const roomTwoPollenCells = roomTwoCells.filter((cell) => cell.object === 'pollen');
        const roomTwoExitNeighbors = roomTwoCells.filter((cell) => roomTwoExit && distance(cell, roomTwoExit) === 1);
        const roomTwoTraversableExitNeighbors = roomTwoExitNeighbors.filter((cell) => cell.object !== 'wall');
        const nearestRoomTwoPollen = roomTwoPollenCells.reduce((min, cell) => Math.min(min, distance(cell, roomTwoEntry)), Infinity);
        const nearestRoomTwoDoor = roomTwoDoors.reduce((min, cell) => Math.min(min, distance(cell, roomTwoEntry)), Infinity);

        api.generateRoomAtDepth(3);
        const roomThree = api.getState();
        const roomThreeCells = api.getCells();
        const roomThreeEntry = roomThree.entryCell;
        const enemies = roomThreeCells.filter((cell) => window.HW_TEST_API.isEnemyObject(cell.object));
        const nearestEnemyDistance = enemies.reduce((min, cell) => Math.min(min, distance(cell, roomThreeEntry)), Infinity);
        const thornGuard = enemies.find((cell) => cell.object === 'thornBeetle');
        const guardHasReadableSpace = enemies.some((enemy) => dirs.some((direction) => {
            const neighbor = roomThreeCells.find((cell) => cell.q === enemy.q + direction.q && cell.r === enemy.r + direction.r);
            return neighbor && neighbor.object === 'empty' && (neighbor.revealed || neighbor.litByLamp);
        }));
        const lessonSafeCells = roomThreeCells.filter((cell) => cell.lessonSafe);

        api.setProgressionLevel(1);
        api.setDungeonTheme('forest');
        api.generateRoomAtDepth(4);
        const roomFour = api.getState();
        const roomFourCells = api.getCells();
        const roomFourEntry = roomFour.entryCell;
        const roomFourExit = roomFour.exitCell;
        const burningCells = roomFourCells.filter((cell) => cell.object === 'burningCell');
        const waterCells = roomFourCells.filter((cell) => cell.object === 'water');
        const competingHazards = new Set(['vine', 'stickyTrap', 'waxDoor', 'burrowWarningCell', 'bomberMarkedCell']);
        const lessonObjects = new Set(['empty', 'entry', 'exit', 'finalExit', 'wall', 'water', 'burningCell']);
        const exitNeighbors = roomFourCells.filter((cell) => roomFourExit && distance(cell, roomFourExit) === 1);
        const traversableExitNeighbors = exitNeighbors.filter((cell) => cell.object !== 'wall');
        const nearestWaterDistance = waterCells.reduce((min, cell) => Math.min(min, distance(cell, roomFourEntry)), Infinity);
        const nearestFireDistance = burningCells.reduce((min, cell) => Math.min(min, distance(cell, roomFourEntry)), Infinity);

        return {
            roomTwoTemplate: roomTwo.roomTemplate,
            roomTwoObjective: roomTwo.roomObjective?.id,
            waxDoorNearExit: roomTwoDoors.some((cell) => roomTwoExit && distance(cell, roomTwoExit) === 1),
            roomTwoPollen: roomTwoPollenCells.length,
            roomTwoPollenBeforeDoor: nearestRoomTwoPollen < nearestRoomTwoDoor,
            roomTwoTraversableExitNeighborObjects: roomTwoTraversableExitNeighbors.map((cell) => cell.object),
            roomTwoExitRevealed: Boolean(roomTwoExit && roomTwoCells.find((cell) => cell.q === roomTwoExit.q && cell.r === roomTwoExit.r)?.revealed),
            roomThreeTemplate: roomThree.roomTemplate,
            roomThreeObjective: roomThree.roomObjective?.id,
            enemyCount: enemies.length,
            hasThornGuard: Boolean(thornGuard),
            thornGuardVisible: Boolean(thornGuard && (thornGuard.revealed || thornGuard.litByLamp)),
            thornGuardFocused: Boolean(thornGuard?.lessonGuard),
            nearestEnemyDistance,
            guardHasReadableSpace,
            lessonSafeCount: lessonSafeCells.length,
            lessonSafeNearGuard: lessonSafeCells.some((cell) => thornGuard && distance(cell, thornGuard) === 1),
            roomFourTemplate: roomFour.roomTemplate,
            roomFourObjective: roomFour.roomObjective?.id,
            roomFourEnemyCount: roomFourCells.filter((cell) => window.HW_TEST_API.isEnemyObject(cell.object)).length,
            burningCount: burningCells.length,
            competingHazardCount: roomFourCells.filter((cell) => competingHazards.has(cell.object)).length,
            burningNearExit: burningCells.some((cell) => roomFourExit && distance(cell, roomFourExit) === 1),
            exitNeighborCount: exitNeighbors.length,
            traversableExitNeighborObjects: traversableExitNeighbors.map((cell) => cell.object),
            roomFourWater: waterCells.length,
            unrelatedObjectCount: roomFourCells.filter((cell) => !lessonObjects.has(cell.object)).length,
            waterBeforeFire: nearestWaterDistance < nearestFireDistance,
            roomFourExitRevealed: Boolean(roomFourExit && roomFourCells.find((cell) => cell.q === roomFourExit.q && cell.r === roomFourExit.r)?.revealed)
        };
    });
    assert(lessonRooms.roomTwoTemplate === 'waxDoorPollen', 'Room 2 should use the wax door and pollen lesson template.');
    assert(lessonRooms.roomTwoObjective === 'openWaxDoor', 'Level-1 room 2 should explicitly teach spending pollen on the wax door.');
    assert(lessonRooms.waxDoorNearExit, 'Room 2 should place a wax door directly near the exit route.');
    assert(lessonRooms.roomTwoPollen >= 1, 'Room 2 should provide pollen for the wax door lesson.');
    assert(lessonRooms.roomTwoPollenBeforeDoor, 'Room 2 should provide pollen before the wax door gate.');
    assert(
        lessonRooms.roomTwoTraversableExitNeighborObjects.length === 1 && lessonRooms.roomTwoTraversableExitNeighborObjects[0] === 'waxDoor',
        'Room 2 should require opening the authored wax door to reach the exit.'
    );
    assert(lessonRooms.roomTwoExitRevealed, 'Room 2 should keep the exit visible while teaching pollen spending.');
    assert(lessonRooms.roomThreeTemplate === 'enemyGate', 'Room 3 should use the enemy gate lesson template.');
    assert(lessonRooms.roomThreeObjective === 'flankGuard', 'Level-1 room 3 should explicitly teach flanking its armored guard.');
    assert(lessonRooms.enemyCount >= 1, 'Room 3 should include a visible guard lesson.');
    assert(lessonRooms.hasThornGuard, 'Room 3 should teach the first armored positional guard.');
    assert(lessonRooms.thornGuardVisible, 'Room 3 armored guard should be visible before engagement.');
    assert(lessonRooms.thornGuardFocused, 'Room 3 armored guard should carry the authored lesson focus marker.');
    assert(lessonRooms.nearestEnemyDistance > 2, 'Room 3 guard should not start adjacent to the bee.');
    assert(lessonRooms.nearestEnemyDistance <= 4, `Room 3 guard should start inside the opening camera view; got distance ${lessonRooms.nearestEnemyDistance}.`);
    assert(lessonRooms.guardHasReadableSpace, 'Room 3 guard should expose at least one readable nearby route cell.');
    assert(lessonRooms.lessonSafeCount >= 1, 'Room 3 should mark at least one safe flank lesson cell.');
    assert(lessonRooms.lessonSafeNearGuard, 'Room 3 safe lesson cell should sit beside the armored guard.');
    assert(lessonRooms.roomFourTemplate === 'fireWater', 'Level-1 room 4 should use the water and fire lesson template.');
    assert(lessonRooms.roomFourObjective === 'crossFire', 'Room 4 objective should explicitly teach collecting water before crossing fire.');
    assert(lessonRooms.roomFourEnemyCount === 0, 'Room 4 should teach its first hazard without competing enemies.');
    assert(lessonRooms.burningCount === 1, 'Room 4 should contain one readable burning-cell gate.');
    assert(lessonRooms.competingHazardCount === 0, 'Room 4 should not mix competing hazards into the first fire lesson.');
    assert(lessonRooms.burningNearExit, 'Room 4 burning cell should guard the visible exit route.');
    assert(lessonRooms.exitNeighborCount >= 1, 'Room 4 exit should have at least one playable approach cell.');
    assert(
        lessonRooms.traversableExitNeighborObjects.length === 1 && lessonRooms.traversableExitNeighborObjects[0] === 'burningCell',
        'Room 4 should require crossing the authored burning cell to reach the exit.'
    );
    assert(lessonRooms.roomFourWater >= 1, 'Room 4 should supply the water required by its hazard lesson.');
    assert(lessonRooms.unrelatedObjectCount === 0, 'Room 4 should not crowd the first fire lesson with unrelated pickups.');
    assert(lessonRooms.waterBeforeFire, 'Room 4 should place water before the burning-cell gate.');
    assert(lessonRooms.roomFourExitRevealed, 'Room 4 should keep the exit visible while teaching water use.');
    const roomFourObjectiveCopy = await page.locator('[data-hud-id="objective"]').getAttribute('aria-label');
    assert(roomFourObjectiveCopy.includes('Collect water first'), 'Room 4 objective should explain the water-before-fire action in English.');
    await page.evaluate(() => window.setLanguage('es-419'));
    const roomFourObjectiveCopyEs = await page.locator('[data-hud-id="objective"]').getAttribute('aria-label');
    assert(roomFourObjectiveCopyEs.includes('Junta agua primero'), 'Room 4 objective should explain the water-before-fire action in Latin American Spanish.');
    await page.evaluate(() => window.setLanguage('en'));
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'first-run-room-four.png') });

    await page.evaluate(() => window.HW_TEST_API.generateRoomAtDepth(2));
    const roomTwoObjectiveCopy = await page.locator('[data-hud-id="objective"]').getAttribute('aria-label');
    assert(roomTwoObjectiveCopy.includes('Collect pollen first'), 'Room 2 objective should explain the pollen-before-door action in English.');
    await page.evaluate(() => window.setLanguage('es-419'));
    const roomTwoObjectiveCopyEs = await page.locator('[data-hud-id="objective"]').getAttribute('aria-label');
    assert(roomTwoObjectiveCopyEs.includes('Junta polen primero'), 'Room 2 objective should explain the pollen-before-door action in Latin American Spanish.');
    await page.evaluate(() => window.setLanguage('en'));
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'first-run-room-two.png') });

    await page.evaluate(() => window.HW_TEST_API.generateRoomAtDepth(3));
    const roomThreeObjectiveCopy = await page.locator('[data-hud-id="objective"]').getAttribute('aria-label');
    assert(roomThreeObjectiveCopy.includes('Move to a highlighted safe cell'), 'Room 3 objective should explain the safe-flank action in English.');
    await page.evaluate(() => window.setLanguage('es-419'));
    const roomThreeObjectiveCopyEs = await page.locator('[data-hud-id="objective"]').getAttribute('aria-label');
    assert(roomThreeObjectiveCopyEs.includes('Muevete a una celda segura resaltada'), 'Room 3 objective should explain the safe-flank action in Latin American Spanish.');
    await page.evaluate(() => window.setLanguage('en'));
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'first-run-room-three.png') });

    const themedTemplates = await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const defs = window.HW_ROOM_TEMPLATES.ROOM_TEMPLATE_DEFS;
        const themes = window.HW_PROGRESSION.DUNGEON_THEMES;
        const hazardObjects = new Set(['vine', 'burningCell', 'stickyTrap', 'waxDoor', 'burrowWarningCell', 'bomberMarkedCell']);
        const universalObjects = new Set(['empty', 'entry', 'exit', 'finalExit', 'wall']);
        const isAllowed = (theme, object) => {
            if (universalObjects.has(object)) return true;
            if (window.HW_CONTENT.ENEMY_DEFS[object]) return theme.enemies.includes(object);
            if (hazardObjects.has(object)) return theme.hazards.includes(object);
            return theme.items.includes(object);
        };

        api.setProgressionLevel(5);
        return Object.keys(themes).map((themeId) => {
            api.setDungeonTheme(themeId);
            api.generateRoomAtDepth(4);
            const state = api.getState();
            const template = defs[state.roomTemplate] || {};
            const requiredContent = [
                ...(template.requiredObjects || []),
                ...(template.requiredEnemies || []),
                ...(template.synergyEnemies || [])
            ];
            return {
                themeId,
                templateId: state.roomTemplate,
                requiredContent,
                compatible: requiredContent.every((object) => isAllowed(themes[themeId], object))
            };
        });
    });
    themedTemplates.forEach((entry) => {
        assert(entry.templateId, `Theme ${entry.themeId} should generate a room template.`);
        assert(entry.compatible, `Theme ${entry.themeId} generated incompatible template ${entry.templateId} requiring ${entry.requiredContent.join(', ')}.`);
    });

    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        api.generateRoomAtDepth(2);
        const waxDoor = api.getCells().find((cell) => cell.object === 'waxDoor');
        if (!waxDoor) throw new Error('No wax door found for inspect lesson smoke test.');
        api.setCellObject(waxDoor.q, waxDoor.r, 'waxDoor', true);
        api.inspectCell(waxDoor.q, waxDoor.r);
    });
    const waxDoorInspectText = await page.locator('#inspectPanel').textContent();
    assert(waxDoorInspectText.includes('Stop: blocker'), 'Wax door inspect panel should explain why route stops.');
    assert(waxDoorInspectText.includes('Lesson: save 1 pollen'), 'Wax door inspect panel should explain the pollen lesson.');

    await page.evaluate(() => {
        const api = window.HW_TEST_API;
        const player = api.getState().player;
        api.openMarketAt(player.q, player.r);
    });
    assert(await page.locator('#campScreen.visible').count() === 1, 'Market screen should open.');
    await assertDialogSemantics(page, '#campScreen', {
        labelledBy: 'campDialogTitle',
        describedBy: 'campDialogCopy'
    });
    assert(await page.locator('#campScreen .camp-action').count() > 0, 'Market should render buy choices.');
    assert(await page.locator('#campScreen .camp-action-cost').count() > 0, 'Market choices should show separated costs.');
    assert(await page.locator('#campScreen .camp-action-effect').count() > 0, 'Market choices should show separated effects.');
    await page.click('#campContinueButton');
    await page.waitForFunction(() => !document.querySelector('#campScreen.visible'));

    const bossPressure = await page.evaluate(() => {
        window.HW_TEST_API.setDungeonTheme('cave');
        window.HW_TEST_API.generateBossRoom();
        const hives = window.HW_TEST_API.getCells().filter((cell) => cell.object === 'waspHive');
        const state = window.HW_TEST_API.getState();
        const configuredObjects = new Set(state.bossEncounter?.roomObjects.map((entry) => entry.object) || []);
        const ambientObjects = window.HW_TEST_API.getCells()
            .filter((cell) => !cell.isBoss && cell.object !== 'entry' && cell.object !== state.bossEncounter?.support)
            .map((cell) => cell.object);
        return {
            hiveCount: hives.length,
            spawnLimit: hives[0]?.spawnLimit,
            firstSpawnMs: Math.round((hives[0]?.nextAuraAt || 0) - performance.now()),
            bossEncounter: state.bossEncounter,
            disallowedAmbientObjects: ambientObjects.filter((object) => !configuredObjects.has(object))
        };
    });
    assert(bossPressure.bossEncounter?.themeId === 'cave', 'Boss room should use the active theme encounter profile.');
    assert(bossPressure.bossEncounter?.boss === 'queenSignaler', 'Theme encounter should expose its configured boss.');
    assert(bossPressure.bossEncounter?.support === 'waspHive', 'Theme encounter should expose its configured support threat.');
    assert(bossPressure.disallowedAmbientObjects.length === 0, 'Boss room ambient objects should come from the active theme encounter pool.');
    await page.screenshot({ path: path.join(root, '.codex-video-frames', 'themed-boss-room.png') });
    assert(bossPressure.hiveCount === 1, 'Boss room should keep a single readable hive threat.');
    assert(bossPressure.spawnLimit === 1, 'Boss hive should spawn at most one reinforcement.');
    assert(bossPressure.firstSpawnMs > 1700 && bossPressure.firstSpawnMs < 2600, 'Boss hive should threaten one reinforcement within its normal cadence.');
    const bossDurability = await page.evaluate(() => {
        const boss = window.HW_TEST_API.getCells().find((cell) => cell.isBoss);
        const neighbor = window.HW_TEST_API.getCells().find((cell) => (
            cell.object === 'empty'
            && Math.max(
                Math.abs(cell.q - boss.q),
                Math.abs(cell.r - boss.r),
                Math.abs((cell.q + cell.r) - (boss.q + boss.r))
            ) === 1
        ));
        window.HW_TEST_API.setPlayerPosition(neighbor.q, neighbor.r);
        window.HW_TEST_API.setTacticalState({ movePoints: 2, maxMovePoints: 2, actionAvailable: true });
        window.HW_TEST_API.moveToCell(boss.q, boss.r);
        return {
            state: window.HW_TEST_API.getState(),
            boss: window.HW_TEST_API.getCellData(boss.q, boss.r)
        };
    });
    assert(!bossDurability.state.ended, 'Boss should survive the first successful sting.');
    assert(bossDurability.boss?.hits === 1, 'Boss should record the first successful sting.');
    assert(bossDurability.boss?.bossHp === bossDurability.state.bossEncounter?.hitsRequired, 'Boss runtime durability should match its theme encounter profile.');

    const completedRunState = await page.evaluate(() => {
        window.HW_TEST_API.endRun('boss-defeated');
        return window.HW_TEST_API.getState();
    });
    assert(completedRunState.ended === true, 'Test API should expose when a run has ended.');
    assert(completedRunState.endReason === 'boss-defeated', 'Test API should expose why a run ended.');

    assert(!logs.some((line) => line.startsWith('pageerror:')), `Browser errors found:\n${logs.join('\n')}`);
    await browser.close();
    console.log('Browser smoke checks passed');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
