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
    await page.addInitScript(() => {
        localStorage.removeItem('honeycombProgression');
        localStorage.setItem('honeycombLanguage', 'en');
        localStorage.setItem('honeycombDungeonTheme', 'forest');
    });

    await page.goto(gameUrl, { waitUntil: 'load' });
    await page.waitForFunction(() => window.HW_TEST_API && window.HW_TEST_API.areAssetsReady && window.HW_TEST_API.areAssetsReady());
    assert(await page.locator('#loadingScreen.ready').count() === 1, 'Loading screen should hide after assets are ready.');
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
    const startingEquipment = await page.evaluate(() => window.HW_TEST_API.getEquipment());
    assert(startingEquipment.helmet === 'waxScoutHelmet', 'New runs should equip the starter helmet.');
    assert(startingEquipment.jacket === 'leafJacket', 'New runs should equip the starter jacket.');
    assert(startingEquipment.abdomen === 'nectarPouch', 'New runs should equip the starter abdomen guard.');
    assert(startingEquipment.sting === 'barbedSting', 'New runs should equip the starter sting.');
    assert(startingEquipment.wings === 'scoutWings', 'New runs should equip the starter wings.');
    const initialRewardOverlay = await page.evaluate(() => window.HW_TEST_API.openRewardFlowForTest({ roomDepth: 2, level: 2 }));
    assert(initialRewardOverlay.visible, 'Reward overlay should open between rooms.');
    assert(initialRewardOverlay.rewardFlowSteps.join(',') === 'relic,equipment', 'Reward overlay should sequence relic rewards before equipment rewards.');
    assert(initialRewardOverlay.title === 'Choose a Relic', 'Reward overlay should start on the relic step.');
    assert(initialRewardOverlay.relicIds.length > 0, 'Reward overlay should render relic choices first.');
    await page.click('#relicChoices [data-relic-id]');
    await page.waitForFunction(() => window.HW_TEST_API.getRewardOverlayState().title === 'Choose Gear');
    const equipmentRewardOverlay = await page.evaluate(() => window.HW_TEST_API.getRewardOverlayState());
    assert(equipmentRewardOverlay.completedRewardSteps.includes('relic'), 'Reward overlay should mark the relic step complete before gear.');
    assert(equipmentRewardOverlay.equipmentIds.length > 0, 'Reward overlay should render eligible equipment choices after relic selection.');
    await page.click('#relicChoices [data-equipment-id]');
    await page.waitForFunction(() => !window.HW_TEST_API.getRewardOverlayState().visible);
    const selectedEquipmentOverlay = await page.evaluate(() => window.HW_TEST_API.getRewardOverlayState());
    assert(selectedEquipmentOverlay.roomDepth === 3, 'Completing reward flow should advance to the next room.');
    assert(Object.values(selectedEquipmentOverlay.equipment).some((id) => id && !Object.values(startingEquipment).includes(id)), 'Choosing gear should update one equipment slot.');

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
    const routeInspectText = await page.locator('#inspectPanel').textContent();
    assert(routeInspectText.includes('Route: costs'), 'Inspect panel should explain route movement cost.');
    assert(routeInspectText.includes('Result:') || routeInspectText.includes('Stop:'), 'Inspect panel should explain the route outcome.');

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

        api.generateRoomAtDepth(2);
        const roomTwo = api.getState();
        const roomTwoCells = api.getCells();
        const roomTwoExit = roomTwo.exitCell;
        const waxDoorNearExit = roomTwoCells.some((cell) => (
            cell.object === 'waxDoor'
            && roomTwoExit
            && distance(cell, roomTwoExit) === 1
        ));

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

        return {
            roomTwoTemplate: roomTwo.roomTemplate,
            waxDoorNearExit,
            roomTwoPollen: roomTwoCells.filter((cell) => cell.object === 'pollen').length,
            roomThreeTemplate: roomThree.roomTemplate,
            enemyCount: enemies.length,
            hasThornGuard: Boolean(thornGuard),
            thornGuardVisible: Boolean(thornGuard && (thornGuard.revealed || thornGuard.litByLamp)),
            nearestEnemyDistance,
            guardHasReadableSpace,
            lessonSafeCount: lessonSafeCells.length,
            lessonSafeNearGuard: lessonSafeCells.some((cell) => thornGuard && distance(cell, thornGuard) === 1)
        };
    });
    assert(lessonRooms.roomTwoTemplate === 'waxDoorPollen', 'Room 2 should use the wax door and pollen lesson template.');
    assert(lessonRooms.waxDoorNearExit, 'Room 2 should place a wax door directly near the exit route.');
    assert(lessonRooms.roomTwoPollen >= 1, 'Room 2 should provide pollen for the wax door lesson.');
    assert(lessonRooms.roomThreeTemplate === 'enemyGate', 'Room 3 should use the enemy gate lesson template.');
    assert(lessonRooms.enemyCount >= 1, 'Room 3 should include a visible guard lesson.');
    assert(lessonRooms.hasThornGuard, 'Room 3 should teach the first armored positional guard.');
    assert(lessonRooms.thornGuardVisible, 'Room 3 armored guard should be visible before engagement.');
    assert(lessonRooms.nearestEnemyDistance > 2, 'Room 3 guard should not start adjacent to the bee.');
    assert(lessonRooms.guardHasReadableSpace, 'Room 3 guard should expose at least one readable nearby route cell.');
    assert(lessonRooms.lessonSafeCount >= 1, 'Room 3 should mark at least one safe flank lesson cell.');
    assert(lessonRooms.lessonSafeNearGuard, 'Room 3 safe lesson cell should sit beside the armored guard.');

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
