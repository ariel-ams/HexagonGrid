// DOM renderer for the persistent dungeon inspect panel.
(() => {
function createInspectUi(context) {
    const { escapeHtml, escapeAttr } = context;

    function render(node, detail) {
        if (!node) return;
        if (!detail || detail.hidden) {
            node.classList.add('hidden');
            node.innerHTML = '';
            return;
        }

        const color = detail.color || '#f5c84b';
        node.classList.remove('hidden');
        node.style.borderColor = color;
        node.innerHTML = `
            <div class="inspect-title">
                <div class="inspect-icon" style="border-color:${escapeAttr(color)}">${escapeHtml(detail.fallback || '')}</div>
                <div class="inspect-heading">
                    <strong>${escapeHtml(detail.name || '')}</strong>
                    <span>${escapeHtml(detail.role || '')}</span>
                </div>
            </div>
            ${renderStats(detail.stats || [])}
            <div class="inspect-lines">
                ${(detail.lines || []).map((line) => `<div class="inspect-line">${escapeHtml(line)}</div>`).join('')}
            </div>
        `;
    }

    function renderStats(stats) {
        if (!stats.length) return '';
        return `<div class="inspect-stats">
            ${stats.map((stat) => {
                const tone = stat.tone || '';
                const kind = stat.kind || 'info';
                const classes = ['inspect-stat', tone, `stat-${kind}`].filter(Boolean).join(' ');
                return `<span class="${escapeAttr(classes)}" data-icon="${escapeAttr(stat.icon || '')}">${escapeHtml(stat.label || '')}</span>`;
            }).join('')}
        </div>`;
    }

    return { render };
}

window.HW_INSPECT_UI = {
    createInspectUi
};
})();
