window.HW_ROADMAP_STATE = {
    "updatedAt": "2026-08-13",
    "currentTaskId": "content-scaling",
    "summary": "Honeycomb Wayfinder is moving toward clearer first-run learning, tactical position puzzles, theme atmosphere, and safer content scaling.",
    "lanes": [
        {
            "id": "foundation",
            "title": "Foundation",
            "status": "done",
            "nodes": [
                {
                    "id": "guidance",
                    "title": "Agent Guidance",
                    "status": "done",
                    "owner": "Codex",
                    "objective": "Keep future work aligned with project rules, UX Oracle checks, and content authoring expectations.",
                    "done": [
                        "Added AGENTS.md routing.",
                        "Added AGENT_WORKFLOW.md.",
                        "Documented authoring and manifest checklists."
                    ],
                    "left": [
                        "Keep docs updated whenever behavior changes."
                    ],
                    "evidence": [
                        "AGENTS.md",
                        "AGENT_WORKFLOW.md",
                        "CONTENT_AUTHORING_GUIDE.md"
                    ]
                },
                {
                    "id": "architecture",
                    "title": "System Extraction",
                    "status": "in_progress",
                    "owner": "Codex",
                    "objective": "Shrink index.js by moving stable responsibilities into focused systems.",
                    "done": [
                        "Extracted tactical flow/combat helpers.",
                        "Extracted room templates, generation, rendering, replay, HUD, inspect, items, enemies, and market systems.",
                        "Removed stale room-template pass-through wrappers.",
                        "Extracted wearable loadout helpers into src/systems/equipment.js.",
                        "Moved wearable loadout application into the equipment system."
                    ],
                    "left": [
                        "Move remaining end-screen assembly.",
                        "Extract boss scripting when boss behavior stabilizes.",
                        "Move more item-effect branches only when reusable handlers emerge."
                    ],
                    "evidence": [
                        "src/README.md",
                        "src/systems/",
                        "src/systems/equipment.js",
                        "npm test"
                    ]
                }
            ]
        },
        {
            "id": "player-experience",
            "title": "Player Experience",
            "status": "in_progress",
            "nodes": [
                {
                    "id": "first-run",
                    "title": "First-Run Clarity",
                    "status": "in_progress",
                    "owner": "Codex",
                    "objective": "Teach movement, inspection, supplies, lamps, blockers, and one enemy at an easier pace.",
                    "done": [
                        "Room 1 onboarding path starts without enemies.",
                        "Room 2 teaches wax-door spending.",
                        "Room 3 teaches a guarded route and safe flanks.",
                        "Mist cells can be targeted for movement."
                    ],
                    "left": [
                        "Add more authored first-interaction rooms.",
                        "Keep the exit visible while shaping routes around mechanics.",
                        "Improve early resource-use constraints without crowding."
                    ],
                    "evidence": [
                        "ui-development/player-experience-roadmap.md",
                        "tools/smoke-browser.js"
                    ]
                },
                {
                    "id": "tactical-combat",
                    "title": "Tactical Combat Loop",
                    "status": "in_progress",
                    "owner": "Codex",
                    "objective": "Make enemies position puzzles first and HP bags second.",
                    "done": [
                        "Turn-based movement points and one action per turn.",
                        "Path preview shows reachable route and risk.",
                        "Stag Beetle charge lane telegraph.",
                        "Boss fight uses hive pressure instead of only long-range reach."
                    ],
                    "left": [
                        "Add more enemy lane, flank, and forced-movement behaviors.",
                        "Tune boss pressure through playtest evidence.",
                        "Add one resource-to-combat interaction such as water extinguishing fire."
                    ],
                    "evidence": [
                        "src/systems/tactical-combat.js",
                        "src/systems/enemy-turns.js",
                        "tools/playtest-boss-cdp.js"
                    ]
                },
                {
                    "id": "ui-declutter",
                    "title": "UI Declutter",
                    "status": "in_progress",
                    "owner": "Codex",
                    "objective": "Move durable explanation into panels and keep floating feedback short.",
                    "done": [
                        "Persistent inspect panel explains selected cells.",
                        "Bottom life/shield and movement orbs improved fast-read status.",
                        "Top-center toast replaced scattered warning messages."
                    ],
                    "left": [
                        "Keep popups from competing with HUD.",
                        "Improve keyboard/focus checks for menu overlays.",
                        "Add richer inspect graphics for damage, cost, and rewards."
                    ],
                    "evidence": [
                        "src/systems/inspect-ui.js",
                        "src/systems/hud.js",
                        "tools/smoke-ui-layout.js"
                    ]
                }
            ]
        },
        {
            "id": "world",
            "title": "World And Theme",
            "status": "planned",
            "nodes": [
                {
                    "id": "theme-surroundings",
                    "title": "Theme Surroundings",
                    "status": "planned",
                    "owner": "Codex + Artist",
                    "objective": "Use non-clickable mosaic art outside playable cells to make each theme feel distinct.",
                    "done": [
                        "Created surrounding mosaic system design notes.",
                        "Separated environment concept from playable cell rendering."
                    ],
                    "left": [
                        "Define final art placement contract for 1-4 hex pieces.",
                        "Add browser debug evidence for no playable overlaps.",
                        "Tune alignment and blending after final assets arrive."
                    ],
                    "evidence": [
                        "SURROUNDING_MOSAIC_SYSTEM.md",
                        "PROCEDURAL_TILE_ART_REFERENCE.md"
                    ]
                },
                {
                    "id": "themes",
                    "title": "Dungeon Themes",
                    "status": "planned",
                    "owner": "Codex + Artist",
                    "objective": "Let runs rotate through cave, forest, wasp hive, and underground moods with compatible enemies and items.",
                    "done": [
                        "Theme metadata exists in progression data.",
                        "Theme eligibility smoke checks cover supplies and enemies."
                    ],
                    "left": [
                        "Add full theme-specific boss and object pools.",
                        "Create theme-specific surrounding art sheets.",
                        "Expose theme selection or run rotation more clearly."
                    ],
                    "evidence": [
                        "src/data/progression.js",
                        "tools/smoke-data.js"
                    ]
                }
            ]
        },
        {
            "id": "content",
            "title": "Content Scaling",
            "status": "in_progress",
            "nodes": [
                {
                    "id": "content-scaling",
                    "title": "Content Scaling Safety",
                    "status": "active",
                    "owner": "Codex",
                    "objective": "Make new enemies, items, relics, and themes safer to add through data and tests.",
                    "done": [
                        "Added content manifest checklist.",
                        "Added smoke checks for localization, sprites, unlocks, themes, equipment, test scenarios, inspect stats, run summary, and cell interactions.",
                        "Added generated Test page scenarios for game objects.",
                        "Added automatic roadmap-state updates from a CLI helper.",
                        "Removed completed roadmap updater work from the pending list.",
                        "Added item-effect handler registry coverage for content data.",
                        "Added enemy-behavior registry coverage for content data.",
                        "Added enemy-behavior payload reference coverage.",
                        "Added item-effect payload validation for resources, numbers, trade costs, and transform targets.",
                        "Added wearable gear metadata validation for slots, ids, rarity, and future effects.",
                        "Added relic metadata validation for ids, depths, rarity, and supported hooks.",
                        "Added room-profile and spawn-weight validation for generation references and usable weighted enemies.",
                        "Centralized authored room-template metadata and added smoke coverage for objective/template references.",
                        "Moved random room-template selection onto ROOM_TEMPLATE_DEFS so authored lesson metadata is the source of truth.",
                        "Added schema validation for authored room-template metadata keys, booleans, and reference arrays.",
                        "Added smoke coverage so random room templates must fit at least one dungeon theme.",
                        "Filtered random room-template selection by active dungeon theme and validated each theme has a compatible random lesson.",
                        "Added browser smoke coverage for active-theme room-template selection and stabilized positional-combat setup against irregular rooms.",
                        "Added room-template unlock-level smoke coverage and corrected mixedGate required enemy metadata.",
                        "Synced Markdown roadmap with the latest room-template content-scaling guardrails.",
                        "Fixed spawn-enemy inspect stat detection and added smoke coverage for spawner learning chips.",
                        "Expanded enemy inspect behavior chips for steal, drain, fog, terrain, marked cells, and weak-point planning cues.",
                        "Generalized data smoke coverage so supported tactical enemy behaviors must expose inspect learning chips.",
                        "Extended tactical enemy inspect-chip smoke coverage to Latin American Spanish labels.",
                        "Added bilingual inspect-chip coverage for planning-focused item effects such as slow and trap creation.",
                        "Added data smoke coverage for visibility, terrain, and route-risk inspect chips.",
                        "Added data smoke coverage for object-to-sprite metadata.",
                        "Added data smoke validation for sprite sheet rows and animation frame timing.",
                        "Added data smoke coverage for object usage paths across generation, themes, templates, and behavior payloads.",
                        "Added data smoke validation for enemy fallback colors.",
                        "Added data smoke coverage for relic localization.",
                        "Added data smoke coverage for relic reward-depth choice availability.",
                        "Added data smoke coverage for wearable slot uniqueness.",
                        "Added data smoke coverage for exactly one starter wearable per slot.",
                        "Centralized wearable effect metadata in the equipment system."
                    ],
                    "left": [
                        "Add data-defined behavior for more object classes.",
                        "Move reusable item-effect rules into clearer registries."
                    ],
                    "evidence": [
                        "CONTENT_MANIFEST_CHECKLIST.md",
                        "tools/smoke-data.js",
                        "tools/smoke-browser.js",
                        "tools/update-roadmap-state.js",
                        "npm run test:roadmap",
                        "src/systems/items.js",
                        "npm test",
                        "src/systems/enemies.js",
                        "CONTENT_AUTHORING_GUIDE.md",
                        "src/systems/room-templates.js",
                        "index.js",
                        "ui-development/player-experience-roadmap.md",
                        "src/systems/inspect-stats.js",
                        "src/systems/equipment.js"
                    ]
                },
                {
                    "id": "equipment",
                    "title": "Equipment Loot Loop",
                    "status": "backlog",
                    "owner": "Codex + Artist",
                    "objective": "Let the bee equip helmet, jacket, abdomen guard, sting, and wings for longer-term builds.",
                    "done": [
                        "Equipment slots and definitions exist.",
                        "Added equipment-system support for starter loadout generation.",
                        "New runs now equip the starter wearable loadout.",
                        "Added wearable minLevel metadata for future loot progression.",
                        "Added equipment availability filtering by player level.",
                        "Added deterministic equipment reward-choice candidate helper.",
                        "Added rarity-weighted equipment reward selection.",
                        "Added equipment reward replacement detail helper.",
                        "Added bundled equipment reward choice details for future UI cards.",
                        "Added slot display metadata to equipment reward details.",
                        "Added equipment effect summaries to reward details.",
                        "Added rarity and reward-weight metadata to equipment reward details.",
                        "Added equipment reward availability helper.",
                        "Added first level-2 common equipment reward tier.",
                        "Added localized slot and gear reward metadata.",
                        "Added localized equipment effect summaries for future reward cards.",
                        "Added equipment reward selection helper.",
                        "Added localized equipment rarity metadata for reward cards.",
                        "Added equipment loadout slot details for future inventory UI.",
                        "Added localized equipment reward-offer packaging for future loot UI.",
                        "Added a level-4 rare equipment reward tier with one piece per slot.",
                        "Added planned asset paths and artist request coverage for wearable gear.",
                        "Added smoke coverage tying wearable planned asset paths to artist request rows.",
                        "Added a wearable content manifest section and smoke coverage for it.",
                        "Added equipped effect total summaries for future inventory/stat UI."
                    ],
                    "left": [
                        "Design loot acquisition.",
                        "Add UI for equipment choices.",
                        "Request final wearable sprites and icons."
                    ],
                    "evidence": [
                        "src/data/content.js",
                        "ART_SPRITE_REQUESTS.md",
                        "src/systems/equipment.js",
                        "tools/smoke-data.js",
                        "npm test",
                        "index.js",
                        "tools/smoke-browser.js",
                        "CONTENT_MANIFEST_CHECKLIST.md"
                    ]
                },
                {
                    "id": "progression",
                    "title": "Long-Term Progression",
                    "status": "backlog",
                    "owner": "Codex",
                    "objective": "Use lifetime honey/pollen to unlock cosmetics, encyclopedia entries, or starting options.",
                    "done": [
                        "Player XP and level progression exist."
                    ],
                    "left": [
                        "Define persistent unlock currencies.",
                        "Add encyclopedia and cosmetic trail progression.",
                        "Add reset/testing controls for progression loops."
                    ],
                    "evidence": [
                        "src/systems/progression-system.js"
                    ]
                }
            ]
        }
    ]
};
