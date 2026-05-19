// Cell interaction classification and small walkover behaviors.
(() => {
const NON_COLLECT_OBJECTS = new Set([
    'waxDoor',
    'npc',
    'entry',
    'exit',
    'finalExit',
    'vine',
    'burningCell',
    'wall',
    'stickyTrap',
    'burrowWarningCell',
    'bomberMarkedCell'
]);

const FREE_WALKOVER_OBJECTS = new Set([
    'empty',
    'entry',
    'stickyTrap',
    'burrowWarningCell',
    'bomberMarkedCell',
    'lampCell'
]);

function createCellInteractionSystem(options = {}) {
    const { objects } = options;
    const moveHandlers = new Map();

    function isCollectOnMoveObject(object, isEnemyObject) {
        return Boolean(objects[object]?.effects?.length)
            && !isEnemyObject(object)
            && !NON_COLLECT_OBJECTS.has(object);
    }

    function isFreeWalkoverObject(object) {
        return FREE_WALKOVER_OBJECTS.has(object);
    }

    function handleWalkoverObject(object, context) {
        if (object !== 'lampCell') return false;
        const {
            cell,
            game,
            currentLanguage,
            revealAround,
            updateLampLightFields,
            addLog,
            recordReplayEvent,
            updateObjectiveProgress,
            endPlayerTurn,
            draw
        } = context;
        revealAround(cell.q, cell.r, Math.max(3, game.revealRadius + 1));
        updateLampLightFields?.();
        game.message = currentLanguage === 'es-419'
            ? 'La lampara abre la niebla cercana.'
            : 'The lamp opens the nearby mist.';
        addLog(objects[object].name, game.message);
        recordReplayEvent('playerAction', { object, q: cell.q, r: cell.r, action: 'reveal' });
        updateObjectiveProgress();
        if (!game.autoPath.length) endPlayerTurn('move');
        draw();
        return true;
    }

    return {
        isCollectOnMoveObject,
        isFreeWalkoverObject,
        handleWalkoverObject,
        registerMoveHandler: (object, handler) => moveHandlers.set(object, handler),
        getMoveHandler: (object) => moveHandlers.get(object) || null
    };
}

window.HW_CELL_INTERACTIONS = {
    createCellInteractionSystem
};
})();
