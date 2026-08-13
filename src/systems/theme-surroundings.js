// Deterministic, non-playable mosaic grouping for dungeon surroundings.
(() => {
const BLOCK_OFFSETS = [
    { q: 0, r: 0 },
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: 1, r: 1 }
];

const PIECE_PATTERNS = [
    [[0, 1, 2, 3]],
    [[0, 1, 2], [3]],
    [[0, 1], [2, 3]],
    [[0, 2], [1], [3]]
];

function createThemeSurroundingsSystem(context) {
    const { cellKey } = context;

    function decorateCells(cells, options = {}) {
        const playable = options.playable || new Set();
        const seed = Math.floor(Number(options.seed) || 0);
        const baseRows = Math.max(1, Math.floor(Number(options.baseRows) || 1));
        const columns = Math.max(1, Math.floor(Number(options.columns) || 1));
        const blocks = new Map();

        cells.forEach((cell) => {
            const anchorQ = Math.floor(cell.q / 2) * 2;
            const anchorR = Math.floor(cell.r / 2) * 2;
            const key = cellKey(anchorQ, anchorR);
            if (!blocks.has(key)) blocks.set(key, { anchorQ, anchorR, cells: [] });
            blocks.get(key).cells.push(cell);
        });

        blocks.forEach((block) => {
            const intersectsPlayable = BLOCK_OFFSETS.some((offset) => (
                playable.has(cellKey(block.anchorQ + offset.q, block.anchorR + offset.r))
            ));
            const patternIndex = positiveMod(block.anchorQ / 2 + block.anchorR / 2 + seed, PIECE_PATTERNS.length);
            const groups = intersectsPlayable
                ? BLOCK_OFFSETS.map((_, index) => [index])
                : PIECE_PATTERNS[patternIndex];
            const groupByOffset = new Map();

            groups.forEach((group, groupIndex) => {
                group.forEach((offsetIndex) => groupByOffset.set(offsetIndex, { group, groupIndex }));
            });

            block.cells.forEach((cell) => {
                const offsetIndex = BLOCK_OFFSETS.findIndex((offset) => (
                    block.anchorQ + offset.q === cell.q && block.anchorR + offset.r === cell.r
                ));
                const piece = groupByOffset.get(offsetIndex) || { group: [offsetIndex], groupIndex: offsetIndex };
                const pieceAnchorOffset = BLOCK_OFFSETS[piece.group[0]] || { q: 0, r: 0 };
                const pieceAnchorQ = block.anchorQ + pieceAnchorOffset.q;
                const pieceAnchorR = block.anchorR + pieceAnchorOffset.r;
                const pieceSeed = pieceAnchorQ * 31 + pieceAnchorR * 47 + seed * 17 + piece.groupIndex * 13;

                cell.environmentPieceId = `${pieceAnchorQ},${pieceAnchorR}:${piece.groupIndex}`;
                cell.environmentPieceSize = piece.group.length;
                cell.environmentPieceAnchor = { q: pieceAnchorQ, r: pieceAnchorR };
                cell.themeTileRow = positiveMod(pieceSeed, baseRows);
                cell.themeTileVariant = positiveMod(pieceSeed * 7 + 11, columns);
            });
        });

        return cells;
    }

    function summarize(cells) {
        const pieces = new Map();
        cells.forEach((cell) => {
            if (!cell.environmentPieceId || pieces.has(cell.environmentPieceId)) return;
            pieces.set(cell.environmentPieceId, {
                id: cell.environmentPieceId,
                size: cell.environmentPieceSize,
                row: cell.themeTileRow,
                variant: cell.themeTileVariant
            });
        });
        const ordered = [...pieces.values()].sort((a, b) => a.id.localeCompare(b.id));
        return {
            pieceCount: ordered.length,
            pieceSizes: [...new Set(ordered.map((piece) => piece.size))].sort((a, b) => a - b),
            placementFingerprint: ordered.map((piece) => `${piece.id}:${piece.size}:${piece.row}:${piece.variant}`).join('|')
        };
    }

    return { decorateCells, summarize };
}

function positiveMod(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
}

window.HW_THEME_SURROUNDINGS = {
    createThemeSurroundingsSystem
};
})();
