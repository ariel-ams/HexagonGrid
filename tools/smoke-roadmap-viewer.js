const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const childProcess = require('node:child_process');
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
assert(html.includes('statusFilters'), 'Roadmap viewer should expose status filter controls');
assert(html.includes('timeline-legend'), 'Roadmap viewer should expose a timeline legend');
assert(html.includes('detailProgress'), 'Roadmap viewer should expose progress details for selected nodes');
assert(fs.existsSync(path.join(root, 'tools', 'update-roadmap-state.js')), 'Roadmap updater script should exist');
assert(fs.existsSync(path.join(root, 'roadmap-viewer', 'dist', 'roadmap-viewer.bundle.js')), 'Roadmap viewer JS bundle should be built');
assert(fs.existsSync(path.join(root, 'roadmap-viewer', 'dist', 'roadmap-viewer.bundle.css')), 'Roadmap viewer CSS bundle should be built');
assert(viewerJs.includes("from '@xyflow/react'"), 'Roadmap viewer source should import @xyflow/react locally');
assert(viewerJs.includes('ReactFlow'), 'Roadmap viewer should render a ReactFlow component');
assert(viewerJs.includes('onNodeClick'), 'Roadmap viewer should support node selection');
assert(viewerJs.includes('getActiveStatus'), 'Roadmap viewer should expose active status filter state for browser checks');
assert(viewerJs.includes('TIMELINE_GROUPS'), 'Roadmap viewer should define chronological timeline groups');
assert(viewerJs.includes('getNodePositions'), 'Roadmap viewer should expose node positions for chronology checks');
assert(css.includes('.detail-panel'), 'Roadmap viewer should style a detail panel');
assert(css.includes('.status-filter'), 'Roadmap viewer should style status filter buttons');
assert(css.includes('.timeline-legend'), 'Roadmap viewer should style the timeline legend');

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

const tempStatePath = path.join(os.tmpdir(), `roadmap-state-${Date.now()}.js`);
fs.copyFileSync(path.join(root, 'roadmap-viewer', 'roadmap-state.js'), tempStatePath);
childProcess.execFileSync(
    process.execPath,
    [
        path.join(root, 'tools', 'update-roadmap-state.js'),
        '--node', 'content-scaling',
        '--status', 'active',
        '--current',
        '--done', 'Smoke-tested roadmap updater.',
        '--remove-left', 'Add automatic roadmap-state updates from sprint logs.',
        '--evidence', 'tools/update-roadmap-state.js',
        '--date', '2099-01-01'
    ],
    {
        cwd: root,
        env: { ...process.env, ROADMAP_STATE_PATH: tempStatePath },
        stdio: 'pipe'
    }
);

const updaterSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(tempStatePath, 'utf8'), updaterSandbox, { filename: tempStatePath });
const updatedRoadmap = updaterSandbox.window.HW_ROADMAP_STATE;
const updatedNode = updatedRoadmap.lanes.flatMap((lane) => lane.nodes).find((node) => node.id === 'content-scaling');
assert(updatedRoadmap.updatedAt === '2099-01-01', 'Roadmap updater should update the graph date');
assert(updatedRoadmap.currentTaskId === 'content-scaling', 'Roadmap updater should set currentTaskId');
assert(updatedNode.status === 'active', 'Roadmap updater should set node status');
assert(updatedNode.done.includes('Smoke-tested roadmap updater.'), 'Roadmap updater should append done entries');
assert(!updatedNode.left.includes('Add automatic roadmap-state updates from sprint logs.'), 'Roadmap updater should remove completed left entries');
assert(updatedNode.evidence.includes('tools/update-roadmap-state.js'), 'Roadmap updater should append evidence entries');
fs.unlinkSync(tempStatePath);

console.log('Roadmap viewer smoke checks passed');
