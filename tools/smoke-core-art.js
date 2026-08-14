const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'assets', 'style-sources', 'lamp-style-core', 'manifest.json');

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function readPngSize(filePath) {
    const data = fs.readFileSync(filePath);
    assert(data.toString('ascii', 1, 4) === 'PNG', `Expected PNG file: ${filePath}`);
    return {
        width: data.readUInt32BE(16),
        height: data.readUInt32BE(20)
    };
}

function readPngCornerAlpha(filePath) {
    const data = fs.readFileSync(filePath);
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    const bitDepth = data[24];
    const colorType = data[25];
    assert(bitDepth === 8 && colorType === 6, `Expected 8-bit RGBA PNG: ${filePath}`);

    const idat = [];
    let offset = 8;
    while (offset < data.length) {
        const length = data.readUInt32BE(offset);
        const type = data.toString('ascii', offset + 4, offset + 8);
        if (type === 'IDAT') idat.push(data.subarray(offset + 8, offset + 8 + length));
        offset += 12 + length;
    }

    const raw = zlib.inflateSync(Buffer.concat(idat));
    const bytesPerPixel = 4;
    const stride = width * bytesPerPixel;
    let sourceOffset = 0;
    let previous = Buffer.alloc(stride);
    let topLeft = null;
    let bottomRight = null;

    for (let y = 0; y < height; y += 1) {
        const filter = raw[sourceOffset];
        sourceOffset += 1;
        const row = Buffer.from(raw.subarray(sourceOffset, sourceOffset + stride));
        sourceOffset += stride;

        for (let x = 0; x < stride; x += 1) {
            const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
            const up = previous[x];
            const upLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
            if (filter === 1) row[x] = (row[x] + left) & 255;
            if (filter === 2) row[x] = (row[x] + up) & 255;
            if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
            if (filter === 4) {
                const estimate = left + up - upLeft;
                const leftDistance = Math.abs(estimate - left);
                const upDistance = Math.abs(estimate - up);
                const diagonalDistance = Math.abs(estimate - upLeft);
                const predictor = leftDistance <= upDistance && leftDistance <= diagonalDistance
                    ? left
                    : (upDistance <= diagonalDistance ? up : upLeft);
                row[x] = (row[x] + predictor) & 255;
            }
            assert(filter >= 0 && filter <= 4, `Unsupported PNG filter ${filter}: ${filePath}`);
        }

        if (y === 0) topLeft = row[3];
        if (y === height - 1) bottomRight = row[(width - 1) * bytesPerPixel + 3];
        previous = row;
    }

    return { topLeft, bottomRight };
}

assert(fs.existsSync(manifestPath), 'Lamp-style core art manifest is missing');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.styleVersion === 'lamp-style-core-v1', 'Unexpected Lamp-style core art version');
assert(Array.isArray(manifest.assets) && manifest.assets.length === 10, 'Core art manifest must define exactly ten assets');
const checksumPath = path.join(root, manifest.backupRoot, 'checksums.sha256');
assert(fs.existsSync(checksumPath), 'Core art backup checksum file is missing');
const backupChecksums = new Map(fs.readFileSync(checksumPath, 'utf8')
    .trim()
    .split(/\r?\n/)
    .map((line) => {
        const [hash, relativePath] = line.trim().split(/\s{2,}/);
        return [relativePath.replace(/\\/g, '/'), hash];
    }));

manifest.assets.forEach((asset) => {
    assert(asset.id && asset.runtimePath && asset.sourcePath && asset.promptPath, `Incomplete core art manifest entry: ${asset.id || 'unknown'}`);
    assert(asset.columns === 4 && Number.isInteger(asset.rows) && asset.rows > 0, `Invalid sprite grid for ${asset.id}`);
    assert(fs.existsSync(path.join(root, asset.sourcePath)), `Generated source missing for ${asset.id}`);
    assert(fs.existsSync(path.join(root, asset.promptPath)), `Generation prompt missing for ${asset.id}`);
    assert(fs.existsSync(path.join(root, asset.runtimePath)), `Runtime sprite missing for ${asset.id}`);
    const runtimePath = path.join(root, asset.runtimePath);
    const backupPath = path.join(root, manifest.backupRoot, asset.runtimePath);
    assert(fs.existsSync(backupPath), `Backup sprite missing for ${asset.id}`);

    const backupHash = crypto.createHash('sha256').update(fs.readFileSync(backupPath)).digest('hex');
    const runtimeHash = crypto.createHash('sha256').update(fs.readFileSync(runtimePath)).digest('hex');
    assert(backupChecksums.get(asset.runtimePath) === backupHash, `Backup checksum mismatch for ${asset.id}`);
    assert(runtimeHash !== backupHash, `Lamp-style runtime sprite did not replace the backed-up ${asset.id}`);

    const size = readPngSize(runtimePath);
    assert(size.width === asset.frameSize * asset.columns, `Runtime width mismatch for ${asset.id}`);
    assert(size.height === asset.frameSize * asset.rows, `Runtime height mismatch for ${asset.id}`);
    const alpha = readPngCornerAlpha(runtimePath);
    assert(alpha.topLeft === 0 && alpha.bottomRight === 0, `Runtime corners must be transparent for ${asset.id}`);
});

console.log('Core Lamp-style art smoke checks passed');
