window.HW_ROADMAP_STATE = {
    "updatedAt": "2026-08-12",
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
                        "Removed stale room-template pass-through wrappers."
                    ],
                    "left": [
                        "Move remaining end-screen assembly.",
                        "Extract boss scripting when boss behavior stabilizes.",
                        "Move more item-effect branches only when reusable handlers emerge."
                    ],
                    "evidence": [
                        "src/README.md",
                        "src/systems/"
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
                        "Added enemy-behavior registry coverage for content data."
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
                        "src/systems/enemies.js"
                    ]
                },
                {
                    "id": "equipment",
                    "title": "Equipment Loot Loop",
                    "status": "backlog",
                    "owner": "Codex + Artist",
                    "objective": "Let the bee equip helmet, jacket, abdomen guard, sting, and wings for longer-term builds.",
                    "done": [
                        "Equipment slots and definitions exist."
                    ],
                    "left": [
                        "Design loot acquisition.",
                        "Add UI for equipment choices.",
                        "Request final wearable sprites and icons."
                    ],
                    "evidence": [
                        "src/data/content.js",
                        "ART_SPRITE_REQUESTS.md"
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
