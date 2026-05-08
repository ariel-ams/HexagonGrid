// Centralized music and volume ducking for Honeycomb Wayfinder.
(() => {
function createAudioSystem(config = {}) {
    const tracks = {};
    let activeTrack = null;
    const defaultFadeBackMs = config.defaultFadeBackMs || 900;

    function register(id, options) {
        const audio = new Audio(options.src);
        audio.loop = Boolean(options.loop);
        audio.volume = options.volume ?? 0.5;
        const track = {
            id,
            audio,
            volume: options.volume ?? 0.5,
            startAt: options.startAt || 0,
            loopFrom: options.loopFrom ?? options.startAt ?? 0,
            timer: 0
        };
        if (options.loopFrom !== undefined) {
            audio.loop = false;
            audio.addEventListener('ended', () => {
                if (activeTrack !== id) return;
                audio.currentTime = track.loopFrom;
                audio.play().catch(() => {});
            });
        }
        tracks[id] = track;
    }

    Object.entries(config.tracks || {}).forEach(([id, options]) => register(id, options));

    function play(id) {
        const track = tracks[id];
        if (!track) return;
        const switchingTracks = activeTrack && activeTrack !== id;
        if (switchingTracks) {
            stop(activeTrack);
        }
        const shouldStartFromCue = activeTrack !== id || track.audio.currentTime === 0;
        activeTrack = id;
        window.clearTimeout(track.timer);
        track.audio.volume = track.volume;
        if (track.audio.paused) {
            if (shouldStartFromCue) {
                cueTrack(track);
            }
            const playPromise = track.audio.play();
            if (shouldStartFromCue) {
                const ensureCue = () => cueTrack(track);
                playPromise.then(ensureCue).catch(() => {});
                window.setTimeout(ensureCue, 80);
                window.setTimeout(ensureCue, 400);
            }
            playPromise.catch(() => {});
        }
    }

    function cueTrack(track) {
        const cue = track.startAt || 0;
        if (!cue) {
            track.audio.currentTime = 0;
            return;
        }
        const seek = () => {
            if (!Number.isFinite(track.audio.duration) || track.audio.duration > cue) {
                track.audio.currentTime = cue;
            }
        };
        seek();
        if (!Number.isFinite(track.audio.duration) || track.audio.duration <= cue) {
            track.audio.addEventListener('loadedmetadata', seek, { once: true });
        }
    }

    function stop(id) {
        const track = tracks[id];
        if (!track) return;
        window.clearTimeout(track.timer);
        track.audio.pause();
        track.audio.currentTime = 0;
        track.audio.volume = track.volume;
        if (activeTrack === id) {
            activeTrack = null;
        }
    }

    function stopAll() {
        Object.keys(tracks).forEach(stop);
        activeTrack = null;
    }

    function duck(id, volume, durationMs = defaultFadeBackMs) {
        const track = tracks[id];
        if (!track) return;
        window.clearTimeout(track.timer);
        track.audio.volume = volume;
        track.timer = window.setTimeout(() => {
            track.audio.volume = track.volume;
        }, durationMs);
    }

    function pauseAll() {
        Object.values(tracks).forEach((track) => track.audio.pause());
    }

    function resumeActive() {
        if (activeTrack) {
            tracks[activeTrack]?.audio.play().catch(() => {});
        }
    }

    function getDebugState() {
        return {
            activeTrack,
            tracks: Object.fromEntries(Object.entries(tracks).map(([id, track]) => ([
                id,
                {
                    paused: track.audio.paused,
                    currentTime: Number(track.audio.currentTime.toFixed(2)),
                    duration: Number.isFinite(track.audio.duration) ? Number(track.audio.duration.toFixed(2)) : null,
                    volume: Number(track.audio.volume.toFixed(2)),
                    startAt: track.startAt,
                    loopFrom: track.loopFrom
                }
            ])))
        };
    }

    return {
        play,
        stop,
        stopAll,
        duck,
        pauseAll,
        resumeActive,
        getActiveTrack: () => activeTrack,
        getDebugState
    };
}

window.HW_AUDIO = {
    createAudioSystem
};
})();
