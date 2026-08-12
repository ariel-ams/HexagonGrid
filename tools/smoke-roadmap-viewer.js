const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const viewerDir = path.join(root, 'roadmap-viewer');

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const html = read('roadmap-viewer/index.html');
const viewerJs = read('roadmap-viewer/roadmap-viewer.js');
const stateJs = read('roadmap-viewer/roadmap-state.js');
const css = read('roadmap-viewer/roadmap-viewer.css');

assert(fs.existsSync(viewerDir), 'Roadmap viewer directory should exist');
assert(html.includes('roadmap-state.js'), 'Roadmap viewer should load roadmap state first');
assert(html.includes('dist/roadmap-viewer.bundle.js'), 'Roadmap viewer should load the local React Flow bundle');
assert(html.includes('dist/roadmap-viewer.bundle.css'), 'Roadmap viewer should load the local React Flow bundle styles');
assert(fs.existsSync(path.join(root, 'roadmap-viewer', 'dist', 'roadmap-viewer.bundle.js')), 'Roadmap viewer JS bundle should be built');
assert(fs.existsSync(path.join(root, 'roadmap-viewer', 'dist', 'roadmap-viewer.bundle.css')), 'Roadmap viewer CSS bundle should be built');
assert(viewerJs.includes("from '@xyflow/react'"), 'Roadmap viewer source should import @xyflow/react locally');
assert(viewerJs.includes('ReactFlow'), 'Roadmap viewer should render a ReactFlow component');
assert(viewerJs.includes('onNodeClick'), 'Roadmap viewer should support node selection');
assert(css.includes('.detail-panel'), 'Roadmap viewer should style a detail panel');

const sandbox = { window: {} };
vm.runInNewContext(stateJs, sandbox, { filename: 'roadmap-viewer/roadmap-state.js' });

const roadmap = sandbox.window.HW_ROADMAP_STATE;
assert(roadmap, 'Roadmap state should register on window.HW_ROADMAP_STATE');
assert(typeof roadmap.updatedAt === 'string' && roadmap.updatedAt, 'Roadmap state should expose updatedAt');
assert(typeof roadmap.summary === 'string' && roadmap.summary.length > 20, 'Roadmap state should expose a useful summary');
assert(Array.isArray(roadmap.lanes) && roadmap.lanes.length >= 3, 'Roadmap state should include at least three lanes');

const nodeIds = new Set();
let currentNode = null;
roadmap.lanes.forEach((lane) => {
    assert(lane.id && lane.title && lane.status, `Lane ${lane.id || '<missing>'} needs id, title, and status`);
    assert(Array.isArray(lane.nodes) && lane.nodes.length > 0, `Lane ${lane.id} should include nodes`);
    lane.nodes.forEach((node) => {
        assert(node.id && node.title && node.status, `Node in lane ${lane.id} needs id, title, and status`);
        assert(!nodeIds.has(node.id), `Duplicate roadmap node id ${node.id}`);
        nodeIds.add(node.id);
        assert(typeof node.objective === 'string' && node.objective.length > 20, `Node ${node.id} needs an objective`);
        assert(Array.isArray(node.done), `Node ${node.id} needs a done list`);
        assert(Array.isArray(node.left), `Node ${node.id} needs a left list`);
        assert(Array.isArray(node.evidence), `Node ${node.id} needs an evidence list`);
        if (node.id === roadmap.currentTaskId) currentNode = node;
    });
});

assert(currentNode, `Current task ${roadmap.currentTaskId} should match a roadmap node`);
assert(currentNode.status === 'active' || currentNode.status === 'in_progress', 'Current task should be active or in progress');

console.log('Roadmap viewer smoke checks passed');
