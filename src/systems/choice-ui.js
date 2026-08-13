// Shared button/list rendering for camp, trader, relic, and test flows.
(() => {
function createChoiceUi(context) {
    const { escapeHtml, escapeAttr } = context;

    function renderCampActions(node, actions, preview = '') {
        node.innerHTML = preview + actions.map((action) => (
            `<button class="camp-action" type="button" data-camp-action="${escapeAttr(action.id)}" ${action.available ? '' : 'disabled'}>
                <span class="camp-action-title">${escapeHtml(action.name)}</span>
                ${renderActionDescription(action.description)}
            </button>`
        )).join('');
    }

    function renderActionDescription(description) {
        const [costPart, ...effectParts] = String(description || '').split('.');
        const hasCost = costPart.trim().toLowerCase().startsWith('cost:');
        const cost = hasCost ? costPart.replace(/^cost:\s*/i, '').trim() : '';
        const effect = (hasCost ? effectParts.join('.') : description).trim();
        return `<span class="camp-action-copy">
            ${cost ? `<span class="camp-action-cost">${escapeHtml(cost)}</span>` : ''}
            ${effect ? `<span class="camp-action-effect">${escapeHtml(effect)}</span>` : ''}
        </span>`;
    }

    function renderRelicChoices(node, relics, labels) {
        if (!relics.length) {
            node.innerHTML = `<button class="relic-card" type="button" data-relic-id="skip">
                <strong>${escapeHtml(labels.emptyTitle)}</strong>
                <span>${escapeHtml(labels.emptyCopy)}</span>
            </button>`;
            return;
        }
        node.innerHTML = relics.map((relic) => (
            `<button class="relic-card" type="button" data-relic-id="${escapeAttr(relic.id)}">
                <strong>${escapeHtml(relic.name)}</strong>
                <span>${escapeHtml(relic.description)}</span>
            </button>`
        )).join('');
    }

    function formatDelta(delta) {
        const amount = Number(delta?.delta) || 0;
        if (amount > 0) return `+${amount}`;
        return `${amount}`;
    }

    function renderEquipmentDelta(delta) {
        const directionClass = delta.direction === 'down'
            ? 'equipment-delta-down'
            : delta.direction === 'up'
            ? 'equipment-delta-up'
            : 'equipment-delta-same';
        return `<span class="equipment-delta ${directionClass}">
            <strong>${escapeHtml(formatDelta(delta))}</strong>
            <span>${escapeHtml(delta.label || delta.type)}</span>
        </span>`;
    }

    function renderEquipmentRewardOffer(node, offer, labels = {}) {
        const choices = offer?.choices || [];
        if (!choices.length) {
            node.innerHTML = `<button class="relic-card equipment-reward-card" type="button" data-equipment-id="skip" disabled>
                <strong>${escapeHtml(offer?.label || labels.emptyTitle || 'No gear choices')}</strong>
                <span>${escapeHtml(offer?.description || labels.emptyCopy || '')}</span>
            </button>`;
            return;
        }
        node.innerHTML = choices.map((choice) => {
            const deltas = (choice.effectDeltas || []).filter((delta) => delta.changed);
            const current = choice.current
                ? `<span class="equipment-current">${escapeHtml(labels.replaces || 'Replaces')}: ${escapeHtml(choice.current.name)}</span>`
                : `<span class="equipment-current">${escapeHtml(labels.emptySlot || 'Empty slot')}</span>`;
            return `<button class="relic-card equipment-reward-card" type="button" data-equipment-id="${escapeAttr(choice.equipment.id)}">
                <span class="equipment-card-kicker">${escapeHtml(choice.slotDef?.name || choice.slot)} &middot; ${escapeHtml(choice.rarityLabel || choice.rarity)}</span>
                <strong>${escapeHtml(choice.equipment.name)}</strong>
                <span>${escapeHtml(choice.equipment.description)}</span>
                ${current}
                <span class="equipment-deltas">${deltas.map(renderEquipmentDelta).join('')}</span>
            </button>`;
        }).join('');
    }

    function renderObjectTests(node, entries) {
        node.innerHTML = entries.map((entry) => (
            `<button class="test-object" type="button" data-test-object="${escapeAttr(entry.id)}">
                <canvas class="test-object-icon" data-test-icon="${escapeAttr(entry.id)}" width="64" height="64" aria-hidden="true"></canvas>
                <span class="test-object-copy">
                    <span class="test-kind">${escapeHtml(entry.kind)}</span>
                    <strong>${escapeHtml(entry.name)}</strong>
                    <small>${escapeHtml(entry.description)}</small>
                </span>
            </button>`
        )).join('');
    }

    function preview(title, copy) {
        return `<div class="camp-preview">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(copy)}</span>
        </div>`;
    }

    return {
        preview,
        renderCampActions,
        renderEquipmentRewardOffer,
        renderObjectTests,
        renderRelicChoices
    };
}

window.HW_CHOICE_UI = {
    createChoiceUi
};
})();
