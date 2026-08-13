import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    Background,
    Controls,
    Handle,
    MarkerType,
    Position,
    ReactFlow,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const STATUS_COLORS = {
    active: '#5fe08c',
    in_progress: '#67b7ff',
    planned: '#c9a7ff',
    backlog: '#9fa9a4',
    done: '#92d49e',
    blocked: '#e46d57'
};

const STATUS_LABELS = {
    active: 'Active',
    in_progress: 'In Progress',
    planned: 'Planned',
    backlog: 'Backlog',
    done: 'Done',
    blocked: 'Blocked'
};

const FILTER_OPTIONS = ['all', 'active', 'in_progress', 'planned', 'backlog', 'done', 'blocked'];
const TIMELINE_GROUPS = [
    { id: 'done', label: 'Done', statuses: ['done'], x: 40 },
    { id: 'now', label: 'Now', statuses: ['active', 'in_progress'], x: 390 },
    { id: 'later', label: 'Later', statuses: ['planned', 'backlog', 'blocked'], x: 740 }
];
const TIMELINE_GROUP_BY_STATUS = TIMELINE_GROUPS.reduce((groups, group) => {
    group.statuses.forEach((status) => {
        groups[status] = group;
    });
    return groups;
}, {});

function getTimelineGroup(status) {
    return TIMELINE_GROUP_BY_STATUS[status] || TIMELINE_GROUPS[TIMELINE_GROUPS.length - 1];
}

function flattenRoadmap(roadmap) {
    return roadmap.lanes.flatMap((lane, laneIndex) => (
        lane.nodes.map((node, nodeIndex) => ({
            ...node,
            laneId: lane.id,
            laneTitle: lane.title,
            laneIndex,
            nodeIndex
        }))
    ));
}

function buildFlowElements(roadmap) {
    const edges = [];
    const nodeGap = 172;
    const startY = 40;
    const phaseCounts = {};
    const orderedNodes = [...flattenRoadmap(roadmap)].sort((a, b) => {
        const phaseA = TIMELINE_GROUPS.findIndex((group) => group.id === getTimelineGroup(a.status).id);
        const phaseB = TIMELINE_GROUPS.findIndex((group) => group.id === getTimelineGroup(b.status).id);
        if (phaseA !== phaseB) return phaseA - phaseB;
        if (a.laneIndex !== b.laneIndex) return a.laneIndex - b.laneIndex;
        return a.nodeIndex - b.nodeIndex;
    });

    const nodes = orderedNodes.map((roadmapNode) => {
        const timelineGroup = getTimelineGroup(roadmapNode.status);
        const phaseIndex = phaseCounts[timelineGroup.id] || 0;
        phaseCounts[timelineGroup.id] = phaseIndex + 1;
        const isCurrent = roadmapNode.id === roadmap.currentTaskId;
        return {
            id: roadmapNode.id,
            type: 'roadmapNode',
            position: {
                x: timelineGroup.x,
                y: startY + phaseIndex * nodeGap
            },
            data: {
                ...roadmapNode,
                phaseId: timelineGroup.id,
                phaseLabel: timelineGroup.label,
                isCurrent
            }
        };
    });

    orderedNodes.forEach((roadmapNode, index) => {
        const target = orderedNodes[index + 1]?.id;
        if (target) {
            edges.push({
                id: `${roadmapNode.id}-${target}`,
                source: roadmapNode.id,
                target,
                type: 'smoothstep',
                animated: target === roadmap.currentTaskId || roadmapNode.id === roadmap.currentTaskId,
                markerEnd: { type: MarkerType.ArrowClosed }
            });
        }
    });

    return { nodes, edges };
}

