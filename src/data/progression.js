// Room pacing, unlock, and XP tuning data for Honeycomb Wayfinder.
(() => {
const DUNGEON_CELL_TARGET = 154;
const BASE_XP_TO_LEVEL = 24;

const ROOM_PROFILES = [
    {
        depth: 1,
        targetCells: 54,
        safeRadius: 3,
        maxEnemies: 1,
        maxHazards: 0,
        maxSpecialItems: 0,
        allowedEnemies: ['enemy'],
        allowedDiscovery: [],
        allowedUtility: [],
        itemWeights: [
            { object: 'empty', weight: 55 },
            { object: 'pollen', weight: 22 },
            { object: 'water', weight: 18 },
            { object: 'upgrade', weight: 5 }
        ]
    },
    {
        depth: 2,
        targetCells: 78,
        safeRadius: 2,
        maxEnemies: 2,
        maxHazards: 2,
        maxSpecialItems: 2,
        allowedEnemies: ['enemy', 'thornBeetle'],
        allowedDiscovery: ['honeyDrop', 'glowPollen'],
        allowedUtility: ['npc', 'upgrade'],
        itemWeights: [
            { object: 'empty', weight: 38 },
            { object: 'pollen', weight: 18 },
            { object: 'water', weight: 18 },
            { object: 'upgrade', weight: 9 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 5 },
            { object: 'discovery', weight: 7 }
        ]
    },
    {
        depth: 3,
        targetCells: 108,
        safeRadius: 2,
        maxEnemies: 4,
        maxHazards: 4,
        maxSpecialItems: 4,
        allowedEnemies: ['enemy', 'thornBeetle', 'miteSwarm', 'bat', 'honeySnareSpider', 'pollenThiefMoth'],
        allowedDiscovery: ['honeyDrop', 'glowPollen', 'stingUpgrade', 'cleanWater'],
        allowedUtility: ['npc', 'upgrade', 'stingUpgrade'],
        itemWeights: [
            { object: 'empty', weight: 30 },
            { object: 'pollen', weight: 15 },
            { object: 'water', weight: 15 },
            { object: 'upgrade', weight: 8 },
            { object: 'stingUpgrade', weight: 6 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 7 },
            { object: 'discovery', weight: 10 },
            { object: 'enemy', weight: 4 }
        ]
    },
    {
        depth: 4,
        targetCells: 132,
        safeRadius: 2,
        maxEnemies: 7,
        maxHazards: 7,
        maxSpecialItems: 7,
        allowedEnemies: ['enemy', 'thornBeetle', 'miteSwarm', 'bat', 'guardWasp', 'sleepingBat', 'waxMoth', 'fogMoth', 'honeyLeech', 'waspHive', 'crawlingFire', 'honeySnareSpider', 'pollenThiefMoth', 'burrowBeetle', 'queenSignaler', 'fogShepherd', 'waterLeech', 'waxSentinel'],
        allowedDiscovery: ['honeyDrop', 'glowPollen', 'cleanWater', 'smokePuff', 'flowerMap', 'compassPollen', 'nectarCache', 'waxDoor', 'stickyHoney'],
        allowedUtility: ['npc', 'upgrade', 'stingUpgrade'],
        itemWeights: [
            { object: 'empty', weight: 26 },
            { object: 'pollen', weight: 12 },
            { object: 'water', weight: 12 },
            { object: 'upgrade', weight: 7 },
            { object: 'stingUpgrade', weight: 6 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 8 },
            { object: 'discovery', weight: 14 },
            { object: 'enemy', weight: 10 }
        ]
    },
    {
        depth: 5,
        targetCells: DUNGEON_CELL_TARGET,
        safeRadius: 2,
        maxEnemies: 10,
        maxHazards: 9,
        maxSpecialItems: 9,
        allowedEnemies: ['enemy', 'thornBeetle', 'miteSwarm', 'bat', 'guardWasp', 'sleepingBat', 'waxMoth', 'fogMoth', 'honeyLeech', 'broodWasp', 'stagBeetle', 'falseFlower', 'waspHive', 'crawlingFire', 'honeySnareSpider', 'burrowBeetle', 'queenSignaler', 'fogShepherd', 'pollenThiefMoth', 'waxSentinel', 'mirrorWasp', 'combBomber', 'waterLeech', 'larvaBrood'],
        allowedDiscovery: ['honeyDrop', 'glowPollen', 'cleanWater', 'smokePuff', 'sunShard', 'flowerMap', 'royalNectar', 'compassPollen', 'nectarCache', 'waxDoor', 'stickyHoney'],
        allowedUtility: ['npc', 'upgrade', 'stingUpgrade'],
        itemWeights: [
            { object: 'empty', weight: 24 },
            { object: 'pollen', weight: 10 },
            { object: 'water', weight: 10 },
            { object: 'upgrade', weight: 6 },
            { object: 'stingUpgrade', weight: 6 },
            { object: 'npc', weight: 2 },
            { object: 'vine', weight: 9 },
            { object: 'discovery', weight: 15 },
            { object: 'enemy', weight: 15 }
        ]
    }
];

const OBJECT_UNLOCK_LEVELS = {
    empty: 1,
    entry: 1,
    exit: 1,
    finalExit: 1,
    wall: 1,
    pollen: 1,
    water: 1,
    upgrade: 1,
    enemy: 1,
    npc: 2,
    vine: 2,
    thornBeetle: 2,
    honeyDrop: 2,
    glowPollen: 2,
    stingUpgrade: 3,
    bat: 3,
    miteSwarm: 3,
    cleanWater: 3,
    nectarCache: 3,
    compassPollen: 3,
    stickyHoney: 3,
    honeySnareSpider: 3,
    pollenThiefMoth: 3,
    waxDoor: 3,
    burningCell: 3,
    waspHive: 4,
    crawlingFire: 4,
    waterLeech: 4,
    smokePuff: 4,
    flowerMap: 4,
    guardWasp: 4,
    sleepingBat: 4,
    waxMoth: 4,
    fogMoth: 4,
    fogShepherd: 4,
    honeyLeech: 4,
    burrowBeetle: 5,
    queenSignaler: 5,
    waxSentinel: 5,
    royalNectar: 5,
    sunShard: 5,
    broodWasp: 5,
    stagBeetle: 5,
    falseFlower: 5,
    mirrorWasp: 6,
    combBomber: 6,
    larvaBrood: 6,
    burrowWarningCell: 6,
    bomberMarkedCell: 6
};

const XP_REWARDS = {
    item: 3,
    specialItem: 7,
    enemy: 12,
    room: 24,
    objective: 10,
    danceStep: 1,
    danceMove: 5
};

window.HW_PROGRESSION = {
    BASE_XP_TO_LEVEL,
    OBJECT_UNLOCK_LEVELS,
    ROOM_PROFILES,
    XP_REWARDS
};
})();
