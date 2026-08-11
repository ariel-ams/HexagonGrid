// Small canvas rendering utilities shared by the dungeon renderer.
(() => {
function createRendererTools(context) {
    const { imageFactory = () => new Image() } = context || {};

    function loadImages(defs, target, onUpdate) {
        Object.entries(defs).forEach(([key, src]) => {
            const image = imageFactory();
            image.onload = () => {
                target[key] = image;
                if (onUpdate) onUpdate(key, image);
            };
            image.onerror = () => {
                target[key] = null;
                if (onUpdate) onUpdate(key, null);
            };
            image.src = src;
        });
    }

    function drawImageCover(ctx, image, x, y, width, height) {
        const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const drawX = x + (width - drawWidth) / 2;
        const drawY = y + (height - drawHeight) / 2;
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    }

    function drawHexPath(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i - Math.PI / 6;
            const cornerX = x + size * Math.cos(angle);
            const cornerY = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(cornerX, cornerY);
            } else {
                ctx.lineTo(cornerX, cornerY);
            }
        }
        ctx.closePath();
    }

    function drawTileArt(ctx, image, x, y, size, alpha = 1) {
        if (!image?.complete || !image.naturalWidth) return false;
        const drawSize = size * 2;
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 6);
        ctx.drawImage(image, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        ctx.restore();
        return true;
    }

    function drawSheetTile(ctx, image, meta, x, y, size, row, column, alpha = 1) {
        if (!image?.complete || !image.naturalWidth || !meta) return false;
        const frameSize = meta.frameSize;
        const sourceInset = Math.max(0, Math.min(frameSize * 0.2, meta.sourceInset || 0));
        const sourceSize = Math.max(1, frameSize - sourceInset * 2);
        const sourceX = Math.max(0, Math.min(meta.columns - 1, column)) * frameSize + sourceInset;
        const sourceY = Math.max(0, Math.min(meta.rows - 1, row)) * frameSize + sourceInset;
        const drawSize = size * 2 * (meta.drawScale || 1);
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.drawImage(
            image,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            x - drawSize / 2,
            y - drawSize / 2,
            drawSize,
            drawSize
        );
        ctx.restore();
        return true;
    }

    return {
        drawHexPath,
        drawImageCover,
        drawTileArt,
        drawSheetTile,
        loadImages
    };
}

window.HW_RENDERER = {
    createRendererTools
};
})();