function RoadmapNode({ data }) {
    const color = STATUS_COLORS[data.status] || STATUS_COLORS.planned;
    return React.createElement(
        'article',
        {
            className: `roadmap-node ${data.isCurrent ? 'active' : ''}`,
            style: { '--node-color': color },
            tabIndex: 0,
            'aria-label': `${data.title}, ${STATUS_LABELS[data.status] || data.status}`
        },
        React.createElement(Handle, { type: 'target', position: Position.Left }),
        React.createElement('p', { className: 'roadmap-node-title' }, data.title),
        React.createElement(
            'div',
            { className: 'roadmap-node-meta' },
            React.createElement('span', null, data.phaseLabel),
            React.createElement('span', { className: 'roadmap-node-status' }, STATUS_LABELS[data.status] || data.status)
        ),
        React.createElement('p', { className: 'roadmap-node-lane' }, data.laneTitle),
        React.createElement(Handle, { type: 'source', position: Position.Right })
    );
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderList(id, items) {
    const element = document.getElementById(id);
    if (!element) return;
    const content = items?.length ? items : ['Nothing recorded yet.'];
    element.replaceChildren(...content.map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
    }));
}

function updateDetailPanel(selected) {
    setText('detailTitle', selected?.title || 'Select a node');
    setText('detailObjective', selected?.objective || 'Click a roadmap node to see what is done, what is left, and which files provide evidence.');
    setText('detailStatus', selected ? (STATUS_LABELS[selected.status] || selected.status) : '-');
    setText('detailOwner', selected?.owner || '-');
    setText('detailPhase', selected?.phaseLabel || '-');
    setText('detailLane', selected?.laneTitle || '-');
    setText('detailProgress', selected
        ? `${selected.done?.length || 0} done, ${selected.left?.length || 0} left${selected.isCurrent ? ' - current focus' : ''}`
        : '-');
    setText('detailNextAction', selected?.left?.[0] || 'No next action recorded.');
    renderList('detailDone', selected?.done);
    renderList('detailLeft', selected?.left);
    renderList('detailEvidence', selected?.evidence);
}

function updateStaticHeader(roadmap) {
    setText('roadmapSummary', roadmap.summary);
    setText('updatedAt', `Updated ${roadmap.updatedAt}`);
}

function getStatusCounts(nodes) {
    return nodes.reduce((counts, node) => {
        counts[node.status] = (counts[node.status] || 0) + 1;
        counts.all += 1;
        return counts;
    }, { all: 0 });
}

function getStatusLabel(status) {
    return status === 'all' ? 'All' : (STATUS_LABELS[status] || status);
}

function updateStatusSummary(activeStatus, visibleCount, totalCount) {
    const label = getStatusLabel(activeStatus).toLowerCase();
    setText('statusSummary', activeStatus === 'all'
        ? `Showing all ${totalCount} roadmap nodes.`
        : `Showing ${visibleCount} ${label} node${visibleCount === 1 ? '' : 's'} out of ${totalCount}.`);
}

function renderStatusFilters({ activeStatus, counts, onSelect }) {
    const element = document.getElementById('statusFilters');
    if (!element) return;
    element.replaceChildren(...FILTER_OPTIONS
        .filter((status) => status === 'all' || counts[status])
        .map((status) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'status-filter';
            button.dataset.statusFilter = status;
            button.style.setProperty('--filter-color', STATUS_COLORS[status] || '#f3c34a');
            button.setAttribute('aria-pressed', String(activeStatus === status));
            button.textContent = `${getStatusLabel(status)} ${counts[status] || 0}`;
            button.addEventListener('click', () => onSelect(status));
            return button;
        }));
}

