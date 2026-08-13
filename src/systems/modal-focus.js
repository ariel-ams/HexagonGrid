// Shared keyboard focus behavior for modal game overlays.
(() => {
const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

function createModalFocusManager(overlays = []) {
    function getFocusableElements(root) {
        if (!root) return [];
        return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter((node) => (
            !node.hidden && node.offsetParent !== null
        ));
    }

    function getVisibleOverlay() {
        return overlays.find((overlay) => overlay?.classList.contains('visible')) || null;
    }

    function focusFirst(root, preferredSelector = '') {
        const preferred = preferredSelector ? root?.querySelector(preferredSelector) : null;
        const target = preferred && !preferred.disabled && preferred.offsetParent !== null
            ? preferred
            : getFocusableElements(root)[0];
        target?.focus();
        return target || null;
    }

    function trapFocus(event) {
        if (event.key !== 'Tab') return false;
        const overlay = getVisibleOverlay();
        if (!overlay) return false;
        const focusable = getFocusableElements(overlay);
        if (!focusable.length) return false;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!overlay.contains(document.activeElement)) {
            event.preventDefault();
            first.focus();
            return true;
        }
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return true;
        }
        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
            return true;
        }
        return false;
    }

    function restoreFocus(target) {
        target?.focus();
    }

    return {
        focusFirst,
        getFocusableElements,
        getVisibleOverlay,
        restoreFocus,
        trapFocus
    };
}

window.HW_MODAL_FOCUS = {
    createModalFocusManager
};
})();
