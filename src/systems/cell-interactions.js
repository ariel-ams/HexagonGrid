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

const INTERACTION_RULES = {
    empty: {
        role: 'safe',
        action: 'move',
        cursor: { symbol: '.', color: '#fff2a7' }
    },
    entry: {
        role: 'route',
        action: 'entrySealed',
        cursor: { symbol: '>', color: '#f2bd4b' }
    },
    exit: {
        role: 'route',
        action: 'nextRoom',
        cursor: { symbol: '>', color: '#f2bd4b' }
    },
    finalExit: {
        role: 'route',
        action: 'finalDance',
        cursor: { symbol: '>', color: '#f2bd4b' }
    },
    npc: {
        role: 'trade',
        action: 'trade',
        cursor: { symbol: '$', color: '#64b5f6' }
    },
    waxDoor: {
        role: 'blocker',
        action: 'waxDoor',
        cursor: { symbol: 'D', color: '#d6b25f' }
    },
    wall: {
        role: 'blocker',
        action: 'wall',
        cursor: { symbol: 'X', color: '#7c8780' }
    },
    vine: {
        role: 'hazard',
        detail: 'vine',
        action: 'crossHazard',
        cursor: { symbol: '!', color: '#78a94e' }
    },
    burningCell: {
        role: 'hazard',
        detail: 'burningCell',
        action: 'crossHazard',
        cursor: { symbol: '!', color: '#ff6a2a' }
    },
    stickyTrap: {
        role: 'control',
        action: 'move',
        cursor: { symbol: '.', color: '#fff2a7' }
    },
    burrowWarningCell: {
        role: 'control',
        action: 'move',
        cursor: { symbol: '.', color: '#fff2a7' }
    },
    bomberMarkedCell: {
        role: 'control',
        action: 'move',
        cursor: { symbol: '.', color: '#fff2a7' }
    },
    lampCell: {
        role: 'control',
        action: 'move',
        cursor: { symbol: '.', color: '#fff2a7' }
    }
};

function createCellInteractionSystem(options = {}) {
    const { objects } = options;
    const moveHandlers = new Map();

    function getInteractionRule(object) {
        return INTERACTION_RULES[object] || {
            role: 'item',
            action: 'collect',
            cursor: { symbol: '+', color: '#fff2a7' }
        };
    }

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
        getInteractionRule,
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
