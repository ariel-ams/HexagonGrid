// Room objectives and teaching/gating placement for Honeycomb Wayfinder.
(() => {
const ROOM_OBJECTIVES = [
    {
        id: 'findExit',
        minDepth: 1,
        label: { en: 'Reach the exit', 'es-419': 'Llega a la salida' },
        hint: { en: 'The exit is visible. Plan a route and step onto it.', 'es-419': 'La salida esta visible. Planea una ruta y pisa esa celda.' },
        isComplete: ({ game }) => game.objectiveProgress.exitReached
    },
    {
        id: 'collectTwo',
        minDepth: 1,
        label: { en: 'Collect 2 supplies', 'es-419': 'Junta 2 suministros' },
        hint: { en: 'Pollen and water fuel camp choices.', 'es-419': 'El polen y el agua activan opciones de campamento.' },
        isComplete: ({ game }) => game.objectiveProgress.supplies >= 2
    },
    {
        id: 'keepShield',
        minDepth: 2,
        label: { en: 'Reach the exit with shield', 'es-419': 'Llega a la salida con escudo' },
        hint: { en: 'Shield blocks the next mistake.', 'es-419': 'El escudo bloquea el proximo error.' },
        isComplete: ({ game }) => game.objectiveProgress.exitReached && game.player.upgrades > 0
    },
    {
        id: 'avoidDamage',
        minDepth: 2,
        label: { en: 'Avoid damage this room', 'es-419': 'Evita dano en esta sala' },
        hint: { en: 'Leave danger rings before timers fill.', 'es-419': 'Sal de los anillos de peligro antes de que se llenen.' },
        isComplete: ({ game }) => game.objectiveProgress.exitReached && !game.objectiveProgress.tookDamage
    },
    {
        id: 'defeatEnemy',
        minDepth: 3,
        label: { en: 'Defeat 1 enemy', 'es-419': 'Derrota 1 enemigo' },
        hint: { en: 'Sting, retreat, then sting again if needed.', 'es-419': 'Pica, retrocede y vuelve a picar si hace falta.' },
        isComplete: ({ game }) => game.objectiveProgress.kills >= 1
    }
];

function createRoomTemplateSystem(context) {
    const {
        game,
        directions,
        seededRandom,
        randomFrom,
        getCell,
        hexDistance,
        isEnemyObject,
        getPlayerLevel,
        getObjectUnlockLevel,
        getRoomProfile,
        chooseWeightedObject,
        cellKey,
        awardObjectiveXp,
        addObjectivePopup,
        getLanguage
    } = context;

    function chooseRoomObjective() {
        const options = ROOM_OBJECTIVES.filter((objective) => game.roomDepth >= objective.minDepth);
        if (game.roomDepth === 1) return decorateObjective(ROOM_OBJECTIVES.find((objective) => objective.id === 'findExit'));
        return decorateObjective(randomFrom(options));
    }

    function decorateObjective(objective) {
        return objective ? {
            ...objective,
            isComplete: () => objective.isComplete({ game })
        } : null;
    }

    function chooseRoomTemplate() {
        if (game.roomDepth === 1 && getPlayerLevel() === 1) return 'onboardingPath';
        if (game.roomDepth === 1) return 'introSupplies';
        if (game.roomDepth === 2) return 'waxDoorPollen';
        if (game.roomDepth === 3) return seededRandom() < 0.55 ? 'enemyGate' : 'fireWater';
        const candidates = [
            'mixedGate',
            'fireWater',
            'revealRoute',
            'hiveQueen',
            'fireLeech',
            'sentinelThief',
            'fogBurrow'
        ].filter((template) => isRoomTemplateUnlocked(template));
        return randomFrom(candidates.length ? candidates : ['mixedGate']);
    }

    function isRoomTemplateUnlocked(template) {
        const level = getPlayerLevel();
        const minLevel = {
            mixedGate: 3,
            fireWater: 3,
            revealRoute: 3,
            hiveQueen: 5,
            fireLeech: 4,
            sentinelThief: 5,
            fogBurrow: 5
        }[template] || 1;
        return level >= minLevel;
    }

    function updateObjectiveProgress() {
        if (!game.roomObjective || game.objectiveProgress.rewarded) return;
        const exit = game.exitCell ? getCell(game.exitCell.q, game.exitCell.r) : null;
        game.objectiveProgress.exitSeen = Boolean(exit?.revealed);
        if (!game.roomObjective.isComplete()) return;

        game.objectiveProgress.rewarded = true;
        awardObjectiveXp();
        addObjectivePopup();
    }

    function applyFirstRunOnboardingTemplate() {
        if (game.roomDepth !== 1 || getPlayerLevel() > 1 || !game.entryCell || !game.exitCell) return;
        const route = findRoomPathBetween(game.entryCell, game.exitCell);
        if (route.length < 7) return;
        game.roomTemplate = 'onboardingPath';
        route.slice(0, 7).forEach((step) => {
            const cell = getCell(step.q, step.r);
            if (cell && cell.object !== 'entry' && cell.object !== 'exit') cell.object = 'empty';
        });
        ['pollen', 'water', 'lampCell', 'upgrade'].forEach((object, index) => {
            const cell = getCell(route[index + 1].q, route[index + 1].r);
            if (cell && cell.object === 'empty') cell.object = object;
        });
        const enemyStep = route[Math.min(route.length - 2, 6)];
        const distantEnemy = enemyStep ? getCell(enemyStep.q, enemyStep.r) : null;
        if (distantEnemy && distantEnemy.object === 'empty' && game.roomSpawnCounts.enemies < game.roomProfile.maxEnemies) {
            distantEnemy.object = 'enemy';
            distantEnemy.nextAuraAt = 0;
            distantEnemy.hits = 0;
            game.roomSpawnCounts.enemies += 1;
        }
    }

    function placeFirstRoomTeachingPickups() {
        if (game.roomDepth !== 1) return;
        const candidates = game.cells
            .filter((cell) => (
                cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 2
                && !(cell.q === game.player.q && cell.r === game.player.r)
                && !(cell.q === game.exitCell.q && cell.r === game.exitCell.r)
            ))
            .sort((a, b) => hexDistance(a.q, a.r, game.player.q, game.player.r) - hexDistance(b.q, b.r, game.player.q, game.player.r));

        ['pollen', 'water', 'upgrade'].forEach((object, index) => {
            const cell = candidates[index];
            if (cell) cell.object = object;
        });
    }

    function placeRoomLessonGate(template = 'mixedGate') {
        if (!game.exitCell || game.roomDepth <= 1) return;
        if (template === 'waxDoorPollen') {
            placeWaxDoorExitGate();
            placeResourceNearPlayer('pollen');
            return;
        }
        if (template === 'enemyGate') {
            placeEnemyExitGate('enemy');
            placeResourceNearPlayer('pollen');
            return;
        }
        if (template === 'fireWater') {
            placeFireWaterExitGate();
            placeResourceNearPlayer('water');
            return;
        }
        if (template === 'revealRoute') {
            placeRevealRouteLesson();
            return;
        }
        placeMixedExitGate();
    }

    function placeEnemySynergy(template) {
        const pairs = {
            hiveQueen: ['waspHive', 'queenSignaler'],
            fireLeech: ['crawlingFire', 'waterLeech'],
            sentinelThief: ['waxSentinel', 'pollenThiefMoth'],
            fogBurrow: ['fogShepherd', 'burrowBeetle']
        };
        const pair = pairs[template];
        if (!pair || pair.some((object) => getObjectUnlockLevel(object) > getPlayerLevel())) return;
        const anchor = game.cells
            .filter((cell) => cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 4
                && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 1)
            .sort((a, b) => hexDistance(a.q, a.r, game.exitCell.q, game.exitCell.r) - hexDistance(b.q, b.r, game.exitCell.q, game.exitCell.r))[0];
        if (!anchor) return;
        anchor.object = pair[0];
        anchor.nextAuraAt = performance.now() + 900;
        anchor.hits = 0;
        game.roomSpawnCounts.enemies += 1;

        const partner = directions
            .map((direction) => getCell(anchor.q + direction.q, anchor.r + direction.r))
            .filter((cell) => cell && cell.object === 'empty' && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 3)[0];
        if (!partner) return;
        partner.object = pair[1];
        partner.nextAuraAt = performance.now() + 900;
        partner.hits = 0;
        game.roomSpawnCounts.enemies += 1;
    }

    function placeWaxDoorExitGate() {
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        const gate = neighbors[0];
        if (!gate) return;
        gate.object = 'waxDoor';
        game.roomSpawnCounts.hazards += 1;
        neighbors.slice(1, 4).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeEnemyExitGate(enemyObject = 'enemy') {
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        const guard = neighbors[0];
        if (!guard) return;
        guard.object = enemyObject;
        guard.nextAuraAt = 0;
        guard.nextAttackAt = 0;
        guard.hits = 0;
        game.roomSpawnCounts.enemies += 1;
        neighbors.slice(1, 3).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeMixedExitGate() {
        const profile = getRoomProfile();
        const enemy = profile.allowedEnemies.includes('guardWasp') && getObjectUnlockLevel('guardWasp') <= getPlayerLevel()
            ? 'guardWasp'
            : 'enemy';
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        const guard = neighbors[0];
        if (guard) {
            guard.object = enemy;
            guard.nextAuraAt = 0;
            guard.nextAttackAt = 0;
            guard.hits = 0;
            game.roomSpawnCounts.enemies += 1;
        }
        const door = neighbors[1];
        if (door) {
            door.object = 'waxDoor';
            game.roomSpawnCounts.hazards += 1;
            placeResourceNearPlayer('pollen');
        }
        neighbors.slice(2, 4).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeFireWaterExitGate() {
        const neighbors = getExitNeighborCells().filter(isGateCandidateCell)
            .sort((a, b) => hexDistance(a.q, a.r, game.entryCell.q, game.entryCell.r) - hexDistance(b.q, b.r, game.entryCell.q, game.entryCell.r));
        neighbors.slice(0, 2).forEach((cell) => {
            cell.object = 'burningCell';
            game.roomSpawnCounts.hazards += 1;
        });
        neighbors.slice(2, 4).forEach((cell) => {
            if (isGateCandidateCell(cell)) cell.object = 'wall';
        });
    }

    function placeRevealRouteLesson() {
        placeResourceNearPlayer('compassPollen');
        const routeCells = game.cells
            .filter((cell) => cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) > 3
                && hexDistance(cell.q, cell.r, game.exitCell.q, game.exitCell.r) > 2)
            .sort((a, b) => hexDistance(a.q, a.r, game.exitCell.q, game.exitCell.r) - hexDistance(b.q, b.r, game.exitCell.q, game.exitCell.r));
        routeCells.slice(0, 2).forEach((cell) => {
            cell.object = 'wall';
        });
    }

    function isGateCandidateCell(cell) {
        return Boolean(cell
            && cell.object !== 'entry'
            && cell.object !== 'exit'
            && cell.object !== 'finalExit'
            && !(cell.q === game.player.q && cell.r === game.player.r));
    }

    function getExitNeighborCells() {
        if (!game.exitCell) return [];
        return directions.map((direction) => getCell(game.exitCell.q + direction.q, game.exitCell.r + direction.r)).filter(Boolean);
    }

    function placeResourceNearPlayer(object) {
        const target = game.cells
            .filter((cell) => (
                cell.object === 'empty'
                && hexDistance(cell.q, cell.r, game.player.q, game.player.r) <= 3
                && !(cell.q === game.player.q && cell.r === game.player.r)
            ))
            .sort((a, b) => hexDistance(a.q, a.r, game.player.q, game.player.r) - hexDistance(b.q, b.r, game.player.q, game.player.r))[0];
        if (target) target.object = object;
    }

    function findRoomPathBetween(start, target) {
        const available = new Set(game.currentRoomCells.map((cell) => cellKey(cell.q, cell.r)));
        const queue = [{ q: start.q, r: start.r, path: [] }];
        const visited = new Set([cellKey(start.q, start.r)]);
        while (queue.length) {
            const current = queue.shift();
            if (current.q === target.q && current.r === target.r) return current.path;
            directions.forEach((direction) => {
                const next = { q: current.q + direction.q, r: current.r + direction.r };
                const key = cellKey(next.q, next.r);
                if (!available.has(key) || visited.has(key)) return;
                visited.add(key);
                queue.push({ q: next.q, r: next.r, path: [...current.path, next] });
            });
        }
        return [];
    }

    function getRoomObjectiveText() {
        if (!game.roomObjective) return '';
        const language = getLanguage() === 'es-419' ? 'es-419' : 'en';
        const status = game.roomObjective.isComplete() ? 'OK ' : '';
        return `${status}${game.roomObjective.label[language]} - ${game.roomObjective.hint[language]}`;
    }

    return {
        chooseRoomObjective,
        chooseRoomTemplate,
        updateObjectiveProgress,
        getRoomObjectiveText,
        applyFirstRunOnboardingTemplate,
        placeFirstRoomTeachingPickups,
        placeRoomLessonGate,
        placeEnemySynergy,
        findRoomPathBetween
    };
}

window.HW_ROOM_TEMPLATES = {
    createRoomTemplateSystem,
    ROOM_OBJECTIVES
};
})();
