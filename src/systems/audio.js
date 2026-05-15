// Centralized music and volume ducking for Honeycomb Wayfinder.
(() => {
function createAudioSystem(config = {}) {
    const tracks = {};
    let activeTrack = null;
    let musicVolumeScale = 1;
    let effectsVolumeScale = 1;
    const defaultFadeBackMs = config.defaultFadeBackMs || 900;

    function register(id, options) {
        const audio = new Audio(options.src);
        audio.loop = Boolean(options.loop);
        audio.volume = (options.volume ?? 0.5) * musicVolumeScale;
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
        track.audio.volume = track.volume * musicVolumeScale;
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
            const canSeek = !Number.isFinite(track.audio.duration) || track.audio.duration > cue;
            const farFromCue = Math.abs(track.audio.currentTime - cue) > 1.5;
            if (canSeek && farFromCue) {
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
        track.audio.volume = track.volume * musicVolumeScale;
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
            track.audio.volume = track.volume * musicVolumeScale;
        }, durationMs);
    }

    function setMusicVolume(value) {
        musicVolumeScale = Math.max(0, Math.min(1, Number(value)));
        Object.values(tracks).forEach((track) => {
            track.audio.volume = track.volume * musicVolumeScale;
        });
    }

    function setEffectsVolume(value) {
        effectsVolumeScale = Math.max(0, Math.min(1, Number(value)));
    }

    function pauseAll() {
        Object.values(tracks).forEach((track) => track.audio.pause());
    }

    function resumeActive() {
        if (activeTrack) {
            tracks[activeTrack]?.audio.play().catch(() => {});
        }
    }

    function playEffect(id, options = {}) {
        const audioContext = getEffectContext();
        if (!audioContext) return;
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const preset = getEffectPreset(id);
        oscillator.type = preset.type;
        oscillator.frequency.setValueAtTime(options.frequency || preset.frequency, now);
        if (preset.endFrequency) {
            oscillator.frequency.exponentialRampToValueAtTime(preset.endFrequency, now + preset.duration);
        }
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime((options.volume || preset.volume) * effectsVolumeScale, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + preset.duration + 0.02);
    }

    let effectContext = null;
    function getEffectContext() {
        try {
            effectContext = effectContext || new (window.AudioContext || window.webkitAudioContext)();
            if (effectContext.state === 'suspended') {
                effectContext.resume().catch(() => {});
            }
            return effectContext;
        } catch {
            return null;
        }
    }

    function getEffectPreset(id) {
        const presets = {
            move: { type: 'sine', frequency: 360, endFrequency: 520, volume: 0.035, duration: 0.08 },
            pick: { type: 'triangle', frequency: 620, endFrequency: 980, volume: 0.045, duration: 0.12 },
            sting: { type: 'sawtooth', frequency: 520, endFrequency: 180, volume: 0.04, duration: 0.09 },
            hit: { type: 'square', frequency: 160, endFrequency: 90, volume: 0.045, duration: 0.14 },
            projectile: { type: 'sine', frequency: 300, endFrequency: 760, volume: 0.035, duration: 0.16 },
            blocked: { type: 'square', frequency: 130, endFrequency: 80, volume: 0.04, duration: 0.11 },
            open: { type: 'triangle', frequency: 260, endFrequency: 620, volume: 0.035, duration: 0.13 },
            win: { type: 'sine', frequency: 520, endFrequency: 1040, volume: 0.05, duration: 0.28 }
        };
        return presets[id] || presets.pick;
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
                    musicVolumeScale,
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
        setMusicVolume,
        setEffectsVolume,
        playEffect,
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
