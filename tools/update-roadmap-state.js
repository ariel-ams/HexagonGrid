const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const defaultStatePath = path.join(root, 'roadmap-viewer', 'roadmap-state.js');
const statePath = process.env.ROADMAP_STATE_PATH || defaultStatePath;
const VALID_STATUSES = new Set(['active', 'in_progress', 'planned', 'backlog', 'done', 'blocked']);

function usage() {
    console.log(`Usage:
node tools/update-roadmap-state.js --node <id> [options]

Options:
  --status <status>       Set node status: active, in_progress, planned, backlog, done, blocked
  --current               Set this node as currentTaskId
  --done <text>           Append a done entry
  --left <text>           Append a left entry
  --remove-left <text>    Remove an exact left entry after it is completed
  --evidence <text>       Append an evidence entry
  --date <YYYY-MM-DD>     Set updatedAt, defaults to today
  --help                  Show this help

Use ROADMAP_STATE_PATH to update a copy during tests.`);
}

function parseArgs(argv) {
    const options = {
        done: [],
        left: [],
        removeLeft: [],
        evidence: []
    };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--help') {
            options.help = true;
            continue;
        }
        if (arg === '--current') {
            options.current = true;
            continue;
        }
        const next = argv[index + 1];
        if (!next || next.startsWith('--')) {
            throw new Error(`${arg} needs a value`);
        }
        if (arg === '--node') options.node = next;
        else if (arg === '--status') options.status = next;
        else if (arg === '--done') options.done.push(next);
        else if (arg === '--left') options.left.push(next);
        else if (arg === '--remove-left') options.removeLeft.push(next);
        else if (arg === '--evidence') options.evidence.push(next);
        else if (arg === '--date') options.date = next;
        else throw new Error(`Unknown option ${arg}`);
        index += 1;
    }

    return options;
}

function loadState(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(code, sandbox, { filename: filePath });
    if (!sandbox.window.HW_ROADMAP_STATE) {
        throw new Error(`No HW_ROADMAP_STATE found in ${filePath}`);
    }
    return sandbox.window.HW_ROADMAP_STATE;
}

function findNode(roadmap, nodeId) {
    for (const lane of roadmap.lanes || []) {
        const node = (lane.nodes || []).find((candidate) => candidate.id === nodeId);
        if (node) return node;
    }
    return null;
}

function appendUnique(list, entries) {
    entries.forEach((entry) => {
        const text = entry.trim();
        if (text && !list.includes(text)) list.push(text);
    });
}

function removeExact(list, entries) {
    entries.forEach((entry) => {
        const text = entry.trim();
        if (!text) return;
        const index = list.indexOf(text);
        if (index >= 0) list.splice(index, 1);
    });
}

function formatState(roadmap) {
    return `window.HW_ROADMAP_STATE = ${JSON.stringify(roadmap, null, 4)};\n`;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
        usage();
        return;
    }
    if (!options.node) throw new Error('--node is required');
    if (options.status && !VALID_STATUSES.has(options.status)) {
        throw new Error(`Invalid status ${options.status}`);
    }

    const roadmap = loadState(statePath);
    const node = findNode(roadmap, options.node);
    if (!node) throw new Error(`Roadmap node not found: ${options.node}`);

    if (options.status) node.status = options.status;
    appendUnique(node.done, options.done);
    appendUnique(node.left, options.left);
    removeExact(node.left, options.removeLeft);
    appendUnique(node.evidence, options.evidence);
    if (options.current) roadmap.currentTaskId = node.id;
    roadmap.updatedAt = options.date || today();

    fs.writeFileSync(statePath, formatState(roadmap));
    console.log(`Updated roadmap node ${node.id} in ${path.relative(root, statePath) || statePath}`);
}

try {
    main();
} catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
}
