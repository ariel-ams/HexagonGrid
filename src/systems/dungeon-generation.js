// Dungeon shape and portal generation for Honeycomb Wayfinder.
(() => {
function createDungeonGenerator(context) {
    const { directions, helpers } = context;

    function generateCaveBlob(targetCount) {
        const cells = new Map();
        const frontier = [{ q: 0, r: 0 }];
        cells.set(helpers.cellKey(0, 0), { q: 0, r: 0 });

        while (cells.size < targetCount) {
            const origin = randomFrom(frontier);
            const shuffled = [...directions].sort(() => helpers.seededRandom() - 0.5);

            shuffled.forEach((direction) => {
                if (cells.size >= targetCount) return;
                const q = origin.q + direction.q;
                const r = origin.r + direction.r;
                const key = helpers.cellKey(q, r);
                if (cells.has(key)) return;

                const neighborCount = directions.filter((neighbor) => (
                    cells.has(helpers.cellKey(q + neighbor.q, r + neighbor.r))
                )).length;
                const acceptance = neighborCount >= 2 ? 0.92 : 0.58;

                if (helpers.seededRandom() < acceptance) {
                    const cell = { q, r };
                    cells.set(key, cell);
                    frontier.push(cell);
                }
            });

            if (helpers.seededRandom() < 0.12) {
                frontier.push(randomFrom([...cells.values()]));
            }
        }

        return [...cells.values()];
    }

    function choosePortalCells(cells) {
        const centerSorted = [...cells].sort((a, b) => (
            helpers.hexDistance(0, 0, b.q, b.r) - helpers.hexDistance(0, 0, a.q, a.r)
        ));
        const outerCells = centerSorted.slice(0, Math.max(12, Math.floor(cells.length * 0.22)));
        const entry = randomFrom(outerCells);
        const exit = [...outerCells]
            .filter((cell) => cell !== entry)
            .sort((a, b) => (
                helpers.hexDistance(entry.q, entry.r, b.q, b.r) - helpers.hexDistance(entry.q, entry.r, a.q, a.r)
            ))[0];
        return { entry, exit };
    }

    function randomFrom(items) {
        return items[Math.floor(helpers.seededRandom() * items.length)];
    }

    return {
        generateCaveBlob,
        choosePortalCells,
        randomFrom
    };
}

window.HW_DUNGEON_GENERATION = {
    createDungeonGenerator
};
})();
