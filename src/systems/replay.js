// Replay recording and playback helpers.
(() => {
function createReplaySystem(context) {
    const { game, helpers } = context;

    function record(type, payload = {}) {
        if (game.replay || game.mode === 'menu') return;
        game.replayEvents.push({
            type,
            payload,
            at: Math.round(helpers.now() - game.runStartedAt),
            snapshot: helpers.createSnapshot()
        });
    }

    function cloneEvents() {
        return game.replayEvents.map((event) => ({
            ...event,
            snapshot: JSON.parse(JSON.stringify(event.snapshot))
        }));
    }

    function normalizeDanceTiming(dance, capturedAt, now) {
        if (!dance?.active) return dance;
        const active = dance.active;
        if (active.createdAt) {
            active.createdAt = now - Math.max(0, capturedAt - active.createdAt);
        }
        if (active.expiresAt) {
            active.expiresAt = now + Math.max(0, active.expiresAt - capturedAt);
        }
        if (active.holdStartedAt) {
            active.holdStartedAt = now - Math.max(0, capturedAt - active.holdStartedAt);
        }
        return dance;
    }

    return {
        cloneEvents,
        normalizeDanceTiming,
        record
    };
}

window.HW_REPLAY = {
    createReplaySystem
};
})();
