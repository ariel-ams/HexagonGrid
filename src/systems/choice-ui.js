// Shared button/list rendering for camp, trader, relic, and test flows.
(() => {
function createChoiceUi(context) {
    const { escapeHtml, escapeAttr } = context;

    function renderCampActions(node, actions, preview = '') {
        node.innerHTML = preview + actions.map((action) => (
            `<button class="camp-action" type="button" data-camp-action="${escapeAttr(action.id)}" ${action.available ? '' : 'disabled'}>
                <strong>${escapeHtml(action.name)}</strong>
                <span>${escapeHtml(action.description)}</span>
            </button>`
        )).join('');
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
        renderObjectTests,
        renderRelicChoices
    };
}

window.HW_CHOICE_UI = {
    createChoiceUi
};
})();