function RoadmapApp({ roadmap }) {
    const flow = useReactFlow();
    const allNodes = useMemo(() => flattenRoadmap(roadmap), [roadmap]);
    const [activeStatus, setActiveStatus] = useState('all');
    const statusCounts = useMemo(() => getStatusCounts(allNodes), [allNodes]);
    const flowElements = useMemo(() => buildFlowElements(roadmap), [roadmap]);
    const currentNode = flowElements.nodes.find((node) => node.id === roadmap.currentTaskId)?.data || flowElements.nodes[0]?.data || allNodes[0];
    const [selected, setSelected] = useState(currentNode);
    const visibleNodeIds = useMemo(() => new Set(allNodes
        .filter((node) => activeStatus === 'all' || node.status === activeStatus)
        .map((node) => node.id)), [activeStatus, allNodes]);
    const nodes = useMemo(() => flowElements.nodes
        .filter((node) => visibleNodeIds.has(node.id)), [flowElements.nodes, visibleNodeIds]);
    const edges = useMemo(() => flowElements.edges
        .filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)), [flowElements.edges, visibleNodeIds]);
    const nodeTypes = useMemo(() => ({ roadmapNode: RoadmapNode }), []);
    const onNodeClick = useCallback((_, node) => setSelected(node.data), []);
    const fitGraph = useCallback(() => {
        flow.fitView({ padding: 0.22, duration: 320 });
    }, [flow]);

    useEffect(() => {
        updateStaticHeader(roadmap);
    }, [roadmap]);

    useEffect(() => {
        updateDetailPanel(selected);
    }, [selected]);

    useEffect(() => {
        if (!selected || visibleNodeIds.has(selected.id)) return;
        const nextSelected = flowElements.nodes.find((node) => visibleNodeIds.has(node.id))?.data || currentNode;
        setSelected(nextSelected);
    }, [currentNode, flowElements.nodes, selected, visibleNodeIds]);

    useEffect(() => {
        renderStatusFilters({
            activeStatus,
            counts: statusCounts,
            onSelect: setActiveStatus
        });
        updateStatusSummary(activeStatus, nodes.length, allNodes.length);
    }, [activeStatus, allNodes.length, nodes.length, statusCounts]);

    useEffect(() => {
        window.requestAnimationFrame(() => flow.fitView({ padding: 0.24, duration: 260 }));
    }, [activeStatus, flow]);

    useEffect(() => {
        window.HW_ROADMAP_VIEWER = {
            getState: () => roadmap,
            getSelected: () => selected,
            getActiveStatus: () => activeStatus,
            getVisibleNodeIds: () => nodes.map((node) => node.id),
            getTimelineGroups: () => TIMELINE_GROUPS.map(({ id, label, statuses }) => ({ id, label, statuses })),
            getNodePositions: () => flowElements.nodes.map((node) => ({
                id: node.id,
                phaseId: node.data.phaseId,
                x: node.position.x,
                y: node.position.y
            })),
            fitGraph
        };
    }, [activeStatus, fitGraph, flowElements.nodes, nodes, roadmap, selected]);

    useEffect(() => {
        const fitButton = document.getElementById('fitButton');
        if (!fitButton) return undefined;
        fitButton.addEventListener('click', fitGraph);
        return () => fitButton.removeEventListener('click', fitGraph);
    }, [fitGraph]);

    return React.createElement(
        React.Fragment,
        null,
        React.createElement(
            ReactFlow,
            {
                nodes,
                edges,
                nodeTypes,
                onNodeClick,
                fitView: true,
                minZoom: 0.35,
                maxZoom: 1.6,
                nodesDraggable: false,
                nodesConnectable: false,
                elementsSelectable: true,
                proOptions: { hideAttribution: true }
            },
            React.createElement(Background, { gap: 28, size: 1.4, color: 'rgba(243, 195, 74, 0.26)' }),
            React.createElement(Controls, { showInteractive: false })
        )
    );
}

const roadmap = window.HW_ROADMAP_STATE;
if (!roadmap?.lanes?.length) {
    throw new Error('Missing roadmap state. Check roadmap-viewer/roadmap-state.js.');
}

createRoot(document.getElementById('roadmapFlow')).render(
    React.createElement(
        ReactFlowProvider,
        null,
        React.createElement(RoadmapApp, { roadmap })
    )
);
