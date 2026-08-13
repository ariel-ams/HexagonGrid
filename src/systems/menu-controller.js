// Pause, options, and test-menu UI controller.
(() => {
function createMenuController(context) {
    const {
        nodes,
        game,
        getLanguage,
        stopAllMusic,
        startGameplayMusic,
        applyAudioSettings,
        audioSystem,
        modalFocusManager,
        renderTestObjectList,
        renderMessage,
        onTestPauseLabel
    } = context;

    function openTestMenu() {
        stopAllMusic();
        renderTestObjectList();
        nodes.optionsPanel.classList.remove('visible');
        nodes.startScreen.classList.add('hidden');
        nodes.testScreen.querySelector('h2').textContent = getLanguage() === 'es-419' ? 'Escenario de prueba' : 'Test Scenario';
        nodes.testScreen.querySelector('p').textContent = getLanguage() === 'es-419'
            ? 'Elige un objeto para crear una sala enfocada en esa interaccion.'
            : 'Choose an object to build a focused interaction room.';
        nodes.testScreen.classList.add('visible');
        modalFocusManager.focusFirst(nodes.testScreen, '[data-test-object]');
    }

    function closeTestMenu() {
        nodes.testScreen.classList.remove('visible');
        nodes.startScreen.classList.remove('hidden');
        modalFocusManager.restoreFocus(nodes.testLauncher);
    }

    function returnToTestList() {
        stopAllMusic();
        game.ended = true;
        game.mode = 'menu';
        game.isTestScenario = false;
        game.testPaused = false;
        game.activeTestObject = null;
        nodes.testControls.classList.remove('visible');
        renderTestObjectList();
        nodes.startScreen.classList.add('hidden');
        nodes.testScreen.classList.add('visible');
        modalFocusManager.focusFirst(nodes.testScreen, '[data-test-object]');
    }

    function toggleTestPause() {
        if (!game.isTestScenario) return;
        game.testPaused = !game.testPaused;
        onTestPauseLabel(game.testPaused);
        if (game.testPaused) {
            audioSystem.pauseAll();
        } else {
            startGameplayMusic();
        }
    }

    function showMainMenu() {
        stopAllMusic();
        game.ended = true;
        game.mode = 'menu';
        game.dance = null;
        game.playerMotion = null;
        nodes.relicScreen.classList.remove('visible');
        nodes.campScreen.classList.remove('visible');
        nodes.testScreen.classList.remove('visible');
        nodes.testControls.classList.remove('visible');
        nodes.endScreen.classList.remove('visible');
        nodes.startScreen.classList.remove('hidden');
        renderMessage();
    }

    function openSettingsOverlay() {
        game.settingsPaused = true;
        applyAudioSettings();
        nodes.settingsScreen?.classList.add('visible');
        audioSystem.pauseAll();
        modalFocusManager.focusFirst(nodes.settingsScreen, '#settingsCloseButton');
    }

    function closeSettingsOverlay() {
        game.settingsPaused = false;
        nodes.settingsScreen?.classList.remove('visible');
        audioSystem.resumeActive();
        modalFocusManager.restoreFocus(nodes.settingsToggle);
    }

    function toggleOptions() {
        nodes.optionsPanel.classList.toggle('visible');
    }

    return {
        openTestMenu,
        closeTestMenu,
        returnToTestList,
        toggleTestPause,
        showMainMenu,
        openSettingsOverlay,
        closeSettingsOverlay,
        toggleOptions
    };
}

window.HW_MENU_CONTROLLER = {
    createMenuController
};
})();
