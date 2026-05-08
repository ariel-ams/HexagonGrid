// Shared content and balance data for Honeycomb Wayfinder.
(() => {
const I18N = {
    en: {
        ui: {
            title: 'Honeycomb Wayfinder',
            objective: 'Guide the bee through misty honeycomb chambers. Start by collecting pollen, water, and shield, avoid danger rings, use the sting only when it is ready, spend supplies between rooms, then finish the run by matching the final food dance.',
            language: 'Language',
            languageSettings: 'Language Settings',
            newRun: 'New Run',
            startNewRun: 'Start New Run',
            testDance: 'Test Dance',
            options: 'Options',
            mainMenu: 'Main Menu',
            beeStats: 'Bee Stats',
            relics: 'Relics',
            gameLog: 'Game Log',
            restart: 'Restart Draft',
            chooseRelic: 'Choose a Relic',
            chooseRelicCopy: 'The next chamber forms after the bee claims one reward.',
            runComplete: 'Run Complete',
            runCompleteCopy: 'The bee found the final exit.',
            objectEditor: 'Object Editor',
            objectEditorCopy: 'Tune objects and enemies locally. Changes are saved on this device.',
            objectToEdit: 'Object to edit',
            saveObject: 'Save Object',
            resetObject: 'Reset Object',
            name: 'Name',
            description: 'Description',
            color: 'Color',
            hp: 'HP',
            attack: 'Attack',
            range: 'Range',
            intervalMs: 'Interval ms',
            saved: 'Saved',
            reset: 'Reset',
            noneYet: 'None yet',
            ready: 'Sting ready',
            locked: 'Sting locked',
            avoidEnemies: 'Avoid enemy cells until it refills',
            cooldown: 'Cooldown',
            chooseNeighbor: 'Choose a highlighted neighboring cell.',
            relicChoiceMessage: 'Choose one relic to shape the next chamber.',
            danceMessage: 'Click when the pulse reaches the step border. Green is perfect, blue is good, and misses lower the music and multiplier.',
            runCompleteMessage: 'Run complete.',
            deadMessage: 'The run is over. Restart the draft.',
            blockedNotAdjacent: 'Move next to that cell first.',
            blockedHidden: 'That cell is still hidden by mist.',
            blockedCooldown: 'Sting is cooling down.',
            blockedWaxDoor: 'Wax door needs 1 pollen or a ready sting.',
            blockedStamina: 'The bee is tired. Wait a moment for stamina.',
            blockedGeneric: 'That action cannot be performed yet.',
            stamina: 'Stamina',
            staminaHint: 'Spent on actions, regenerates quickly',
            honey: 'Honey',
            honeyHint: 'Can recover stamina',
            replay: 'Replay'
        },
        stats: {
            health: ['Health', 'Keep this above zero'],
            pollen: ['Pollen', 'Trade with beetles'],
            water: ['Water', 'Small recovery source'],
            shield: ['Shield', 'Blocks incoming damage'],
            doubleSting: ['Double Sting', 'One-use bat finisher'],
            room: ['Room', 'Dungeon depth'],
            dance: ['Dance', 'misses left'],
            steps: ['Steps', 'Cells moved']
        },
        roles: {
            safe: 'Safe movement',
            hazard: 'Hazard',
            trade: 'Trade | Costs 1 pollen and 1 water',
            route: 'Route',
            blocker: 'Blocker',
            control: 'Control terrain',
            item: 'Item',
            mist: 'Mist',
            unrevealed: 'Unrevealed cell',
            revealHelp: 'Move closer or collect reveal items to learn what is here.'
        },
        actions: {
            moveNext: 'Move next to this cell to interact.',
            waitSting: 'Action: wait for sting cooldown.',
            sting: 'Action: sting.',
            openPollen: 'Action: spend 1 pollen to open.',
            openSting: 'Action: open with a ready sting.',
            crossHazard: 'Action: cross and take thorn damage.',
            trade: 'Action: trade if you have pollen and water.',
            nextRoom: 'Action: choose a relic and enter the next room.',
            finalDance: 'Action: begin the final dance.',
            previousRoom: 'Action: return to the previous room.',
            move: 'Action: move.',
            collect: 'Action: collect.'
        },
        objects: {
            empty: ['Open Cell', 'Move here safely.'],
            npc: ['Trade Beetle', 'Reduces sting cooldown.'],
            upgrade: ['Shield Upgrade', 'Improves your scout.'],
            stingUpgrade: ['Double Sting', 'One-use stronger sting.'],
            pollen: ['Pollen', 'Adds pollen.'],
            water: ['Water', 'Adds water.'],
            vine: ['Vines', 'Persistent thorny hazard.'],
            glowPollen: ['Glow Pollen', 'Reveals a wide patch of mist around this cell.'],
            nectarCache: ['Nectar Cache', 'Grants pollen and water together.'],
            honeyDrop: ['Honey Drop', 'Restores health and adds honey for stamina recovery.'],
            cleanWater: ['Clean Water', 'Cleanses nearby pressure and restores a little health.'],
            smokePuff: ['Smoke Puff', 'Pauses enemy timers for a short escape window.'],
            sunShard: ['Sun Shard', 'Reveals every enemy in the current room.'],
            flowerMap: ['Flower Map', 'Reveals a rough route toward the exit.'],
            royalNectar: ['Royal Nectar', 'Rare recovery. Heals now, or grants permanent health if already full.'],
            waxDoor: ['Wax Door', 'Blocks movement. Spend 1 pollen or a ready sting to open it.'],
            wall: ['Stone Wall', 'Blocks movement. Find a door or another route.'],
            stickyHoney: ['Sticky Honey', 'Leaves sticky honey behind that slows nearby moving enemies.'],
            stickyTrap: ['Sticky Patch', 'Moving enemies near this patch lose momentum.'],
            compassPollen: ['Compass Pollen', 'Reveals the exit through the mist.'],
            entry: ['Entry', 'Return to the previous room.'],
            exit: ['Exit', 'Open the next room.'],
            finalExit: ['Final Exit', 'End the run.']
        },
        enemies: {
            enemy: ['Wasp', 'Stationary aura. Deals damage every 0.5s while adjacent.', 'Do not linger next to it while sting is cooling down.'],
            bat: ['Bat', 'Pursues the bee after each move. Attacks every 1s when adjacent.', 'Use Double Sting or plan two safe hits.'],
            miteSwarm: ['Mite Swarm', 'Slow pursuer. Moves every 2 bee steps and nips when adjacent.', 'Cheap to kill, dangerous if ignored in groups.'],
            thornBeetle: ['Thorn Beetle', 'Armored blocker. Deals thorn damage while you stand near it.', 'Clear it before crossing narrow routes or it will tax your shield.'],
            fogMoth: ['Fog Moth', 'Stationary pressure. Re-hides distant revealed cells when you linger nearby.', 'Fight it before scouting routes around it.'],
            waxMoth: ['Wax Moth', 'Steals 1 pollen when adjacent, then tries to flee.', 'Do not carry pollen past it unless your sting is ready.'],
            broodWasp: ['Brood Wasp', 'Spawns mite swarms if left alive too long.', 'Prioritize it before the room fills with small threats.'],
            stagBeetle: ['Stag Beetle', 'Heavy blocker with a wider warning zone.', 'Its slow aura punishes greedy pathing through chokepoints.'],
            falseFlower: ['False Flower', 'Looks like pollen until close, then bites with a hidden aura.', 'Inspect rewards carefully when the route feels too generous.'],
            guardWasp: ['Guard Wasp', 'Stationary guard. Its larger aura reaches 2 cells.', 'Check your route before entering its zone.'],
            sleepingBat: ['Sleeping Bat', 'Sleeps until the bee gets close, then wakes and pursues.', 'Skirt around it unless the reward is worth waking it.'],
            honeyLeech: ['Honey Leech', 'Stationary drain. Chews through shield first, then health.', 'Shield is not permanent safety near this enemy.']
        },
        relics: {
            waxArmor: ['Wax Armor', 'Gain +4 shield at the start of each room.'],
            sharpStinger: ['Sharp Stinger', 'The first sting in each room has no cooldown.'],
            goldenAntennae: ['Golden Antennae', 'The exit direction is revealed through the mist.'],
            royalJelly: ['Royal Jelly', 'Every 3 pollen collected heals +3 health.'],
            mistpiercerWings: ['Mistpiercer Wings', 'Reveal radius increases from 2 to 3.'],
            storedVenom: ['Stored Venom', 'Start each room with +1 Double Sting.']
        }
    },
    'es-419': {
        ui: {
            title: 'Guía del Panal',
            objective: 'Guía a la abeja por cámaras llenas de niebla. Empieza juntando polen, agua y escudo, evita los anillos de peligro, usa el aguijón solo cuando esté listo, gasta suministros entre salas y termina la partida siguiendo el baile final hacia la comida.',
            language: 'Idioma',
            languageSettings: 'Configuración de idioma',
            newRun: 'Nueva partida',
            startNewRun: 'Empezar otra partida',
            testDance: 'Probar baile',
            options: 'Opciones',
            mainMenu: 'Menú principal',
            beeStats: 'Stats de la abeja',
            relics: 'Reliquias',
            gameLog: 'Registro',
            restart: 'Reiniciar borrador',
            chooseRelic: 'Elige una reliquia',
            chooseRelicCopy: 'La siguiente cámara aparece cuando la abeja reclama una recompensa.',
            runComplete: 'Partida completa',
            runCompleteCopy: 'La abeja encontró la salida final.',
            objectEditor: 'Editor de objetos',
            objectEditorCopy: 'Ajusta objetos y enemigos localmente. Los cambios se guardan en este dispositivo.',
            objectToEdit: 'Objeto a editar',
            saveObject: 'Guardar objeto',
            resetObject: 'Restablecer objeto',
            name: 'Nombre',
            description: 'Descripción',
            color: 'Color',
            hp: 'Vida',
            attack: 'Ataque',
            range: 'Rango',
            intervalMs: 'Intervalo ms',
            saved: 'Guardado',
            reset: 'Restablecido',
            noneYet: 'Todavía ninguna',
            ready: 'Aguijón listo',
            locked: 'Aguijón bloqueado',
            avoidEnemies: 'Evita enemigos hasta que se recargue',
            cooldown: 'Recarga',
            chooseNeighbor: 'Elige una celda vecina resaltada.',
            relicChoiceMessage: 'Elige una reliquia para definir la siguiente cámara.',
            danceMessage: 'Haz clic cuando el pulso llegue al borde del paso. Verde es perfecto, azul es bueno, y fallar baja la música y el multiplicador.',
            runCompleteMessage: 'Partida completa.',
            deadMessage: 'La partida terminó. Reinicia el borrador.',
            blockedNotAdjacent: 'Primero acércate a esa celda.',
            blockedHidden: 'Esa celda todavía está cubierta por niebla.',
            blockedCooldown: 'El aguijón se está recargando.',
            blockedWaxDoor: 'La puerta de cera necesita 1 polen o un aguijón listo.',
            blockedStamina: 'La abeja está cansada. Espera un momento para recuperar stamina.',
            blockedGeneric: 'Esa acción todavía no se puede realizar.',
            stamina: 'Stamina',
            staminaHint: 'Se gasta en acciones y se regenera rápido',
            honey: 'Miel',
            honeyHint: 'Puede recuperar stamina',
            replay: 'Repetición'
        },
        stats: {
            health: ['Salud', 'Mantenla arriba de cero'],
            pollen: ['Polen', 'Sirve para comerciar'],
            water: ['Agua', 'Recuperación pequeña'],
            shield: ['Escudo', 'Bloquea daño recibido'],
            doubleSting: ['Aguijón doble', 'Remata murciélagos una vez'],
            room: ['Sala', 'Profundidad del dungeon'],
            dance: ['Baile', 'fallos restantes'],
            steps: ['Pasos', 'Celdas recorridas']
        },
        roles: {
            safe: 'Movimiento seguro',
            hazard: 'Peligro',
            trade: 'Intercambio | Cuesta 1 polen y 1 agua',
            route: 'Ruta',
            blocker: 'Bloqueo',
            control: 'Terreno de control',
            item: 'Objeto',
            mist: 'Niebla',
            unrevealed: 'Celda sin revelar',
            revealHelp: 'Acércate o junta objetos de revelado para saber qué hay aquí.'
        },
        actions: {
            moveNext: 'Muévete junto a esta celda para interactuar.',
            waitSting: 'Acción: espera la recarga del aguijón.',
            sting: 'Acción: atacar con aguijón.',
            openPollen: 'Acción: gastar 1 polen para abrir.',
            openSting: 'Acción: abrir con un aguijón listo.',
            crossHazard: 'Acción: cruzar y recibir daño de espinas.',
            trade: 'Acción: comerciar si tienes polen y agua.',
            nextRoom: 'Acción: elegir reliquia y entrar a la siguiente sala.',
            finalDance: 'Acción: empezar el baile final.',
            previousRoom: 'Acción: volver a la sala anterior.',
            move: 'Acción: moverse.',
            collect: 'Acción: recoger.'
        },
        objects: {
            empty: ['Celda abierta', 'Puedes moverte aquí sin peligro.'],
            npc: ['Escarabajo comerciante', 'Reduce la recarga del aguijón.'],
            upgrade: ['Mejora de escudo', 'Mejora a tu exploradora.'],
            stingUpgrade: ['Aguijón doble', 'Un aguijón más fuerte de un solo uso.'],
            pollen: ['Polen', 'Suma polen.'],
            water: ['Agua', 'Suma agua.'],
            vine: ['Enredaderas', 'Peligro persistente con espinas.'],
            glowPollen: ['Polen brillante', 'Revela una zona amplia de niebla alrededor de esta celda.'],
            nectarCache: ['Reserva de néctar', 'Otorga polen y agua juntos.'],
            honeyDrop: ['Gota de miel', 'Restaura salud y suma miel para recuperar stamina.'],
            cleanWater: ['Agua limpia', 'Limpia presión cercana y restaura un poco de salud.'],
            smokePuff: ['Nube de humo', 'Pausa los temporizadores enemigos por una ventana corta de escape.'],
            sunShard: ['Fragmento solar', 'Revela todos los enemigos de la sala actual.'],
            flowerMap: ['Mapa floral', 'Revela una ruta aproximada hacia la salida.'],
            royalNectar: ['Néctar real', 'Recuperación rara. Cura ahora o da salud permanente si ya estás al máximo.'],
            waxDoor: ['Puerta de cera', 'Bloquea el paso. Gasta 1 polen o un aguijón listo para abrirla.'],
            wall: ['Muro de piedra', 'Bloquea el paso. Busca una puerta u otra ruta.'],
            stickyHoney: ['Miel pegajosa', 'Deja miel en el panal y ralentiza enemigos cercanos.'],
            stickyTrap: ['Parche pegajoso', 'Los enemigos que se mueven cerca pierden impulso.'],
            compassPollen: ['Polen brújula', 'Revela la salida a través de la niebla.'],
            entry: ['Entrada', 'Vuelve a la sala anterior.'],
            exit: ['Salida', 'Abre la siguiente sala.'],
            finalExit: ['Salida final', 'Termina la partida.']
        },
        enemies: {
            enemy: ['Avispa', 'Aura fija. Hace daño cada 0.5s mientras estás al lado.', 'No te quedes cerca mientras el aguijón se recarga.'],
            bat: ['Murciélago', 'Persigue a la abeja después de cada movimiento. Ataca cada 1s si está al lado.', 'Usa Aguijón doble o planea dos golpes seguros.'],
            miteSwarm: ['Enjambre de ácaros', 'Perseguidor lento. Se mueve cada 2 pasos y muerde si está al lado.', 'Es fácil de matar, pero peligroso en grupo.'],
            thornBeetle: ['Escarabajo espinoso', 'Bloqueador con armadura. Hace daño de espinas mientras estás cerca.', 'Límpialo antes de cruzar rutas estrechas o consumirá tu escudo.'],
            fogMoth: ['Polilla de niebla', 'Presión fija. Vuelve a ocultar celdas reveladas lejanas si te quedas cerca.', 'Derrótala antes de explorar rutas a su alrededor.'],
            waxMoth: ['Polilla de cera', 'Roba 1 polen si está cerca y luego intenta escapar.', 'No lleves polen junto a ella salvo que el aguijón esté listo.'],
            broodWasp: ['Avispa nodriza', 'Genera enjambres de ácaros si la ignoras demasiado.', 'Priorízala antes de que la sala se llene de amenazas pequeñas.'],
            stagBeetle: ['Escarabajo ciervo', 'Bloqueador pesado con una zona de advertencia más amplia.', 'Su aura lenta castiga rutas codiciosas por cuellos de botella.'],
            falseFlower: ['Flor falsa', 'Parece polen hasta que te acercas, luego muerde con un aura oculta.', 'Inspecciona las recompensas cuando la ruta parezca demasiado generosa.'],
            guardWasp: ['Avispa guardia', 'Guardia fija. Su aura más grande llega a 2 celdas.', 'Revisa tu ruta antes de entrar en su zona.'],
            sleepingBat: ['Murciélago dormido', 'Duerme hasta que la abeja se acerca, luego despierta y persigue.', 'Rodéalo salvo que la recompensa valga despertarlo.'],
            honeyLeech: ['Sanguijuela de miel', 'Drenaje fijo. Come escudo primero y luego salud.', 'El escudo no es seguridad permanente cerca de este enemigo.']
        },
        relics: {
            waxArmor: ['Armadura de cera', 'Gana +4 escudo al inicio de cada sala.'],
            sharpStinger: ['Aguijón afilado', 'El primer aguijón de cada sala no tiene recarga.'],
            goldenAntennae: ['Antenas doradas', 'La dirección de la salida se revela a través de la niebla.'],
            royalJelly: ['Jalea real', 'Cada 3 polen recogidos cura +3 salud.'],
            mistpiercerWings: ['Alas antiniebla', 'El radio de revelado aumenta de 2 a 3.'],
            storedVenom: ['Veneno guardado', 'Empieza cada sala con +1 Aguijón doble.']
        }
    }
};

const RELICS = [
    {
        id: 'waxArmor',
        name: 'Wax Armor',
        description: 'Gain +4 shield at the start of each room.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => addShield(4, 'Wax Armor')
    },
    {
        id: 'sharpStinger',
        name: 'Sharp Stinger',
        description: 'The first sting in each room has no cooldown.',
        minDepth: 1,
        rarity: 'common',
        apply: () => {
            game.roomFirstStingAvailable = true;
        },
        onRoomStart: () => {
            game.roomFirstStingAvailable = true;
        }
    },
    {
        id: 'goldenAntennae',
        name: 'Golden Antennae',
        description: 'The exit direction is revealed through the mist.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => revealExitHint()
    },
    {
        id: 'royalJelly',
        name: 'Royal Jelly',
        description: 'Every 3 pollen collected heals +3 health.',
        minDepth: 1,
        rarity: 'common'
    },
    {
        id: 'mistpiercerWings',
        name: 'Mistpiercer Wings',
        description: 'Reveal radius increases from 2 to 3.',
        minDepth: 1,
        rarity: 'common',
        apply: () => {
            game.revealRadius = 3;
            revealAroundPlayer();
        }
    },
    {
        id: 'storedVenom',
        name: 'Stored Venom',
        description: 'Start each room with +1 Double Sting.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => {
            game.player.stingCharges += 1;
            addLog('Stored Venom', 'Gained +1 Double Sting.');
        }
    }
];

const SPRITE_DEFS = {
    playerIdle: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 0, frameMs: 180 },
    playerAttack: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 1, frameMs: 120 },
    enemy: { src: 'assets/wasp-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 180 },
    bat: { src: 'assets/bat-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    npc: { src: 'assets/bettle-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    thornBeetle: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'TB' },
    fogMoth: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'FM' },
    waxMoth: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'WM' },
    broodWasp: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'BW' },
    stagBeetle: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'SB' },
    falseFlower: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'FF' },
    pollen: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    water: { src: 'assets/water_drop-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    upgrade: { src: 'assets/shield-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    stingUpgrade: { src: 'assets/sting-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    vine: { src: 'assets/vines-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    wall: { src: '', columns: 1, rows: 1, row: 0, frameMs: 180, fallback: 'W' },
    glowPollen: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 150 },
    nectarCache: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    honeyDrop: { src: '', columns: 1, rows: 1, row: 0, frameMs: 230, fallback: 'HN' },
    cleanWater: { src: '', columns: 1, rows: 1, row: 0, frameMs: 200, fallback: 'CW' },
    smokePuff: { src: '', columns: 1, rows: 1, row: 0, frameMs: 200, fallback: 'SM' },
    sunShard: { src: '', columns: 1, rows: 1, row: 0, frameMs: 200, fallback: 'SUN' },
    flowerMap: { src: '', columns: 1, rows: 1, row: 0, frameMs: 200, fallback: 'MAP' },
    royalNectar: { src: '', columns: 1, rows: 1, row: 0, frameMs: 200, fallback: 'RN' },
    stickyHoney: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 260 },
    compassPollen: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    entry: { src: 'assets/entry-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    exit: { src: 'assets/exit-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    finalExit: { src: 'assets/exit-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 140 }
};

const ENEMY_DEFS = {
    enemy: {
        name: 'Wasp',
        color: '#d95c50',
        sprite: 'enemy',
        hp: 1,
        attack: 1,
        intervalMs: 500,
        range: 1,
        behavior: 'Stationary aura. Deals damage every 0.5s while adjacent.',
        lesson: 'Do not linger next to it while sting is cooling down.',
        behaviors: [{ type: 'damageAura' }]
    },
    bat: {
        name: 'Bat',
        color: '#8b6bd6',
        sprite: 'bat',
        hp: 2,
        attack: 1,
        intervalMs: 1000,
        range: 1,
        behavior: 'Pursues the bee after each move. Attacks every 1s when adjacent.',
        lesson: 'Use Double Sting or plan two safe hits.',
        behaviors: [{ type: 'biteAdjacent' }, { type: 'moveTowardPlayer' }]
    },
    miteSwarm: {
        name: 'Mite Swarm',
        color: '#c98954',
        sprite: 'enemy',
        hp: 1,
        attack: 1,
        intervalMs: 900,
        range: 1,
        behavior: 'Slow pursuer. Moves every 2 bee steps and nips when adjacent.',
        lesson: 'Cheap to kill, dangerous if ignored in groups.',
        behaviors: [{ type: 'damageAura' }, { type: 'moveEverySteps', stepInterval: 2 }]
    },
    thornBeetle: {
        name: 'Thorn Beetle',
        color: '#8f6d3a',
        sprite: 'thornBeetle',
        hp: 2,
        attack: 1,
        intervalMs: 1000,
        range: 1,
        behavior: 'Armored blocker. Deals thorn damage while you stand near it.',
        lesson: 'Clear it before crossing narrow routes or it will tax your shield.',
        behaviors: [{ type: 'damageAura' }]
    },
    fogMoth: {
        name: 'Fog Moth',
        color: '#8fb8c8',
        sprite: 'fogMoth',
        hp: 1,
        attack: 0,
        intervalMs: 1200,
        range: 2,
        behavior: 'Stationary pressure. Re-hides distant revealed cells when you linger nearby.',
        lesson: 'Fight it before scouting routes around it.',
        behaviors: [{ type: 'refogAura' }]
    },
    waxMoth: {
        name: 'Wax Moth',
        color: '#d7c58b',
        sprite: 'waxMoth',
        hp: 1,
        attack: 0,
        intervalMs: 900,
        range: 1,
        behavior: 'Steals 1 pollen when adjacent, then tries to flee.',
        lesson: 'Do not carry pollen past it unless your sting is ready.',
        behaviors: [{ type: 'stealResourceAura', resource: 'pollen', amount: 1 }, { type: 'fleeFromPlayer' }]
    },
    broodWasp: {
        name: 'Brood Wasp',
        color: '#d15a72',
        sprite: 'broodWasp',
        hp: 2,
        attack: 1,
        intervalMs: 1500,
        range: 1,
        behavior: 'Spawns mite swarms if left alive too long.',
        lesson: 'Prioritize it before the room fills with small threats.',
        behaviors: [{ type: 'spawnEnemyAura', object: 'miteSwarm' }, { type: 'damageAura', fallbackOnly: true }]
    },
    stagBeetle: {
        name: 'Stag Beetle',
        color: '#6c5542',
        sprite: 'stagBeetle',
        hp: 3,
        attack: 1,
        intervalMs: 1400,
        range: 2,
        behavior: 'Heavy blocker with a wider warning zone.',
        lesson: 'Its slow aura punishes greedy pathing through chokepoints.',
        behaviors: [{ type: 'damageAura' }]
    },
    falseFlower: {
        name: 'False Flower',
        color: '#ef6f9d',
        sprite: 'falseFlower',
        hp: 1,
        attack: 1,
        intervalMs: 800,
        range: 1,
        behavior: 'Looks like pollen until close, then bites with a hidden aura.',
        lesson: 'Inspect rewards carefully when the route feels too generous.',
        behaviors: [{ type: 'damageAura' }, { type: 'disguiseAs', object: 'pollen', revealRange: 1 }]
    },
    guardWasp: {
        name: 'Guard Wasp',
        color: '#b83f4a',
        sprite: 'enemy',
        hp: 2,
        attack: 2,
        intervalMs: 1200,
        range: 2,
        behavior: 'Stationary guard. Its larger aura reaches 2 cells.',
        lesson: 'Check your route before entering its zone.',
        behaviors: [{ type: 'damageAura' }]
    },
    sleepingBat: {
        name: 'Sleeping Bat',
        color: '#6c5a9d',
        sprite: 'bat',
        hp: 2,
        attack: 1,
        intervalMs: 1000,
        range: 1,
        behavior: 'Sleeps until the bee gets close, then wakes and pursues.',
        lesson: 'Skirt around it unless the reward is worth waking it.',
        behaviors: [{ type: 'wakeOnRange', range: 2 }, { type: 'biteAdjacent' }, { type: 'moveTowardPlayer' }]
    },
    honeyLeech: {
        name: 'Honey Leech',
        color: '#9467a8',
        sprite: 'enemy',
        hp: 2,
        attack: 1,
        intervalMs: 850,
        range: 1,
        behavior: 'Stationary drain. Chews through shield first, then health.',
        lesson: 'Shield is not permanent safety near this enemy.',
        behaviors: [{ type: 'damageAura' }]
    }
};

const OBJECTS = {
    empty: {
        name: 'Open Cell',
        color: '#3c544d',
        description: 'Move here safely.'
    },
    enemy: {
        name: ENEMY_DEFS.enemy.name,
        color: ENEMY_DEFS.enemy.color,
        description: ENEMY_DEFS.enemy.behavior
    },
    bat: {
        name: ENEMY_DEFS.bat.name,
        color: ENEMY_DEFS.bat.color,
        description: ENEMY_DEFS.bat.behavior
    },
    miteSwarm: {
        name: ENEMY_DEFS.miteSwarm.name,
        color: ENEMY_DEFS.miteSwarm.color,
        description: ENEMY_DEFS.miteSwarm.behavior
    },
    thornBeetle: {
        name: ENEMY_DEFS.thornBeetle.name,
        color: ENEMY_DEFS.thornBeetle.color,
        description: ENEMY_DEFS.thornBeetle.behavior
    },
    fogMoth: {
        name: ENEMY_DEFS.fogMoth.name,
        color: ENEMY_DEFS.fogMoth.color,
        description: ENEMY_DEFS.fogMoth.behavior
    },
    waxMoth: {
        name: ENEMY_DEFS.waxMoth.name,
        color: ENEMY_DEFS.waxMoth.color,
        description: ENEMY_DEFS.waxMoth.behavior
    },
    broodWasp: {
        name: ENEMY_DEFS.broodWasp.name,
        color: ENEMY_DEFS.broodWasp.color,
        description: ENEMY_DEFS.broodWasp.behavior
    },
    stagBeetle: {
        name: ENEMY_DEFS.stagBeetle.name,
        color: ENEMY_DEFS.stagBeetle.color,
        description: ENEMY_DEFS.stagBeetle.behavior
    },
    falseFlower: {
        name: ENEMY_DEFS.falseFlower.name,
        color: ENEMY_DEFS.falseFlower.color,
        description: ENEMY_DEFS.falseFlower.behavior
    },
    guardWasp: {
        name: ENEMY_DEFS.guardWasp.name,
        color: ENEMY_DEFS.guardWasp.color,
        description: ENEMY_DEFS.guardWasp.behavior
    },
    sleepingBat: {
        name: ENEMY_DEFS.sleepingBat.name,
        color: ENEMY_DEFS.sleepingBat.color,
        description: ENEMY_DEFS.sleepingBat.behavior
    },
    honeyLeech: {
        name: ENEMY_DEFS.honeyLeech.name,
        color: ENEMY_DEFS.honeyLeech.color,
        description: ENEMY_DEFS.honeyLeech.behavior
    },
    npc: {
        name: 'Trade Beetle',
        color: '#64b5f6',
        description: 'Reduces sting cooldown.',
        effects: [{ type: 'tradeCooldown', pollen: 1, water: 1, cooldownMs: 100 }]
    },
    upgrade: {
        name: 'Shield Upgrade',
        color: '#b787f4',
        description: 'Improves your scout.',
        effects: [{ type: 'gainShield', amount: 1 }]
    },
    stingUpgrade: {
        name: 'Double Sting',
        color: '#f28f3b',
        description: 'One-use stronger sting.',
        effects: [{ type: 'gainResource', resource: 'stingCharges', amount: 1 }]
    },
    pollen: {
        name: 'Pollen',
        color: '#5fc77e',
        description: 'Adds pollen.',
        effects: [{ type: 'gainResource', resource: 'pollen', amount: 1, runStat: true }, { type: 'royalJelly' }]
    },
    water: {
        name: 'Water',
        color: '#4bb6f2',
        description: 'Adds water.',
        effects: [{ type: 'gainResource', resource: 'water', amount: 1, runStat: true }, { type: 'heal', amount: 2 }]
    },
    vine: {
        name: 'Vines',
        color: '#547b3d',
        description: 'Persistent thorny hazard.'
    },
    glowPollen: {
        name: 'Glow Pollen',
        color: '#7ee6a5',
        description: 'Reveals a wide patch of mist around this cell.',
        effects: [{ type: 'revealAround', radius: 4 }]
    },
    nectarCache: {
        name: 'Nectar Cache',
        color: '#f0a64f',
        description: 'Grants pollen and water together.',
        effects: [
            { type: 'gainResource', resource: 'pollen', amount: 1, runStat: true },
            { type: 'gainResource', resource: 'water', amount: 1, runStat: true },
            { type: 'gainResource', resource: 'honey', amount: 1, runStat: true },
            { type: 'heal', amount: 1 }
        ]
    },
    honeyDrop: {
        name: 'Honey Drop',
        color: '#f2b544',
        description: 'Restores health and adds honey for stamina recovery.',
        effects: [{ type: 'gainResource', resource: 'honey', amount: 1, runStat: true }, { type: 'heal', amount: 2 }]
    },
    cleanWater: {
        name: 'Clean Water',
        color: '#9ee7ff',
        description: 'Cleanses nearby pressure and restores a little health.',
        effects: [{ type: 'heal', amount: 1 }, { type: 'pauseEnemyTimers', durationMs: 1400, radius: 2 }]
    },
    smokePuff: {
        name: 'Smoke Puff',
        color: '#c9ced1',
        description: 'Pauses enemy timers for a short escape window.',
        effects: [{ type: 'pauseEnemyTimers', durationMs: 2400, radius: 99 }]
    },
    sunShard: {
        name: 'Sun Shard',
        color: '#ffd166',
        description: 'Reveals every enemy in the current room.',
        effects: [{ type: 'revealEnemies' }]
    },
    flowerMap: {
        name: 'Flower Map',
        color: '#82d173',
        description: 'Reveals a rough route toward the exit.',
        effects: [{ type: 'revealExitRoute' }]
    },
    royalNectar: {
        name: 'Royal Nectar',
        color: '#ff9fcb',
        description: 'Rare recovery. Heals now, or grants permanent health if already full.',
        effects: [{ type: 'royalNectar', heal: 4 }]
    },
    waxDoor: {
        name: 'Wax Door',
        color: '#d6b25f',
        description: 'Blocks movement. Spend 1 pollen or a ready sting to open it.'
    },
    wall: {
        name: 'Stone Wall',
        color: '#65716a',
        description: 'Blocks movement. Find a door or another route.'
    },
    stickyHoney: {
        name: 'Sticky Honey',
        color: '#d68c39',
        description: 'Leaves sticky honey behind that slows nearby moving enemies.',
        effects: [{ type: 'gainResource', resource: 'honey', amount: 1, runStat: true }, { type: 'slowNearbyEnemies', radius: 2, durationMs: 1400 }, { type: 'transformCell', object: 'stickyTrap' }]
    },
    stickyTrap: {
        name: 'Sticky Patch',
        color: '#9a6a32',
        description: 'Moving enemies near this patch lose momentum.'
    },
    compassPollen: {
        name: 'Compass Pollen',
        color: '#f7df72',
        description: 'Reveals the exit through the mist.',
        effects: [{ type: 'revealExitHint' }]
    },
    entry: {
        name: 'Entry',
        color: '#45b17a',
        description: 'Return to the previous room.'
    },
    exit: {
        name: 'Exit',
        color: '#f2bd4b',
        description: 'Open the next room.'
    },
    finalExit: {
        name: 'Final Exit',
        color: '#fff2a7',
        description: 'End the run.'
    }
};

const DEFAULT_OBJECT_COLORS = Object.fromEntries(Object.entries(OBJECTS).map(([id, object]) => [id, object.color]));
const DEFAULT_ENEMY_NUMBERS = Object.fromEntries(Object.entries(ENEMY_DEFS).map(([id, enemy]) => [id, {
    hp: enemy.hp,
    attack: enemy.attack,
    range: enemy.range,
    intervalMs: enemy.intervalMs
}]));

const DISCOVERY_OBJECT_WEIGHTS = [
    { object: 'glowPollen', weight: 4 },
    { object: 'nectarCache', weight: 4 },
    { object: 'honeyDrop', weight: 3 },
    { object: 'cleanWater', weight: 3 },
    { object: 'smokePuff', weight: 2 },
    { object: 'sunShard', weight: 1 },
    { object: 'flowerMap', weight: 2 },
    { object: 'royalNectar', weight: 1 },
    { object: 'waxDoor', weight: 3 },
    { object: 'stickyHoney', weight: 3 },
    { object: 'compassPollen', weight: 2 }
];

const ENEMY_SPAWN_WEIGHTS = [
    { object: 'enemy', minDepth: 1, weight: 7 },
    { object: 'miteSwarm', minDepth: 1, weight: 5 },
    { object: 'thornBeetle', minDepth: 1, weight: 4 },
    { object: 'falseFlower', minDepth: 1, weight: 3 },
    { object: 'waxMoth', minDepth: 2, weight: 4 },
    { object: 'fogMoth', minDepth: 2, weight: 3 },
    { object: 'guardWasp', minDepth: 2, weight: 4 },
    { object: 'sleepingBat', minDepth: 2, weight: 3 },
    { object: 'honeyLeech', minDepth: 3, weight: 4 },
    { object: 'broodWasp', minDepth: 3, weight: 3 },
    { object: 'stagBeetle', minDepth: 4, weight: 3 }
];

window.HW_CONTENT = {
    I18N,
    RELICS,
    SPRITE_DEFS,
    ENEMY_DEFS,
    OBJECTS,
    DEFAULT_OBJECT_COLORS,
    DEFAULT_ENEMY_NUMBERS,
    DISCOVERY_OBJECT_WEIGHTS,
    ENEMY_SPAWN_WEIGHTS
};
})();

