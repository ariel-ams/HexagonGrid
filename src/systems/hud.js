// HUD rendering helpers for compact icon clusters over the board.
(() => {
function createHudRenderer({ statsNode, timerNode, spriteDefs, escapeHtml, escapeAttr }) {
    let previousValues = new Map();

    function renderStats(items) {
        renderGroup(statsNode, items);
    }

    function renderTimers(items) {
        renderGroup(timerNode, items);
    }

    function reset() {
        previousValues = new Map();
    }

    function renderGroup(node, items) {
        if (!node) return;
        node.innerHTML = items.map((item) => renderPill(item)).join('');
    }

    function renderPill(item) {
        const value = String(item.value);
        const previous = previousValues.get(item.id);
        const pulse = previous !== undefined && previous !== value;
        previousValues.set(item.id, value);
        const classes = ['hud-pill'];
        if (pulse) classes.push('pulse');
        if (item.tone) classes.push(item.tone);

        return `
            <div class="${classes.join(' ')}" data-hud-id="${escapeAttr(item.id)}" data-tooltip="${escapeAttr(item.title)}" aria-label="${escapeAttr(item.title)}">
                ${renderIcon(item)}
                <span class="hud-value">${escapeHtml(value)}</span>
            </div>
        `;
    }

    function renderIcon(item) {
        if (item.hudIcon !== undefined && item.hudIcon !== null) {
            return `<span class="hud-icon hud-sheet-icon" style="--hud-icon-row:${Number(item.hudIcon) || 0}" aria-hidden="true"></span>`;
        }
        const src = item.sprite ? spriteDefs[item.sprite]?.src : '';
        if (src) {
            return `<span class="hud-icon" style="background:${item.color || 'rgba(243, 240, 223, 0.1)'}"><img src="${escapeAttr(src)}" alt=""></span>`;
        }
        return `<span class="hud-icon" style="background:${item.color || 'rgba(243, 240, 223, 0.1)'}">${renderFallbackIcon(item.icon, item.fallback)}</span>`;
    }

    function renderFallbackIcon(icon, fallback = '') {
        if (icon === 'heart') return '&hearts;';
        if (icon === 'bolt') return '&#9889;';
        if (icon === 'room') return '&#9673;';
        return escapeHtml(fallback || '?');
    }

    return {
        renderStats,
        renderTimers,
        reset
    };
}

window.HW_HUD = {
    createHudRenderer
};
})();
