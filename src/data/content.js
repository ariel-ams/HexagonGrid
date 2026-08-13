// Shared content and balance data for Honeycomb Wayfinder.
(() => {
const I18N = {
    en: {
        ui: {
            title: 'Honeycomb Wayfinder',
            objective: 'Guide the bee through misty honeycomb chambers. Start by collecting pollen, water, and shield, avoid danger rings, use the sting only when it is ready, spend supplies between rooms, then defeat the final boss.',
            language: 'Language',
            languageSettings: 'Language Settings',
            testingSettings: 'Testing',
            testingSettingsCopy: 'Reset saved bee progression to replay the first-run experience from level 1.',
            resetProgression: 'Reset Bee Level',
            progressionReset: 'Bee progression reset. The next run starts at level 1.',
            newRun: 'New Run',
            startNewRun: 'Start New Run',
            testDance: 'Test',
            options: 'Options',
            mainMenu: 'Main Menu',
            beeStats: 'Bee Stats',
            relics: 'Relics',
            equipment: 'Gear',
            gameLog: 'Game Log',
            restart: 'Restart Draft',
            chooseRelic: 'Choose a Relic',
            chooseRelicCopy: 'The next chamber forms after the bee claims one reward.',
            chooseEquipment: 'Choose Gear',
            chooseEquipmentCopy: 'Pick one wearable upgrade before entering the next chamber.',
            equipmentReplaces: 'Replaces',
            equipmentEmptySlot: 'Empty slot',
            runComplete: 'Run Complete',
            runCompleteCopy: 'The bee survived the dungeon.',
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
            cooldown: 'Action',
            chooseNeighbor: 'Choose a highlighted neighboring cell.',
            relicChoiceMessage: 'Choose one relic to shape the next chamber.',
            danceMessage: 'Click when the pulse reaches the step border. Green is perfect, blue is good, and misses lower the music and multiplier.',
            runCompleteMessage: 'Run complete.',
            deadMessage: 'The run is over. Restart the draft.',
            blockedNotAdjacent: 'Move next to that cell first.',
            blockedHidden: 'That cell is still hidden by mist.',
            blockedCooldown: 'Action already used this turn.',
            blockedWaxDoor: 'Wax door needs 1 pollen or a ready sting.',
            blockedStamina: 'No movement points left this turn.',
            blockedGeneric: 'That action cannot be performed yet.',
            stamina: 'Move',
            staminaHint: 'Cells the bee can move this turn',
            honey: 'Honey',
            honeyHint: 'Can buy tactical boosts',
            replay: 'Replay'
            ,settings: 'Settings'
            ,settingsCopy: 'Pause the run and adjust audio.'
            ,musicVolume: 'Music Volume'
            ,effectsVolume: 'Effects Volume'
            ,resume: 'Resume'
        },
        logs: {
            start: 'Start',
            exit: 'Exit',
            objective: 'Objective',
            finalBoss: 'Final Boss',
            stingCooldown: 'Sting Cooldown',
            gameOver: 'Game Over',
            bossDefeated: 'Boss Defeated',
            danceFailed: 'Dance Failed',
            runComplete: 'Run Complete'
        },
        messages: {
            startRun: 'Scout the dungeon, spend movement carefully, and use exits to crawl deeper.',
            enteredChamber: 'Entered chamber {room}.',
            bossStart: 'Final chamber: defeat the Queen Signaler while its hives keep calling wasps.',
            bossDefeated: 'The final boss fell. The run is complete.',
            danceFailed: 'The path to food faded. {percent}% complete.',
            runComplete: 'The run is complete.',
            gameOver: 'Game over. {source} ended the run.',
            pathLethal: 'That route would kill the bee. Find another path or recover shield/health.',
            pathLethalShort: ' Lethal route.',
            pathRisk: ' Risk: {damage} damage.',
            pathSteps: 'Path: {steps} steps.{danger}',
            blockedTarget: 'Path reaches the blocker. Move beside it, then interact.',
            stingCooldown: 'Action already used this turn.',
            testingDefault: 'Testing {name}. Hover it, then click the adjacent cell to interact.',
            testWaspHive: '{name}: wait beside it to see the hive release a wasp quickly.',
            testCrawlingFire: '{name}: click it while carrying water to extinguish it without using the sting.',
            crawlingFireExtinguished: 'Spent 1 water and extinguished the Crawling Fire.',
            testLarvaBrood: '{name}: wait beside it to see larvae hatch into mite swarms.',
            testHoneySnareSpider: '{name}: wait in range to see sticky traps appear around the route.',
            testCombBomber: '{name}: wait for orange marked cells, then step out before they detonate.',
            testBurrowBeetle: '{name}: wait for the cracked warning cell, then move away before it emerges.',
            testQueenSignaler: '{name}: a nearby wasp is present so its signal can accelerate a threat timer.',
            testFogShepherd: '{name}: several revealed cells are placed outside your radius so its mist can hide them again.',
            testWaterLeech: '{name}: compare water inside its blue drain range with the water farther away.',
            testMirrorWasp: '{name}: move in a direction and watch it copy that same direction if the path is open.',
            testWaxSentinel: '{name}: wait for the weak point window before stinging it.'
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
            waitSting: 'Action already used this turn.',
            sting: 'Action: sting.',
            openPollen: 'Action: spend 1 pollen to open.',
            openSting: 'Action: open with a ready sting.',
            crossHazard: 'Action: cross and take thorn damage.',
            trade: 'Action: trade if you have pollen and water.',
            nextRoom: 'Action: choose a relic and enter the next room.',
            finalDance: 'Action: face the final boss.',
            previousRoom: 'Action: return to the previous room.',
            move: 'Action: move.',
            collect: 'Action: collect.'
        },
        campActions: {
            heal: ['Drink Water', 'Cost: 1 water. Heal +2 health.'],
            shield: ['Pack Wax', 'Cost: 1 pollen. Repair +1 shield.'],
            map: ['Study Map', 'Cost: 1 honey. Reveal exit route next room.'],
            guard: ['Guard Comb', 'Cost: 1 pollen + 1 water. Start next room with +1 shield.'],
            scout: ['Scout Smoke', 'Cost: 1 pollen + 1 water. Reveal nearby enemies next room.'],
            rush: ['Sugar Rush', 'Cost: 1 honey. Start next room with +1 movement point.'],
            reroll: ['Sweet Bargain', 'Cost: 1 honey. Reroll upcoming relic choices.']
        },
        objects: {
            empty: ['Open Cell', 'Move here safely.'],
            npc: ['Trade Beetle', 'Opens a market with three supply trades.'],
            upgrade: ['Shield Upgrade', 'Improves your scout.'],
            stingUpgrade: ['Double Sting', 'One-use stronger sting.'],
            pollen: ['Pollen', 'Adds pollen.'],
            water: ['Water', 'Adds water.'],
            lampCell: ['Lamp Cell', 'Walk over it to reveal nearby hidden cells. It stays on the board.'],
            vine: ['Vines', 'Persistent thorny hazard.'],
            glowPollen: ['Glow Pollen', 'Reveals a wide patch of mist around this cell.'],
            nectarCache: ['Nectar Cache', 'Grants pollen and water together.'],
            honeyDrop: ['Honey Drop', 'Restores health and adds honey for tactical boosts.'],
            cleanWater: ['Clean Water', 'Cleanses nearby pressure and restores a little health.'],
            smokePuff: ['Smoke Puff', 'Pauses enemy timers for a short escape window.'],
            sunShard: ['Sun Shard', 'Reveals every enemy in the current room.'],
            flowerMap: ['Flower Map', 'Reveals a rough route toward the exit.'],
            royalNectar: ['Royal Nectar', 'Rare recovery. Heals now, or grants permanent health if already full.'],
            waxDoor: ['Wax Door', 'Blocks movement. Spend 1 pollen or a ready sting to open it.'],
            wall: ['Stone Wall', 'Blocks movement. Find a door or another route.'],
            stickyHoney: ['Sticky Honey', 'Leaves sticky honey behind that slows nearby moving enemies.'],
            stickyTrap: ['Sticky Patch', 'Moving enemies near this patch lose momentum.'],
            burningCell: ['Burning Cell', 'Lingering fire. Crossing it costs health unless you can spend water.'],
            burrowWarningCell: ['Burrow Warning', 'Cracked ground. A burrow beetle is about to emerge here.'],
            bomberMarkedCell: ['Marked Blast Cell', 'A comb bomber has marked this cell. Leave before the blast lands.'],
            compassPollen: ['Compass Pollen', 'Reveals the exit through the mist.'],
            entry: ['Entry', 'The chamber seals behind you. You cannot return to previous rooms.'],
            exit: ['Exit', 'Open the next room.'],
            finalExit: ['Final Boss', 'Defeat the final enemy to end the run.']
        },
        enemies: {
            enemy: ['Wasp', 'Stationary aura. Deals damage when turns end while adjacent.', 'Do not end your turn next to it unless you can block the damage.'],
            bat: ['Bat', 'Pursues the bee after each move. Attacks every 1s when adjacent.', 'Use Double Sting or plan two safe hits.'],
            miteSwarm: ['Mite Swarm', 'Slow pursuer. Moves every 2 bee steps and nips when adjacent.', 'Cheap to kill, dangerous if ignored in groups.'],
            thornBeetle: ['Thorn Beetle', 'Armored blocker. Its front shell blocks stings, so flank it before attacking.', 'Move to its side or back before spending your action.'],
            fogMoth: ['Fog Moth', 'Stationary pressure. Re-hides distant revealed cells when you linger nearby.', 'Fight it before scouting routes around it.'],
            waxMoth: ['Wax Moth', 'Steals 1 pollen when adjacent, then tries to flee.', 'Do not carry pollen past it unless your sting is ready.'],
            broodWasp: ['Brood Wasp', 'Spawns mite swarms if left alive too long.', 'Prioritize it before the room fills with small threats.'],
            stagBeetle: ['Stag Beetle', 'Heavy blocker. Its antlers guard the front and it marks a charge lane through chokepoints.', 'Step out of the marked lane, then circle around its facing before attacking.'],
            falseFlower: ['False Flower', 'Looks like pollen until close, then bites with a hidden aura.', 'Inspect rewards carefully when the route feels too generous.'],
            guardWasp: ['Guard Wasp', 'Stationary guard. Its larger aura reaches 2 cells and pushes the bee away when it hits.', 'Check the landing space before entering its zone.'],
            sleepingBat: ['Sleeping Bat', 'Sleeps until the bee gets close, then wakes and pursues.', 'Skirt around it unless the reward is worth waking it.'],
            honeyLeech: ['Honey Leech', 'Stationary drain. Chews through shield first, then health.', 'Shield is not permanent safety near this enemy.'],
            waspHive: ['Wasp Hive', 'Living hive. After a warning pulse, releases a wasp into a nearby empty cell.', 'Clear it before fighting other threats or the room slowly fills with wasps.'],
            crawlingFire: ['Crawling Fire', 'Low living ember. Creeps toward the bee and leaves burning cells nearby.', 'Use water routes and avoid chasing it through its own trail.'],
            honeySnareSpider: ['Honey Snare Spider', 'Casts sticky honey traps that slow nearby moving enemies and complicate routes.', 'A trap can help or hurt. Decide whether to kill the spider or use its terrain.'],
            burrowBeetle: ['Burrow Beetle', 'Armored ambusher. Dives underground, marks a cracked warning cell, then resurfaces there.', 'Treat cracked warning cells like a delayed attack and step away first.'],
            queenSignaler: ['Queen Signaler', 'Commander enemy. Sends signal pulses that speed up nearby enemy timers.', 'Kill it before engaging grouped enemies or every timer becomes harder to read.'],
            fogShepherd: ['Fog Shepherd', 'Moth carrier. Rolls mist back over revealed cells outside the bee reveal radius.', 'If you scout too slowly near it, the map gets harder to plan.'],
            pollenThiefMoth: ['Pollen Thief Moth', 'Quick thief. Steals pollen when adjacent, then flees away from the bee.', 'Spend or protect pollen before crossing near it.'],
            waxSentinel: ['Wax Sentinel', 'Living wax blocker. It must expose a weak point, and its front still blocks careless stings.', 'Wait for the core, then strike from the side or back.'],
            mirrorWasp: ['Mirror Wasp', 'Reflective wasp. Copies the bee last movement direction when that line is open.', 'Change direction and avoid letting it mirror you into a chokepoint.'],
            combBomber: ['Comb Bomber', 'Volatile bug. Marks nearby danger zones, then detonates those marked cells.', 'Leave marked cells before the countdown finishes.'],
            waterLeech: ['Water Leech', 'Wet drain. Suppresses water utility while the bee stays nearby.', 'Do not rely on water recovery inside its draining aura.'],
            larvaBrood: ['Larva Brood', 'Growing brood cell. If ignored, hatches mite swarms into nearby cells.', 'It is harmless early, but every second you leave it alive makes the room louder.']
        },
        relics: {
            guardComb: ['Guard Comb', 'Gain +1 shield at the start of each room.'],
            pathCarver: ['Path Carver', 'The first wax door opened each room costs no pollen or sting.'],
            battleRhythm: ['Battle Rhythm', 'Defeating an enemy restores 1 movement point.'],
            foragerPouch: ['Forager Pouch', 'The first pollen and first water collected each room grant +1 extra.'],
            royalJelly: ['Royal Jelly', 'Every 3 pollen collected heals +2 health.'],
            scoutLantern: ['Scout Lantern', 'Reveal radius increases by 1 and exit gates start revealed.'],
            venomPouch: ['Venom Pouch', 'Start each room with +1 Double Sting.']
        }
    },
    'es-419': {
        ui: {
            title: 'Guía del Panal',
            objective: 'Guía a la abeja por cámaras llenas de niebla. Empieza juntando polen, agua y escudo, evita los anillos de peligro, usa el aguijón solo cuando esté listo, gasta suministros entre salas y derrota al jefe final.',
            language: 'Idioma',
            languageSettings: 'Configuración de idioma',
            testingSettings: 'Pruebas',
            testingSettingsCopy: 'Reinicia el progreso guardado de la abeja para probar la primera experiencia desde nivel 1.',
            resetProgression: 'Reiniciar nivel de abeja',
            progressionReset: 'Progreso de abeja reiniciado. La próxima partida empieza en nivel 1.',
            newRun: 'Nueva partida',
            startNewRun: 'Empezar otra partida',
            testDance: 'Probar',
            options: 'Opciones',
            mainMenu: 'Menú principal',
            beeStats: 'Stats de la abeja',
            relics: 'Reliquias',
            equipment: 'Equipo',
            gameLog: 'Registro',
            restart: 'Reiniciar borrador',
            chooseRelic: 'Elige una reliquia',
            chooseRelicCopy: 'La siguiente cámara aparece cuando la abeja reclama una recompensa.',
            runComplete: 'Partida completa',
            chooseEquipment: 'Elige equipo',
            chooseEquipmentCopy: 'Elige una mejora equipable antes de entrar a la siguiente camara.',
            equipmentReplaces: 'Reemplaza',
            equipmentEmptySlot: 'Ranura vacia',
            runCompleteCopy: 'La abeja sobrevivió al dungeon.',
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
            cooldown: 'Acción',
            chooseNeighbor: 'Elige una celda vecina resaltada.',
            relicChoiceMessage: 'Elige una reliquia para definir la siguiente cámara.',
            danceMessage: 'Haz clic cuando el pulso llegue al borde del paso. Verde es perfecto, azul es bueno, y fallar baja la música y el multiplicador.',
            runCompleteMessage: 'Partida completa.',
            deadMessage: 'La partida terminó. Reinicia el borrador.',
            blockedNotAdjacent: 'Primero acércate a esa celda.',
            blockedHidden: 'Esa celda todavía está cubierta por niebla.',
            blockedCooldown: 'Acción ya usada este turno.',
            blockedWaxDoor: 'La puerta de cera necesita 1 polen o un aguijón listo.',
            blockedStamina: 'No quedan puntos de movimiento este turno.',
            blockedGeneric: 'Esa acción todavía no se puede realizar.',
            stamina: 'Movimiento',
            staminaHint: 'Celdas que la abeja puede moverse este turno',
            honey: 'Miel',
            honeyHint: 'Sirve para comprar mejoras tácticas',
            replay: 'Repetición'
            ,settings: 'Ajustes'
            ,settingsCopy: 'Pausa la partida y ajusta el audio.'
            ,musicVolume: 'Volumen de música'
            ,effectsVolume: 'Volumen de efectos'
            ,resume: 'Continuar'
        },
        logs: {
            start: 'Inicio',
            exit: 'Salida',
            objective: 'Objetivo',
            finalBoss: 'Jefe final',
            stingCooldown: 'Recarga del aguijón',
            gameOver: 'Fin de partida',
            bossDefeated: 'Jefe derrotado',
            danceFailed: 'Baile fallido',
            runComplete: 'Partida completa'
        },
        messages: {
            startRun: 'Explora el dungeon, administra tus movimientos y usa las salidas para avanzar.',
            enteredChamber: 'Entraste a la cámara {room}.',
            bossStart: 'Cámara final: derrota a la Señaladora Reina mientras sus colmenas siguen llamando avispas.',
            bossDefeated: 'El jefe final cayó. La ruta está completa.',
            danceFailed: 'La ruta hacia la comida se desvaneció. {percent}% completado.',
            runComplete: 'La run está completa.',
            gameOver: 'Fin de partida. {source} terminó la run.',
            pathLethal: 'Esa ruta mataría a la abeja. Busca otro camino o recupera escudo/salud.',
            pathLethalShort: ' Ruta letal.',
            pathRisk: ' Riesgo: {damage} daño.',
            pathSteps: 'Ruta: {steps} pasos.{danger}',
            blockedTarget: 'La ruta llega al bloqueo. Muévete al lado y luego interactúa.',
            stingCooldown: 'Acción ya usada este turno.',
            testingDefault: 'Probando {name}. Pasa el cursor y luego haz clic en una celda cercana para interactuar.',
            testWaspHive: '{name}: espera al lado para ver cómo la colmena libera una avispa rápido.',
            testCrawlingFire: '{name}: haz clic mientras llevas agua para apagarlo sin usar el aguijón.',
            crawlingFireExtinguished: 'Gastaste 1 agua y apagaste el fuego rastrero.',
            testLarvaBrood: '{name}: espera al lado para ver cómo las larvas eclosionan en ácaros.',
            testHoneySnareSpider: '{name}: espera en rango para ver trampas pegajosas alrededor de la ruta.',
            testCombBomber: '{name}: espera las celdas naranjas marcadas y sal antes de que detonen.',
            testBurrowBeetle: '{name}: espera la celda agrietada de advertencia y aléjate antes de que emerja.',
            testQueenSignaler: '{name}: hay una avispa cercana para que su señal acelere un temporizador.',
            testFogShepherd: '{name}: hay celdas reveladas fuera de tu radio para que su niebla las oculte de nuevo.',
            testWaterLeech: '{name}: compara el agua dentro de su drenaje azul con el agua más lejana.',
            testMirrorWasp: '{name}: muévete en una dirección y mira cómo copia esa dirección si el camino está libre.',
            testWaxSentinel: '{name}: espera la ventana de punto débil antes de atacar con el aguijón.'
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
            waitSting: 'Acción ya usada este turno.',
            sting: 'Acción: atacar con aguijón.',
            openPollen: 'Acción: gastar 1 polen para abrir.',
            openSting: 'Acción: abrir con un aguijón listo.',
            crossHazard: 'Acción: cruzar y recibir daño de espinas.',
            trade: 'Acción: comerciar si tienes polen y agua.',
            nextRoom: 'Acción: elegir reliquia y entrar a la siguiente sala.',
            finalDance: 'Acción: enfrentar al jefe final.',
            previousRoom: 'Acción: volver a la sala anterior.',
            move: 'Acción: moverse.',
            collect: 'Acción: recoger.'
        },
        campActions: {
            heal: ['Beber agua', 'Costo: 1 agua. Cura +2 salud.'],
            shield: ['Empacar cera', 'Costo: 1 polen. Repara +1 escudo.'],
            map: ['Estudiar mapa', 'Costo: 1 miel. Revela la ruta de salida en la próxima sala.'],
            guard: ['Panal guardia', 'Costo: 1 polen + 1 agua. Empieza la próxima sala con +1 escudo.'],
            scout: ['Humo explorador', 'Costo: 1 polen + 1 agua. Revela enemigos cercanos en la próxima sala.'],
            rush: ['Impulso dulce', 'Costo: 1 miel. Empieza la próxima sala con +1 punto de movimiento.'],
            reroll: ['Trato dulce', 'Costo: 1 miel. Cambia las próximas opciones de reliquia.']
        },
        objects: {
            empty: ['Celda abierta', 'Puedes moverte aquí sin peligro.'],
            npc: ['Escarabajo comerciante', 'Abre un mercado con tres intercambios de suministros.'],
            upgrade: ['Mejora de escudo', 'Mejora a tu exploradora.'],
            stingUpgrade: ['Aguijón doble', 'Un aguijón más fuerte de un solo uso.'],
            pollen: ['Polen', 'Suma polen.'],
            water: ['Agua', 'Suma agua.'],
            lampCell: ['Celda lámpara', 'Camina sobre ella para revelar celdas ocultas cercanas. Se queda en el tablero.'],
            vine: ['Enredaderas', 'Peligro persistente con espinas.'],
            glowPollen: ['Polen brillante', 'Revela una zona amplia de niebla alrededor de esta celda.'],
            nectarCache: ['Reserva de néctar', 'Otorga polen y agua juntos.'],
            honeyDrop: ['Gota de miel', 'Restaura salud y suma miel para mejoras tácticas.'],
            cleanWater: ['Agua limpia', 'Limpia presión cercana y restaura un poco de salud.'],
            smokePuff: ['Nube de humo', 'Pausa los temporizadores enemigos por una ventana corta de escape.'],
            sunShard: ['Fragmento solar', 'Revela todos los enemigos de la sala actual.'],
            flowerMap: ['Mapa floral', 'Revela una ruta aproximada hacia la salida.'],
            royalNectar: ['Néctar real', 'Recuperación rara. Cura ahora o da salud permanente si ya estás al máximo.'],
            waxDoor: ['Puerta de cera', 'Bloquea el paso. Gasta 1 polen o un aguijón listo para abrirla.'],
            wall: ['Muro de piedra', 'Bloquea el paso. Busca una puerta u otra ruta.'],
            stickyHoney: ['Miel pegajosa', 'Deja miel en el panal y ralentiza enemigos cercanos.'],
            stickyTrap: ['Parche pegajoso', 'Los enemigos que se mueven cerca pierden impulso.'],
            burningCell: ['Celda en llamas', 'Fuego persistente. Cruzarla cuesta salud salvo que puedas gastar agua.'],
            burrowWarningCell: ['Advertencia de madriguera', 'Suelo agrietado. Un escarabajo excavador está por emerger aquí.'],
            bomberMarkedCell: ['Celda marcada', 'Un bombardero de panal marcó esta celda. Sal antes de la explosión.'],
            compassPollen: ['Polen brújula', 'Revela la salida a través de la niebla.'],
            entry: ['Entrada', 'La camara se cierra detras de ti. No puedes volver a salas anteriores.'],
            exit: ['Salida', 'Abre la siguiente sala.'],
            finalExit: ['Jefe final', 'Derrota al enemigo final para terminar la partida.']
        },
        enemies: {
            enemy: ['Avispa', 'Aura fija. Hace daño al terminar turnos mientras estás al lado.', 'No termines el turno junto a ella salvo que puedas bloquear el daño.'],
            bat: ['Murciélago', 'Persigue a la abeja después de cada movimiento. Ataca cada 1s si está al lado.', 'Usa Aguijón doble o planea dos golpes seguros.'],
            miteSwarm: ['Enjambre de ácaros', 'Perseguidor lento. Se mueve cada 2 pasos y muerde si está al lado.', 'Es fácil de matar, pero peligroso en grupo.'],
            thornBeetle: ['Escarabajo espinoso', 'Bloqueador con armadura. Su frente bloquea aguijones, asi que flanquealo antes de atacar.', 'Muevete a su lado o espalda antes de gastar tu accion.'],
            fogMoth: ['Polilla de niebla', 'Presión fija. Vuelve a ocultar celdas reveladas lejanas si te quedas cerca.', 'Derrótala antes de explorar rutas a su alrededor.'],
            waxMoth: ['Polilla de cera', 'Roba 1 polen si está cerca y luego intenta escapar.', 'No lleves polen junto a ella salvo que el aguijón esté listo.'],
            broodWasp: ['Avispa nodriza', 'Genera enjambres de ácaros si la ignoras demasiado.', 'Priorízala antes de que la sala se llene de amenazas pequeñas.'],
            stagBeetle: ['Escarabajo ciervo', 'Bloqueador pesado. Sus cuernos guardan el frente y marca un carril de carga en los pasillos.', 'Sal del carril marcado, luego rodea su direccion antes de atacar.'],
            falseFlower: ['Flor falsa', 'Parece polen hasta que te acercas, luego muerde con un aura oculta.', 'Inspecciona las recompensas cuando la ruta parezca demasiado generosa.'],
            guardWasp: ['Avispa guardia', 'Guardia fija. Su aura llega a 2 celdas y empuja a la abeja cuando golpea.', 'Revisa dónde aterrizarás antes de entrar en su zona.'],
            sleepingBat: ['Murciélago dormido', 'Duerme hasta que la abeja se acerca, luego despierta y persigue.', 'Rodéalo salvo que la recompensa valga despertarlo.'],
            honeyLeech: ['Sanguijuela de miel', 'Drenaje fijo. Come escudo primero y luego salud.', 'El escudo no es seguridad permanente cerca de este enemigo.'],
            waspHive: ['Colmena de avispas', 'Colmena viva. Tras una advertencia, libera una avispa en una celda vacía cercana.', 'Destrúyela antes de pelear con otras amenazas o la sala se llenará de avispas.'],
            crawlingFire: ['Fuego rastrero', 'Brasa viviente baja. Avanza hacia la abeja y deja celdas en llamas cerca.', 'Usa rutas con agua y no lo persigas por su propio rastro.'],
            honeySnareSpider: ['Araña trampa de miel', 'Lanza trampas de miel pegajosa que complican rutas y ralentizan enemigos.', 'Una trampa puede ayudar o molestar. Decide si matarla o usar su terreno.'],
            burrowBeetle: ['Escarabajo excavador', 'Emboscador con armadura. Se entierra, marca una celda agrietada y emerge allí.', 'Trata las grietas como ataques retrasados y aléjate primero.'],
            queenSignaler: ['Señaladora Reina', 'Comandante. Envía pulsos que aceleran temporizadores enemigos cercanos.', 'Derrótala antes de pelear grupos o todos los temporizadores serán más difíciles.'],
            fogShepherd: ['Pastora de niebla', 'Polilla que carga niebla. Vuelve a ocultar celdas reveladas lejos de la abeja.', 'Si exploras lento cerca de ella, el mapa se vuelve más difícil de planear.'],
            pollenThiefMoth: ['Polilla ladrona de polen', 'Ladrona rápida. Roba polen al estar cerca y luego huye.', 'Gasta o protege tu polen antes de cruzar junto a ella.'],
            waxSentinel: ['Centinela de cera', 'Bloqueador viviente. Debe abrir su punto debil y su frente bloquea aguijones descuidados.', 'Espera el nucleo y ataca desde el lado o la espalda.'],
            mirrorWasp: ['Avispa espejo', 'Avispa reflectante. Copia la última dirección de movimiento de la abeja si la línea está libre.', 'Cambia de dirección y evita que te copie hacia un cuello de botella.'],
            combBomber: ['Bombardero de panal', 'Bicho volátil. Marca zonas de peligro cercanas y luego las detona.', 'Sal de las celdas marcadas antes de que termine la cuenta.'],
            waterLeech: ['Sanguijuela de agua', 'Drenaje húmedo. Suprime la utilidad del agua mientras la abeja esté cerca.', 'No dependas de recuperación con agua dentro de su aura azul.'],
            larvaBrood: ['Nido de larvas', 'Celda de cría. Si se ignora, eclosiona enjambres de ácaros en celdas cercanas.', 'Al principio parece inofensiva, pero cada segundo vuelve la sala más ruidosa.']
        },
        relics: {
            guardComb: ['Panal guardián', 'Gana +1 escudo al inicio de cada sala.'],
            pathCarver: ['Tallador de rutas', 'La primera puerta de cera de cada sala no cuesta polen ni aguijón.'],
            battleRhythm: ['Ritmo de combate', 'Derrotar un enemigo restaura 1 punto de movimiento.'],
            foragerPouch: ['Bolsa recolectora', 'El primer polen y la primera agua de cada sala dan +1 extra.'],
            royalJelly: ['Jalea real', 'Cada 3 polen recogidos cura +2 salud.'],
            scoutLantern: ['Linterna exploradora', 'El radio de revelado sube 1 y las salidas bloqueadas empiezan reveladas.'],
            venomPouch: ['Bolsa de veneno', 'Empieza cada sala con +1 Aguijón doble.']
        }
    }
};

const RELICS = [
    {
        id: 'guardComb',
        name: 'Guard Comb',
        description: 'Gain +1 shield at the start of each room.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => addShield(1, 'Guard Comb')
    },
    {
        id: 'pathCarver',
        name: 'Path Carver',
        description: 'The first wax door opened each room costs no pollen or sting.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => {
            game.freeWaxDoorAvailable = true;
        }
    },
    {
        id: 'battleRhythm',
        name: 'Battle Rhythm',
        description: 'Defeating an enemy restores 1 movement point.',
        minDepth: 2,
        rarity: 'common'
    },
    {
        id: 'foragerPouch',
        name: 'Forager Pouch',
        description: 'The first pollen and first water collected each room grant +1 extra.',
        minDepth: 1,
        rarity: 'common',
        onRoomStart: () => {
            game.foragerPouchCollected = { pollen: false, water: false };
        }
    },
    {
        id: 'royalJelly',
        name: 'Royal Jelly',
        description: 'Every 3 pollen collected heals +2 health.',
        minDepth: 1,
        rarity: 'common'
    },
    {
        id: 'scoutLantern',
        name: 'Scout Lantern',
        description: 'Reveal radius increases by 1 and exit gates start revealed.',
        minDepth: 2,
        rarity: 'common',
        apply: () => {
            game.revealRadius = 3;
            revealAroundPlayer();
        },
        onRoomStart: () => {
            revealExitGate();
        }
    },
    {
        id: 'venomPouch',
        name: 'Venom Pouch',
        description: 'Start each room with +1 Double Sting.',
        minDepth: 2,
        rarity: 'common',
        onRoomStart: () => {
            game.player.stingCharges += 1;
            addLog('Venom Pouch', 'Gained +1 Double Sting.');
        }
    }
];

const SPRITE_DEFS = {
    playerIdle: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 0, frameMs: 180 },
    playerAttack: { src: 'assets/bee-alpha.png', columns: 4, rows: 2, row: 1, frameMs: 120 },
    enemy: { src: 'assets/wasp-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 180 },
    bat: { src: 'assets/bat-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    npc: { src: 'assets/bettle-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    miteSwarm: { src: 'assets/miteSwarm.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    thornBeetle: { src: 'assets/thornBeetle.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    fogMoth: { src: 'assets/fogMoth.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    waxMoth: { src: 'assets/waxMoth.png', columns: 4, rows: 1, row: 0, frameMs: 185 },
    broodWasp: { src: 'assets/broodWasp.png', columns: 4, rows: 1, row: 0, frameMs: 180 },
    stagBeetle: { src: 'assets/stagBeetle.png', columns: 4, rows: 1, row: 0, frameMs: 195 },
    falseFlower: { src: 'assets/falseFlower.png', columns: 4, rows: 1, row: 0, frameMs: 180 },
    guardWasp: { src: 'assets/guardWasp.png', columns: 4, rows: 1, row: 0, frameMs: 175 },
    sleepingBat: { src: 'assets/sleepingBat.png', columns: 4, rows: 2, row: 0, frameMs: 210 },
    sleepingBatAwake: { src: 'assets/sleepingBat.png', columns: 4, rows: 2, row: 1, frameMs: 150 },
    honeyLeech: { src: 'assets/honeyLeech.png', columns: 4, rows: 1, row: 0, frameMs: 185 },
    waspHive: { src: 'assets/enemies/wasp-hive-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 210 },
    crawlingFire: { src: 'assets/enemies/crawling-fire-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 150 },
    honeySnareSpider: { src: 'assets/enemies/honey-snare-spider-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 175 },
    burrowBeetle: { src: 'assets/enemies/burrow-beetle-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 190 },
    queenSignaler: { src: 'assets/enemies/queen-signaler-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 175 },
    fogShepherd: { src: 'assets/enemies/fog-shepherd-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 210 },
    pollenThiefMoth: { src: 'assets/enemies/pollen-thief-moth-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 140 },
    waxSentinel: { src: 'assets/enemies/wax-sentinel-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 230 },
    mirrorWasp: { src: 'assets/enemies/mirror-wasp-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 150 },
    combBomber: { src: 'assets/enemies/comb-bomber-alpha.png', columns: 4, rows: 3, row: 0, frameMs: 180 },
    waterLeech: { src: 'assets/enemies/water-leech-alpha.png', columns: 4, rows: 4, row: 0, frameMs: 190 },
    larvaBrood: { src: 'assets/enemies/larva-brood-alpha.png', columns: 4, rows: 4, row: 0, frameMs: 220 },
    pollen: { src: 'assets/pollen-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 220 },
    water: { src: 'assets/water_drop-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    lampCell: { src: '', plannedAsset: 'assets/items/lamp-cell.png', columns: 4, rows: 1, row: 0, frameMs: 190, fallback: 'L' },
    upgrade: { src: 'assets/shield-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    stingUpgrade: { src: 'assets/sting-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    vine: { src: 'assets/vines-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    wall: { src: 'assets/wall.png', columns: 4, rows: 1, row: 0, frameMs: 180 },
    glowPollen: { src: 'assets/glowPollen.png', columns: 4, rows: 1, row: 0, frameMs: 150 },
    nectarCache: { src: 'assets/nectarCache.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    honeyDrop: { src: 'assets/honeyDrop.png', columns: 4, rows: 1, row: 0, frameMs: 230 },
    cleanWater: { src: 'assets/cleanWater.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    smokePuff: { src: 'assets/smokePuff.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    sunShard: { src: 'assets/sunShard.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    flowerMap: { src: 'assets/flowerMap.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    royalNectar: { src: 'assets/royalNectar.png', columns: 4, rows: 1, row: 0, frameMs: 200 },
    waxDoor: { src: 'assets/waxDoor.png', columns: 4, rows: 1, row: 0, frameMs: 190 },
    stickyHoney: { src: 'assets/stickyHoney.png', columns: 4, rows: 1, row: 0, frameMs: 260 },
    stickyTrap: { src: 'assets/effects/sticky-trap-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 260 },
    burningCell: { src: 'assets/effects/burning-cell-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
    burrowWarningCell: { src: 'assets/effects/burrow-warning-cell-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 150 },
    bomberMarkedCell: { src: 'assets/effects/bomber-marked-cell-alpha.png', columns: 4, rows: 1, row: 0, frameMs: 150 },
    deathCell: { src: '', plannedAsset: 'assets/effects/skull.png', columns: 4, rows: 1, row: 0, frameMs: 180, fallback: 'KO' },
    compassPollen: { src: 'assets/compassPollen.png', columns: 4, rows: 1, row: 0, frameMs: 170 },
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
        lesson: 'Do not end your turn next to it unless you can block the damage.',
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
        sprite: 'miteSwarm',
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
        behavior: 'Armored blocker. Its front shell blocks stings, so flank it before attacking.',
        lesson: 'Move to its side or back before spending your action.',
        behaviors: [{ type: 'damageAura' }, { type: 'armoredFacing', turnRange: 3 }]
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
        behavior: 'Heavy blocker. Its antlers guard the front and it marks a charge lane through chokepoints.',
        lesson: 'Step out of the marked lane, then circle around its facing before attacking.',
        behaviors: [{ type: 'damageAura' }, { type: 'armoredFacing', turnRange: 4, flankBonus: 1 }, { type: 'chargeLane', length: 2, object: 'bomberMarkedCell', detonateMs: 900 }]
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
        sprite: 'guardWasp',
        hp: 2,
        attack: 2,
        intervalMs: 1200,
        range: 2,
        behavior: 'Stationary guard. Its larger aura reaches 2 cells and pushes the bee away when it hits.',
        lesson: 'Check the landing space before entering its zone.',
        behaviors: [{ type: 'damageAura' }, { type: 'pushPlayerOnAttack' }]
    },
    sleepingBat: {
        name: 'Sleeping Bat',
        color: '#6c5a9d',
        sprite: 'sleepingBat',
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
        sprite: 'honeyLeech',
        hp: 2,
        attack: 1,
        intervalMs: 850,
        range: 1,
        behavior: 'Stationary drain. Chews through shield first, then health.',
        lesson: 'Shield is not permanent safety near this enemy.',
        behaviors: [{ type: 'damageAura' }]
    },
    waspHive: {
        name: 'Wasp Hive',
        color: '#dd8a2f',
        sprite: 'waspHive',
        plannedAsset: 'assets/enemies/wasp-hive.png',
        hp: 3,
        attack: 0,
        intervalMs: 2200,
        range: 2,
        behavior: 'Living hive. After a warning pulse, releases a wasp into a nearby empty cell.',
        lesson: 'Clear it before fighting other threats or the room slowly fills with wasps.',
        behaviors: [{ type: 'spawnEnemyAura', object: 'enemy', spawnDelayMs: 1600, preferTowardPlayer: true }, { type: 'damageAura', fallbackOnly: true }]
    },
    crawlingFire: {
        name: 'Crawling Fire',
        color: '#ff6a2a',
        sprite: 'crawlingFire',
        plannedAsset: 'assets/enemies/crawling-fire.png',
        hp: 1,
        attack: 1,
        intervalMs: 900,
        range: 1,
        behavior: 'Low living ember. Creeps toward the bee and leaves burning cells nearby.',
        lesson: 'Use water routes and avoid chasing it through its own trail.',
        behaviors: [{ type: 'damageAura' }, { type: 'spawnTerrainAura', object: 'burningCell' }, { type: 'moveEverySteps', stepInterval: 2 }]
    },
    honeySnareSpider: {
        name: 'Honey Snare Spider',
        color: '#c98a34',
        sprite: 'honeySnareSpider',
        plannedAsset: 'assets/enemies/honey-snare-spider.png',
        hp: 1,
        attack: 0,
        intervalMs: 1000,
        range: 2,
        behavior: 'Casts sticky honey traps that slow nearby moving enemies and complicate routes.',
        lesson: 'A trap can help or hurt. Decide whether to kill the spider or use its terrain.',
        behaviors: [{ type: 'spawnTerrainAura', object: 'stickyTrap' }]
    },
    burrowBeetle: {
        name: 'Burrow Beetle',
        color: '#6f5b37',
        sprite: 'burrowBeetle',
        plannedAsset: 'assets/enemies/burrow-beetle-alpha.png',
        hp: 2,
        attack: 1,
        intervalMs: 850,
        range: 1,
        behavior: 'Armored ambusher. Dives underground, marks a cracked warning cell, then resurfaces there.',
        lesson: 'Treat cracked warning cells like a delayed attack and step away first.',
        behaviors: [{ type: 'burrowAmbush', warningMs: 650 }]
    },
    queenSignaler: {
        name: 'Queen Signaler',
        color: '#f2c34b',
        sprite: 'queenSignaler',
        plannedAsset: 'assets/enemies/queen-signaler.png',
        hp: 2,
        attack: 0,
        intervalMs: 950,
        range: 2,
        behavior: 'Commander enemy. Sends signal pulses that speed up nearby enemy timers.',
        lesson: 'Kill it before engaging grouped enemies or every timer becomes harder to read.',
        behaviors: [{ type: 'buffEnemiesAura', range: 2, accelerateMs: 420 }]
    },
    fogShepherd: {
        name: 'Fog Shepherd',
        color: '#8caebd',
        sprite: 'fogShepherd',
        plannedAsset: 'assets/enemies/fog-shepherd.png',
        hp: 1,
        attack: 0,
        intervalMs: 900,
        range: 3,
        behavior: 'Moth carrier. Rolls mist back over revealed cells outside the bee reveal radius.',
        lesson: 'If you scout too slowly near it, the map gets harder to plan.',
        behaviors: [{ type: 'refogAura' }, { type: 'moveEverySteps', stepInterval: 3 }]
    },
    pollenThiefMoth: {
        name: 'Pollen Thief Moth',
        color: '#d8c07a',
        sprite: 'pollenThiefMoth',
        plannedAsset: 'assets/enemies/pollen-thief-moth.png',
        hp: 1,
        attack: 0,
        intervalMs: 800,
        range: 1,
        behavior: 'Quick thief. Steals pollen when adjacent, then flees away from the bee.',
        lesson: 'Spend or protect pollen before crossing near it.',
        behaviors: [{ type: 'stealResourceAura', resource: 'pollen', amount: 1 }, { type: 'fleeFromPlayer' }]
    },
    waxSentinel: {
        name: 'Wax Sentinel',
        color: '#c9a85b',
        sprite: 'waxSentinel',
        plannedAsset: 'assets/enemies/wax-sentinel.png',
        hp: 3,
        attack: 0,
        intervalMs: 950,
        range: 1,
        behavior: 'Living wax blocker. It must expose a weak point, and its front still blocks careless stings.',
        lesson: 'Wait for the core, then strike from the side or back.',
        behaviors: [{ type: 'weakPointWindow', openMs: 1300 }, { type: 'armoredFacing', turnRange: 3, flankBonus: 1 }]
    },
    mirrorWasp: {
        name: 'Mirror Wasp',
        color: '#9fd9ef',
        sprite: 'mirrorWasp',
        plannedAsset: 'assets/enemies/mirror-wasp.png',
        hp: 1,
        attack: 1,
        intervalMs: 700,
        range: 1,
        behavior: 'Reflective wasp. Copies the bee last movement direction when that line is open.',
        lesson: 'Change direction and avoid letting it mirror you into a chokepoint.',
        behaviors: [{ type: 'damageAura' }, { type: 'mirrorMove' }]
    },
    combBomber: {
        name: 'Comb Bomber',
        color: '#e98231',
        sprite: 'combBomber',
        plannedAsset: 'assets/enemies/comb-bomber.png',
        hp: 1,
        attack: 1,
        intervalMs: 850,
        range: 2,
        behavior: 'Volatile bug. Marks nearby danger zones, then detonates those marked cells.',
        lesson: 'Leave marked cells before the countdown finishes.',
        behaviors: [{ type: 'markCellsAura', object: 'bomberMarkedCell', detonateMs: 750 }]
    },
    waterLeech: {
        name: 'Water Leech',
        color: '#3f83b7',
        sprite: 'waterLeech',
        plannedAsset: 'assets/enemies/water-leech.png',
        hp: 2,
        attack: 0,
        intervalMs: 850,
        range: 2,
        behavior: 'Wet drain. Suppresses water utility while the bee stays nearby.',
        lesson: 'Do not rely on water recovery inside its draining aura.',
        behaviors: [{ type: 'waterDrainAura' }]
    },
    larvaBrood: {
        name: 'Larva Brood',
        color: '#e0b66e',
        sprite: 'larvaBrood',
        plannedAsset: 'assets/enemies/larva-brood.png',
        hp: 2,
        attack: 0,
        intervalMs: 2800,
        range: 2,
        behavior: 'Growing brood cell. If ignored, hatches mite swarms into nearby cells.',
        lesson: 'It is harmless early, but every second you leave it alive makes the room louder.',
        behaviors: [{ type: 'spawnEnemyAura', object: 'miteSwarm' }]
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
        description: 'Opens a market with three supply trades.'
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
    lampCell: {
        name: 'Lamp Cell',
        color: '#ffd56b',
        description: 'Walk over it to reveal nearby hidden cells. It stays on the board.'
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
        description: 'Restores health and adds honey for tactical boosts.',
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
    burningCell: {
        name: 'Burning Cell',
        color: '#d34f22',
        description: 'Lingering fire. Crossing it costs health unless you can spend water.'
    },
    burrowWarningCell: {
        name: 'Burrow Warning',
        color: '#c45a2a',
        description: 'Cracked ground. A burrow beetle is about to emerge here.'
    },
    bomberMarkedCell: {
        name: 'Marked Blast Cell',
        color: '#ef8a2f',
        description: 'A comb bomber has marked this cell. Leave before the blast lands.'
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

Object.entries(ENEMY_DEFS).forEach(([id, enemy]) => {
    if (!OBJECTS[id]) {
        OBJECTS[id] = {
            name: enemy.name,
            color: enemy.color,
            description: enemy.behavior
        };
    }
});

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
    { object: 'stagBeetle', minDepth: 4, weight: 3 },
    { object: 'waspHive', minDepth: 3, weight: 2 },
    { object: 'crawlingFire', minDepth: 3, weight: 2 },
    { object: 'honeySnareSpider', minDepth: 3, weight: 3 },
    { object: 'burrowBeetle', minDepth: 4, weight: 2 },
    { object: 'queenSignaler', minDepth: 4, weight: 2 },
    { object: 'fogShepherd', minDepth: 4, weight: 2 },
    { object: 'pollenThiefMoth', minDepth: 3, weight: 3 },
    { object: 'waxSentinel', minDepth: 4, weight: 2 },
    { object: 'mirrorWasp', minDepth: 5, weight: 2 },
    { object: 'combBomber', minDepth: 5, weight: 2 },
    { object: 'waterLeech', minDepth: 4, weight: 2 },
    { object: 'larvaBrood', minDepth: 5, weight: 2 }
];

const EQUIPMENT_SLOTS = [
    {
        id: 'helmet',
        name: 'Helmet',
        description: 'Head gear for scouting, protection, and room-reading effects.',
        i18n: {
            en: { name: 'Helmet', description: 'Head gear for scouting, protection, and room-reading effects.' },
            'es-419': { name: 'Casco', description: 'Equipo de cabeza para explorar, protegerte y leer la sala.' }
        }
    },
    {
        id: 'jacket',
        name: 'Jacket',
        description: 'Body gear for defense, warmth, and resource conversion.',
        i18n: {
            en: { name: 'Jacket', description: 'Body gear for defense, warmth, and resource conversion.' },
            'es-419': { name: 'Chaqueta', description: 'Equipo de cuerpo para defensa, abrigo y convertir recursos.' }
        }
    },
    {
        id: 'abdomen',
        name: 'Abdomen Guard',
        description: 'Tail/abdomen gear for carrying nectar, honey, or emergency stores.',
        i18n: {
            en: { name: 'Abdomen Guard', description: 'Tail/abdomen gear for carrying nectar, honey, or emergency stores.' },
            'es-419': { name: 'Protector abdominal', description: 'Equipo de abdomen para llevar nectar, miel o reservas de emergencia.' }
        }
    },
    {
        id: 'sting',
        name: 'Sting',
        description: 'Weapon gear that changes attack range, damage, or special sting rules.',
        i18n: {
            en: { name: 'Sting', description: 'Weapon gear that changes attack range, damage, or special sting rules.' },
            'es-419': { name: 'Aguijon', description: 'Equipo de arma que cambia alcance, dano o reglas especiales de ataque.' }
        }
    },
    {
        id: 'wings',
        name: 'Wings',
        description: 'Movement gear for route planning, reveal, and positioning effects.',
        i18n: {
            en: { name: 'Wings', description: 'Movement gear for route planning, reveal, and positioning effects.' },
            'es-419': { name: 'Alas', description: 'Equipo de movimiento para planear rutas, revelar y posicionarte.' }
        }
    }
];

const EQUIPMENT_DEFS = {
    waxScoutHelmet: {
        id: 'waxScoutHelmet',
        slot: 'helmet',
        name: 'Wax Scout Helmet',
        rarity: 'starter',
        minLevel: 1,
        plannedAsset: 'assets/equipment/helmet-wax-scout.png',
        description: 'Future loot: reveals one extra cell near the exit at room start.',
        i18n: {
            en: { name: 'Wax Scout Helmet', description: 'Future loot: reveals one extra cell near the exit at room start.' },
            'es-419': { name: 'Casco explorador de cera', description: 'Botin futuro: revela una celda extra cerca de la salida al iniciar la sala.' }
        },
        effects: [{ type: 'futureRevealHint', amount: 1 }]
    },
    leafJacket: {
        id: 'leafJacket',
        slot: 'jacket',
        name: 'Leaf Jacket',
        rarity: 'starter',
        minLevel: 1,
        plannedAsset: 'assets/equipment/jacket-leaf.png',
        description: 'Future loot: softens the first hazard damage in each room.',
        i18n: {
            en: { name: 'Leaf Jacket', description: 'Future loot: softens the first hazard damage in each room.' },
            'es-419': { name: 'Chaqueta de hoja', description: 'Botin futuro: reduce el primer dano de peligro en cada sala.' }
        },
        effects: [{ type: 'futureHazardBlock', amount: 1 }]
    },
    nectarPouch: {
        id: 'nectarPouch',
        slot: 'abdomen',
        name: 'Nectar Pouch',
        rarity: 'starter',
        minLevel: 1,
        plannedAsset: 'assets/equipment/abdomen-nectar-pouch.png',
        description: 'Future loot: carries bonus honey between rooms.',
        i18n: {
            en: { name: 'Nectar Pouch', description: 'Future loot: carries bonus honey between rooms.' },
            'es-419': { name: 'Bolsa de nectar', description: 'Botin futuro: lleva miel adicional entre salas.' }
        },
        effects: [{ type: 'futureRoomHoney', amount: 1 }]
    },
    barbedSting: {
        id: 'barbedSting',
        slot: 'sting',
        name: 'Barbed Sting',
        rarity: 'starter',
        minLevel: 1,
        plannedAsset: 'assets/equipment/sting-barbed.png',
        description: 'Future loot: improves tactical attack reach or first-hit damage.',
        i18n: {
            en: { name: 'Barbed Sting', description: 'Future loot: improves tactical attack reach or first-hit damage.' },
            'es-419': { name: 'Aguijon dentado', description: 'Botin futuro: mejora el alcance tactico o el dano del primer golpe.' }
        },
        effects: [{ type: 'futureAttackRange', amount: 1 }]
    },
    scoutWings: {
        id: 'scoutWings',
        slot: 'wings',
        name: 'Scout Wings',
        rarity: 'starter',
        minLevel: 1,
        plannedAsset: 'assets/equipment/wings-scout.png',
        description: 'Future loot: improves movement route control.',
        i18n: {
            en: { name: 'Scout Wings', description: 'Future loot: improves movement route control.' },
            'es-419': { name: 'Alas exploradoras', description: 'Botin futuro: mejora el control de rutas de movimiento.' }
        },
        effects: [{ type: 'futureMovePoint', amount: 1 }]
    },
    resinCrown: {
        id: 'resinCrown',
        slot: 'helmet',
        name: 'Resin Crown',
        rarity: 'common',
        minLevel: 2,
        plannedAsset: 'assets/equipment/helmet-resin-crown.png',
        description: 'Adds 1 max shield for early rooms that ask you to plan around danger.',
        i18n: {
            en: { name: 'Resin Crown', description: 'Adds 1 max shield for early rooms that ask you to plan around danger.' },
            'es-419': { name: 'Corona de resina', description: 'Suma 1 escudo maximo para salas tempranas que piden planear alrededor del peligro.' }
        },
        effects: [{ type: 'maxShield', amount: 1 }]
    },
    petalJacket: {
        id: 'petalJacket',
        slot: 'jacket',
        name: 'Petal Jacket',
        rarity: 'common',
        minLevel: 2,
        plannedAsset: 'assets/equipment/jacket-petal.png',
        description: 'Adds 1 max health for safer first boss attempts.',
        i18n: {
            en: { name: 'Petal Jacket', description: 'Adds 1 max health for safer first boss attempts.' },
            'es-419': { name: 'Chaqueta de petalos', description: 'Suma 1 salud maxima para primeros intentos de jefe mas seguros.' }
        },
        effects: [{ type: 'maxHealth', amount: 1 }]
    },
    honeySatchel: {
        id: 'honeySatchel',
        slot: 'abdomen',
        name: 'Honey Satchel',
        rarity: 'common',
        minLevel: 2,
        plannedAsset: 'assets/equipment/abdomen-honey-satchel.png',
        description: 'Future loot: carries one bonus honey into each room.',
        i18n: {
            en: { name: 'Honey Satchel', description: 'Future loot: carries one bonus honey into each room.' },
            'es-419': { name: 'Morral de miel', description: 'Botin futuro: lleva una miel extra a cada sala.' }
        },
        effects: [{ type: 'futureRoomHoney', amount: 1 }]
    },
    longSting: {
        id: 'longSting',
        slot: 'sting',
        name: 'Long Sting',
        rarity: 'common',
        minLevel: 2,
        plannedAsset: 'assets/equipment/sting-long.png',
        description: 'Adds 1 attack range so positional fights need fewer risky adjacent turns.',
        i18n: {
            en: { name: 'Long Sting', description: 'Adds 1 attack range so positional fights need fewer risky adjacent turns.' },
            'es-419': { name: 'Aguijon largo', description: 'Suma 1 alcance de ataque para pelear con menos turnos adyacentes riesgosos.' }
        },
        effects: [{ type: 'attackRange', amount: 1 }]
    },
    wideWings: {
        id: 'wideWings',
        slot: 'wings',
        name: 'Wide Wings',
        rarity: 'common',
        minLevel: 2,
        plannedAsset: 'assets/equipment/wings-wide.png',
        description: 'Adds 1 movement point for longer tactical routes.',
        i18n: {
            en: { name: 'Wide Wings', description: 'Adds 1 movement point for longer tactical routes.' },
            'es-419': { name: 'Alas amplias', description: 'Suma 1 punto de movimiento para rutas tacticas mas largas.' }
        },
        effects: [{ type: 'maxMovePoints', amount: 1 }]
    },
    pollenLens: {
        id: 'pollenLens',
        slot: 'helmet',
        name: 'Pollen Lens',
        rarity: 'rare',
        minLevel: 4,
        plannedAsset: 'assets/equipment/helmet-pollen-lens.png',
        description: 'Future loot: improves room-reading clues before committing to a route.',
        i18n: {
            en: { name: 'Pollen Lens', description: 'Future loot: improves room-reading clues before committing to a route.' },
            'es-419': { name: 'Lente de polen', description: 'Botin futuro: mejora las pistas para leer la sala antes de comprometer una ruta.' }
        },
        effects: [{ type: 'futureRevealHint', amount: 2 }]
    },
    amberJacket: {
        id: 'amberJacket',
        slot: 'jacket',
        name: 'Amber Jacket',
        rarity: 'rare',
        minLevel: 4,
        plannedAsset: 'assets/equipment/jacket-amber.png',
        description: 'Adds 2 max shield for rooms with heavier telegraphed danger.',
        i18n: {
            en: { name: 'Amber Jacket', description: 'Adds 2 max shield for rooms with heavier telegraphed danger.' },
            'es-419': { name: 'Chaqueta de ambar', description: 'Suma 2 escudo maximo para salas con peligros telegrafiados mas pesados.' }
        },
        effects: [{ type: 'maxShield', amount: 2 }]
    },
    royalNectarBand: {
        id: 'royalNectarBand',
        slot: 'abdomen',
        name: 'Royal Nectar Band',
        rarity: 'rare',
        minLevel: 4,
        plannedAsset: 'assets/equipment/abdomen-royal-nectar-band.png',
        description: 'Adds 1 max health for longer routes through mixed hazards.',
        i18n: {
            en: { name: 'Royal Nectar Band', description: 'Adds 1 max health for longer routes through mixed hazards.' },
            'es-419': { name: 'Banda de nectar real', description: 'Suma 1 salud maxima para rutas largas con peligros mezclados.' }
        },
        effects: [{ type: 'maxHealth', amount: 1 }]
    },
    hookedSting: {
        id: 'hookedSting',
        slot: 'sting',
        name: 'Hooked Sting',
        rarity: 'rare',
        minLevel: 4,
        plannedAsset: 'assets/equipment/sting-hooked.png',
        description: 'Future loot: improves tactical attack pressure after repositioning.',
        i18n: {
            en: { name: 'Hooked Sting', description: 'Future loot: improves tactical attack pressure after repositioning.' },
            'es-419': { name: 'Aguijon curvo', description: 'Botin futuro: mejora la presion tactica de ataque despues de reposicionarte.' }
        },
        effects: [{ type: 'futureAttackRange', amount: 2 }]
    },
    windcutWings: {
        id: 'windcutWings',
        slot: 'wings',
        name: 'Windcut Wings',
        rarity: 'rare',
        minLevel: 4,
        plannedAsset: 'assets/equipment/wings-windcut.png',
        description: 'Future loot: improves route control in larger cave rooms.',
        i18n: {
            en: { name: 'Windcut Wings', description: 'Future loot: improves route control in larger cave rooms.' },
            'es-419': { name: 'Alas cortaviento', description: 'Botin futuro: mejora el control de rutas en cavernas mas grandes.' }
        },
        effects: [{ type: 'futureMovePoint', amount: 2 }]
    }
};

window.HW_CONTENT = {
    I18N,
    RELICS,
    EQUIPMENT_SLOTS,
    EQUIPMENT_DEFS,
    SPRITE_DEFS,
    ENEMY_DEFS,
    OBJECTS,
    DEFAULT_OBJECT_COLORS,
    DEFAULT_ENEMY_NUMBERS,
    DISCOVERY_OBJECT_WEIGHTS,
    ENEMY_SPAWN_WEIGHTS
};
})();

