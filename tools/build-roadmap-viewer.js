const path = require('node:path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

esbuild.build({
    absWorkingDir: root,
    entryPoints: ['././roadmap-viewer/roadmap-viewer.js'],
    outfile: 'roadmap-viewer/dist/roadmap-viewer.bundle.js',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    sourcemap: false,
    minify: false,
    legalComments: 'none',
    logLevel: 'info'
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
