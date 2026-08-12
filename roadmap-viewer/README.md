# Honeycomb Wayfinder Roadmap Viewer

This folder contains a static React Flow viewer for the project roadmap.

Open it through the same local server used for the game:

```powershell
python -m http.server 8080
```

Then visit:

```text
http://localhost:8080/roadmap-viewer/
```

## How It Works

- `index.html` defines the shell, side panel, and links back to the source roadmap docs.
- `roadmap-state.js` is the editable source of truth for graph status.
- `roadmap-viewer.js` renders that data with React Flow.
- `roadmap-viewer.css` keeps the viewer visually aligned with the game's dark honeycomb UI.

Future sprint work should update `roadmap-state.js` when a node changes status, when the active task changes, or when new evidence is added.

## Status Values

Use these status values:

- `active`: the task currently being worked.
- `in_progress`: started but not the active slice.
- `planned`: accepted next work.
- `backlog`: useful later, not ready for immediate work.
- `done`: completed and verified.
- `blocked`: cannot move without a decision, asset, or external change.

## Adding A Node

Add a node under the best lane in `roadmap-state.js`:

```js
{
    id: 'short-stable-id',
    title: 'Readable Title',
    status: 'planned',
    owner: 'Codex',
    objective: 'What user/project outcome this node improves.',
    done: [],
    left: ['The next smallest concrete step.'],
    evidence: ['File or command that proves the state.']
}
```

Keep labels short. Put details in the side panel fields rather than the node title.

## Dependency Note

The viewer uses React, React DOM, and `@xyflow/react` through a small local esbuild bundle. Rebuild the checked-in bundle after changing `roadmap-viewer/roadmap-viewer.js`:

```powershell
npm run build:roadmap
```

This keeps the viewer GitHub Pages-friendly and avoids CDN/network access during local browser checks.

## Checks

The full project check includes the roadmap data and browser render checks:

```powershell
npm test
```

For roadmap-only changes, use the faster focused suite:

```powershell
npm run test:roadmap
```

Run the data-contract check by itself:

```powershell
node tools/smoke-roadmap-viewer.js
```

Run the visual browser pass by itself. It loads React Flow and saves `.codex-video-frames/roadmap-viewer.png`:

```powershell
node tools/smoke-roadmap-browser.js
```

The browser check uses the local bundle and should not need CDN access.
