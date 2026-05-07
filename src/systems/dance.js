// Final dance mini-game system for Honeycomb Wayfinder.
(() => {
const DEFAULT_CONFIG = {
    radius: 4,
    movesRequired: 12,
    musicSrc: 'assets/dancefloor.mp3',
    musicStartAt: 48,
    musicVolume: 0.56,
    missVolume: 0.18,
    holdPerfectProgress: 0.85,
    holdMinMs: 1000,
    holdMaxMs: 3000,
    sequenceMinLength: 3,
    sequenceMaxLength: 6,
    multiMaxClicks: 5,
    clickWindows: {
        multiClick: { perfectStartMs: 540, windowMs: 760 },
        fastSequence: { perfectStartMs: 760, windowMs: 1000 },
        spreadSequence: { perfectStartMs: 760, windowMs: 1000 },
        default: { perfectStartMs: 760, windowMs: 1000 }
    }
};

function createDanceSystem({ game, config = {}, helpers }) {
    const settings = {
        ...DEFAULT_CONFIG,
        ...config,
        clickWindows: {
            ...DEFAULT_CONFIG.clickWindows,
            ...(config.clickWindows || {})
        }
    };
    const music = new Audio(settings.musicSrc);
    music.loop = false;
    music.volume = settings.musicVolume;
    let volumeTimer = 0;

    music.addEventListener('ended', () => {
        if (game.mode !== 'dance' || game.ended) return;
        music.currentTime = settings.musicStartAt;
        music.play().catch(() => {});
    });

    function start() {
        startMusic();
        helpers.showTutorialCallout(
            'dance',
            helpers.getLanguage() === 'es-419' ? 'Baile final' : 'Final Dance',
            helpers.getLanguage() === 'es-419'
                ? 'Sigue los pasos antes de que se acabe el tiempo. Fallar baja el volumen y el multiplicador.'
                : 'Follow the steps before time runs out. Misses duck the music and reduce the multiplier.'
        );
        game.mode = 'dance';
        game.playerMotion = null;
        game.cells = [];
        game.statPopups = [];
        game.danceFeedback = [];
        game.entryCell = null;
        game.exitCell = null;
        game.message = 'Final dance: follow the arrows to reveal the good stuff.';

        for (let q = -settings.radius; q <= settings.radius; q++) {
            const rMin = Math.max(-settings.radius, -q - settings.radius);
            const rMax = Math.min(settings.radius, -q + settings.radius);
            for (let r = rMin; r <= rMax; r++) {
                game.cells.push({
                    q,
                    r,
                    object: 'empty',
                    visited: false,
                    nextAttackAt: 0,
                    nextAuraAt: 0,
                    hits: 0
                });
            }
        }

        const startCell = helpers.randomFrom(game.cells);
        game.player.q = startCell.q;
        game.player.r = startCell.r;
        startCell.visited = true;
        game.dance = {
            completed: 0,
            misses: 0,
            multiplier: 1,
            pairScores: [],
            moveQualitySum: 0,
            moveQualityCount: 0,
            lastQuality: '',
            rewardApplied: false,
            move: null,
            active: null,
            holding: false,
            lastType: null
        };
        helpers.addLog('Final Dance', 'Follow 12 dance moves. Clean pairs increase the pollen and water multiplier up to x4.');
        spawnMove();
        helpers.draw();
    }

    function startMusic() {
        helpers.stopGameplayMusic();
        window.clearTimeout(volumeTimer);
        music.volume = settings.musicVolume;
        if (!music.paused) return;
        music.currentTime = settings.musicStartAt;
        music.play().catch(() => {});
    }

    function stopMusic() {
        window.clearTimeout(volumeTimer);
        music.pause();
        music.currentTime = 0;
        music.volume = settings.musicVolume;
    }

    function duckMusic() {
        window.clearTimeout(volumeTimer);
        music.volume = settings.missVolume;
        volumeTimer = window.setTimeout(() => {
            music.volume = settings.musicVolume;
        }, 900);
    }

    function spawnMove() {
        if (!game.dance || game.ended) return;

        const types = ['fastSequence', 'hold', 'multiClick', 'spreadSequence'];
        const options = types.filter((type) => type !== game.dance.lastType);
        const type = helpers.randomFrom(options);
        game.dance.lastType = type;
        game.dance.holding = false;
        game.dance.moveQualitySum = 0;
        game.dance.moveQualityCount = 0;
        game.dance.lastQuality = '';

        if (type === 'fastSequence') {
            const length = settings.sequenceMinLength
                + Math.floor(helpers.seededRandom() * (settings.sequenceMaxLength - settings.sequenceMinLength + 1));
            game.dance.move = {
                type,
                label: `Fast ${length}-step`,
                steps: buildAdjacentSequence(game.player.q, game.player.r, length),
                index: 0
            };
            activateStep();
            return;
        }

        if (type === 'hold') {
            const durationMs = settings.holdMinMs
                + Math.floor(helpers.seededRandom() * (settings.holdMaxMs - settings.holdMinMs + 1));
            game.dance.move = {
                type,
                label: `Hold ${(durationMs / 1000).toFixed(1)}s`,
                steps: [{ q: game.player.q, r: game.player.r, directionIndex: 0 }],
                index: 0,
                durationMs
            };
            activateStep();
            return;
        }

        if (type === 'multiClick') {
            const step = randomAdjacentStep(game.player.q, game.player.r);
            const clicks = 2 + Math.floor(helpers.seededRandom() * (settings.multiMaxClicks - 1));
            game.dance.move = {
                type,
                label: 'Multi-click',
                steps: [step],
                index: 0,
                clicksLeft: clicks
            };
            activateStep();
            return;
        }

        const spread = buildSpreadSequence();
        game.dance.move = {
            type,
            label: 'Spread path',
            steps: spread.steps,
            index: 0,
            finalStep: spread.finalStep
        };
        activateStep();
    }

    function activateStep() {
        const move = game.dance?.move;
        if (!move) {
            spawnMove();
            return;
        }

        const next = move.steps[move.index];
        if (!next) {
            completeMove();
            return;
        }

        const now = performance.now();
        game.dance.active = {
            q: next.q,
            r: next.r,
            directionIndex: next.directionIndex,
            createdAt: now,
            expiresAt: move.type === 'hold' ? 0 : now + getTimingWindow(move).windowMs,
            holdStartedAt: 0
        };
        game.dance.holding = false;
    }

    function buildAdjacentSequence(startQ, startR, length) {
        const sequence = [];
        let cursor = { q: startQ, r: startR };
        for (let i = 0; i < length; i++) {
            const next = randomAdjacentStep(cursor.q, cursor.r);
            sequence.push(next);
            cursor = next;
        }
        return sequence;
    }

    function randomAdjacentStep(q, r) {
        const options = helpers.directions
            .map((direction, index) => ({
                q: q + direction.q,
                r: r + direction.r,
                directionIndex: index
            }))
            .filter((step) => helpers.getCell(step.q, step.r));
        return helpers.randomFrom(options);
    }

    function buildSpreadSequence() {
        const distantCells = game.cells
            .filter((cell) => helpers.hexDistance(game.player.q, game.player.r, cell.q, cell.r) >= 3)
            .sort(() => helpers.seededRandom() - 0.5)
            .slice(0, 2)
            .map((cell) => ({
                q: cell.q,
                r: cell.r,
                directionIndex: directionIndexToward(game.player.q, game.player.r, cell.q, cell.r)
            }));
        const finalStep = randomAdjacentStep(game.player.q, game.player.r);
        return {
            steps: [...distantCells, finalStep],
            finalStep
        };
    }

    function directionIndexToward(fromQ, fromR, toQ, toR) {
        return helpers.directions
            .map((direction, index) => ({
                index,
                distance: helpers.hexDistance(fromQ + direction.q, fromR + direction.r, toQ, toR)
            }))
            .sort((a, b) => a.distance - b.distance)[0].index;
    }

    function update() {
        if (!game.dance?.active || game.ended) return;

        const active = game.dance.active;
        const move = game.dance.move;
        const holdDuration = move?.durationMs || settings.holdMinMs;
        if (move?.type === 'hold' && active.holdStartedAt && performance.now() - active.holdStartedAt >= holdDuration) {
            completeStep(1, 'perfect');
            return;
        }

        if (move?.type !== 'hold' && performance.now() >= active.expiresAt) {
            registerMiss('Late step.');
        }
    }

    function handleClick(cell) {
        if (cell && isActiveCell(cell)) {
            startHold(cell);
        } else if (game.dance?.active) {
            registerMiss('Wrong cell.');
        }
    }

    function isActiveCell(cell) {
        const active = game.dance?.active;
        return Boolean(active && cell && cell.q === active.q && cell.r === active.r);
    }

    function startHold(cell) {
        startMusic();
        const active = game.dance?.active;
        const move = game.dance?.move;
        if (!active) return;

        if (cell.q !== active.q || cell.r !== active.r) {
            registerMiss('Wrong arrow.');
            return;
        }

        if (move.type === 'hold') {
            active.holdStartedAt = performance.now();
            game.dance.holding = true;
            return;
        }

        const timing = getClickTiming(active);
        if (timing.quality === 'miss') {
            registerMiss('Late step.');
            return;
        }

        if (move.type === 'multiClick') {
            recordQuality(timing.score, timing.quality);
            move.clicksLeft -= 1;
            active.createdAt = performance.now();
            active.expiresAt = active.createdAt + getTimingWindow(move).windowMs;
            if (move.clicksLeft <= 0) {
                completeStep(0, '', false);
            }
            return;
        }

        completeStep(timing.score, timing.quality);
    }

    function endHold() {
        const active = game.dance?.active;
        const move = game.dance?.move;
        if (!active?.holdStartedAt || game.ended) return;
        if (move?.type !== 'hold') return;

        const holdDuration = move.durationMs || settings.holdMinMs;
        const progress = Math.min(1, (performance.now() - active.holdStartedAt) / holdDuration);
        const perfect = progress >= settings.holdPerfectProgress;
        const score = perfect ? 1 : Math.max(0.58, progress * 0.92);
        completeStep(score, perfect ? 'perfect' : 'good');
    }

    function completeStep(score = 1, quality = 'good', shouldRecordQuality = true) {
        const active = game.dance?.active;
        if (!active) return;

        const cell = helpers.getCell(active.q, active.r);
        if (!cell) return;

        const previousPosition = { q: game.player.q, r: game.player.r };
        game.player.q = cell.q;
        game.player.r = cell.r;
        if (previousPosition.q !== cell.q || previousPosition.r !== cell.r) {
            helpers.startPlayerMotion(previousPosition.q, previousPosition.r, cell.q, cell.r);
            game.player.steps += 1;
        }
        cell.visited = true;
        game.dance.move.index += 1;
        if (shouldRecordQuality) {
            recordQuality(score, quality);
        }
        helpers.awardXp(helpers.xpRewards.danceStep, helpers.getLanguage() === 'es-419' ? 'Paso de baile' : 'Dance step', { silent: true });

        if (game.dance.move.index >= game.dance.move.steps.length) {
            completeMove();
            return;
        }

        activateStep();
    }

    function recordQuality(score, quality) {
        if (!game.dance) return;
        const boundedScore = Math.max(0, Math.min(1, score));
        game.dance.moveQualitySum += boundedScore;
        game.dance.moveQualityCount += 1;
        game.dance.lastQuality = quality;
        addFeedback(quality === 'perfect' ? 'Perfect' : 'Good', quality);
    }

    function addFeedback(label, quality = 'good') {
        game.danceFeedback.push({
            label,
            quality,
            createdAt: performance.now()
        });
        if (game.danceFeedback.length > 6) {
            game.danceFeedback.shift();
        }
    }

    function completeMove() {
        game.dance.completed += 1;
        const moveScore = game.dance.moveQualityCount
            ? game.dance.moveQualitySum / game.dance.moveQualityCount
            : 1;
        game.dance.pairScores.push(moveScore);
        if (game.dance.pairScores.length >= 2) {
            const pairScore = game.dance.pairScores.slice(-2).reduce((sum, value) => sum + value, 0) / 2;
            const increase = 0.5 * pairScore;
            game.dance.multiplier = Math.min(4, game.dance.multiplier + increase);
            game.dance.pairScores = [];
            addFeedback(`x${game.dance.multiplier.toFixed(2)}`, pairScore >= 0.96 ? 'perfect' : 'good');
        }
        helpers.awardXp(helpers.xpRewards.danceMove, helpers.getLanguage() === 'es-419' ? 'Movimiento de baile' : 'Dance move', { silent: true });
        game.message = `Dance move ${game.dance.completed}/${settings.movesRequired}: ${game.dance.move.label}. Multiplier x${game.dance.multiplier.toFixed(2)}.`;
        helpers.addLog('Dance Move', game.message);

        if (game.dance.completed >= settings.movesRequired) {
            helpers.endRun('dance-complete');
            return;
        }

        spawnMove();
    }

    function registerMiss(reason) {
        if (!game.dance || game.ended) return;
        const active = game.dance.active;
        const move = game.dance.move;
        game.dance.misses += 1;
        game.dance.lastQuality = 'miss';
        game.dance.moveQualitySum += 0;
        game.dance.moveQualityCount += 1;
        game.dance.multiplier = Math.max(1, game.dance.multiplier - 0.5);
        duckMusic();
        game.message = `${reason} Miss ${game.dance.misses}. Multiplier x${game.dance.multiplier.toFixed(2)}.`;
        helpers.addLog('Dance Miss', game.message);
        addFeedback('Miss', 'miss');

        if (!active || !move) {
            spawnMove();
            return;
        }

        if (move.type === 'multiClick') {
            move.clicksLeft -= 1;
            if (move.clicksLeft <= 0) {
                completeStep(0, '', false);
                return;
            }
            active.createdAt = performance.now();
            active.expiresAt = active.createdAt + getTimingWindow(move).windowMs;
            return;
        }

        completeStep(0, '', false);
    }

    function getTimingWindow(move = game.dance?.move) {
        return settings.clickWindows[move?.type] || settings.clickWindows.default;
    }

    function getClickTiming(active, now = performance.now()) {
        const timingWindow = getTimingWindow(game.dance?.move);
        const elapsed = Math.max(0, now - (active?.createdAt || now));
        if (elapsed >= timingWindow.perfectStartMs && elapsed <= timingWindow.windowMs) {
            return { quality: 'perfect', score: 1, elapsed };
        }
        if (elapsed < timingWindow.perfectStartMs) {
            return {
                quality: 'good',
                score: 0.6 + 0.35 * (elapsed / timingWindow.perfectStartMs),
                elapsed
            };
        }
        return { quality: 'miss', score: 0, elapsed };
    }

    function drawArrow() {
        if (!game.dance?.active) return;

        const active = game.dance.active;
        const move = game.dance.move;
        const target = helpers.hexToPixel(active.q, active.r);
        const color = getDirectionColor(active.directionIndex);
        const now = performance.now();
        const holdDuration = move?.durationMs || settings.holdMinMs;
        const holdProgress = active.holdStartedAt
            ? Math.min(1, (now - active.holdStartedAt) / holdDuration)
            : 0;
        const clickTiming = getClickTiming(active, now);
        const timingWindow = getTimingWindow(move);
        const ringProgress = move?.type === 'hold' ? holdProgress : Math.min(1.18, clickTiming.elapsed / timingWindow.perfectStartMs);
        const angle = getDirectionAngle(active.directionIndex);
        const ctx = helpers.ctx;

        drawPreviewArrows();

        helpers.drawHexPath(target.x, target.y, target.size - 7);
        ctx.fillStyle = `${color}44`;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();

        if (move?.type !== 'hold') {
            ctx.save();
            ctx.translate(target.x, target.y);
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.strokeStyle = 'rgba(17, 22, 19, 0.86)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(target.size * 0.34, 0);
            ctx.lineTo(-target.size * 0.12, -target.size * 0.24);
            ctx.lineTo(-target.size * 0.05, -target.size * 0.08);
            ctx.lineTo(-target.size * 0.36, -target.size * 0.08);
            ctx.lineTo(-target.size * 0.36, target.size * 0.08);
            ctx.lineTo(-target.size * 0.05, target.size * 0.08);
            ctx.lineTo(-target.size * 0.12, target.size * 0.24);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        const isPerfectWindow = move?.type !== 'hold' && clickTiming.quality === 'perfect';
        ctx.strokeStyle = isPerfectWindow ? '#72ff9d' : color;
        ctx.shadowColor = isPerfectWindow ? '#72ff9d' : color;
        ctx.shadowBlur = isPerfectWindow ? 18 : 8;
        ctx.lineWidth = isPerfectWindow ? 6 : 4;
        ctx.beginPath();
        ctx.arc(
            target.x,
            target.y,
            target.size * (move?.type === 'hold' ? 0.35 + holdProgress * 0.19 : 0.16 + ringProgress * 0.32),
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();

        if (move?.type === 'multiClick') {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = 'rgba(17, 22, 19, 0.9)';
            ctx.lineWidth = 5;
            ctx.font = `800 ${Math.round(target.size * 0.42)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText(String(move.clicksLeft), target.x, target.y);
            ctx.fillText(String(move.clicksLeft), target.x, target.y);
            ctx.restore();
        }

        drawStepReference(target, move, active, color);
    }

    function drawHoldForeground() {
        const active = game.dance?.active;
        const move = game.dance?.move;
        if (!active || move?.type !== 'hold') return;

        const target = helpers.hexToPixel(active.q, active.r);
        const holdDuration = move.durationMs || settings.holdMinMs;
        const holdProgress = active.holdStartedAt
            ? Math.min(1, (performance.now() - active.holdStartedAt) / holdDuration)
            : 0;
        drawHoldCountdown(target, holdDuration, holdProgress);
    }

    function drawHoldCountdown(target, holdDuration, holdProgress) {
        const ctx = helpers.ctx;
        const active = game.dance?.active;
        const remainingMs = active?.holdStartedAt
            ? Math.max(0, holdDuration - (performance.now() - active.holdStartedAt))
            : holdDuration;
        const seconds = Math.ceil(remainingMs / 1000);

        ctx.save();
        ctx.fillStyle = '#fff2a7';
        ctx.strokeStyle = 'rgba(17, 22, 19, 0.9)';
        ctx.lineWidth = 5;
        ctx.font = `800 ${Math.round(target.size * 0.42)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(`${seconds}s`, target.x, target.y + target.size * 0.02);
        ctx.fillText(`${seconds}s`, target.x, target.y + target.size * 0.02);

        const perfect = holdProgress >= settings.holdPerfectProgress;
        ctx.globalAlpha = 0.92;
        ctx.strokeStyle = perfect ? '#72ff9d' : '#fff2a7';
        ctx.shadowColor = perfect ? '#72ff9d' : '#fff2a7';
        ctx.shadowBlur = perfect ? 18 : 8;
        ctx.lineWidth = perfect ? 5 : 3;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size * (0.35 + holdProgress * 0.18), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawStepReference(target, move, active, color) {
        const label = getStepLabel(move);
        if (!label) return;

        const holdDuration = move?.durationMs || settings.holdMinMs;
        const holdProgress = active.holdStartedAt
            ? Math.min(1, (performance.now() - active.holdStartedAt) / holdDuration)
            : 0;
        const rect = helpers.canvas.getBoundingClientRect();
        const width = Math.max(target.size * 1.28, 86);
        const height = 26;
        const x = Math.max(8, Math.min(target.x - width / 2, rect.width - width - 8));
        const y = Math.max(8, Math.min(target.y - target.size * 0.95, rect.height - height - 8));
        const centerX = x + width / 2;
        const ctx = helpers.ctx;

        ctx.save();
        ctx.fillStyle = 'rgba(17, 22, 19, 0.88)';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 7);
        ctx.fill();
        ctx.stroke();

        if (move?.type === 'hold') {
            ctx.fillStyle = `${color}88`;
            ctx.fillRect(x + 4, y + height - 6, (width - 8) * holdProgress, 3);
        }

        ctx.fillStyle = '#f3f0df';
        ctx.font = '800 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, centerX, y + height / 2 - 1);
        ctx.restore();
    }

    function getStepLabel(move) {
        if (!move) return '';
        if (game.dance?.lastQuality) return game.dance.lastQuality.toUpperCase();
        if (move.type === 'hold') return 'HOLD, RELEASE';
        if (move.type === 'multiClick') return `CLICK x${move.clicksLeft}`;
        if (move.type === 'fastSequence') return 'PULSE STEP';
        if (move.type === 'spreadSequence') return 'PULSE PATH';
        return 'CLICK';
    }

    function drawPreviewArrows() {
        const move = game.dance?.move;
        if (!move?.steps?.length) return;
        const ctx = helpers.ctx;

        move.steps.slice(move.index + 1).forEach((step, index) => {
            const point = helpers.hexToPixel(step.q, step.r);
            const color = getDirectionColor(step.directionIndex);
            const angle = getDirectionAngle(step.directionIndex);

            ctx.save();
            ctx.globalAlpha = move.type === 'spreadSequence' ? 0.46 : index === 0 ? 0.38 : 0.22;
            ctx.translate(point.x, point.y);
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(point.size * 0.22, 0);
            ctx.lineTo(-point.size * 0.12, -point.size * 0.16);
            ctx.lineTo(-point.size * 0.12, point.size * 0.16);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    function drawScoreOverlay(board) {
        if (!game.dance) return;
        const ctx = helpers.ctx;
        const text = `${game.dance.completed}/${settings.movesRequired}   x${game.dance.multiplier.toFixed(2)}   ${game.dance.misses} miss${game.dance.misses === 1 ? '' : 'es'}`;
        const width = Math.min(board.width - 24, 300);
        const height = 36;
        const x = board.width / 2 - width / 2;
        const y = board.height - height - 12;

        ctx.save();
        ctx.fillStyle = 'rgba(17, 22, 19, 0.68)';
        ctx.strokeStyle = 'rgba(245, 200, 75, 0.56)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff2a7';
        ctx.font = '900 15px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, board.width / 2, y + height / 2);
        ctx.restore();
    }

    function drawFeedbackLane(board) {
        const now = performance.now();
        game.danceFeedback = game.danceFeedback.filter((entry) => now - entry.createdAt < 1100);
        if (!game.danceFeedback.length) return;

        const ctx = helpers.ctx;
        const x = 16;
        const baseY = Math.max(72, board.height * 0.28);
        ctx.save();
        game.danceFeedback.slice(-4).forEach((entry, index) => {
            const age = now - entry.createdAt;
            const progress = age / 1100;
            const alpha = progress < 0.68 ? 1 : 1 - (progress - 0.68) / 0.32;
            const y = baseY + index * 38 - progress * 12;
            const color = entry.quality === 'perfect'
                ? '#72ff9d'
                : entry.quality === 'miss'
                ? '#ff8a72'
                : '#66c7ff';

            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle = 'rgba(17, 22, 19, 0.68)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, 118, 30, 9);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.font = '900 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(entry.label, x + 59, y + 15);
        });
        ctx.restore();
    }

    function getDirectionColor(index) {
        return ['#f94144', '#f8961e', '#f9c74f', '#43aa8b', '#4d96ff', '#b66dff'][index];
    }

    function getDirectionAngle(index) {
        const direction = helpers.directions[index];
        return Math.atan2(direction.r * 1.5, Math.sqrt(3) * (direction.q + direction.r / 2));
    }

    function getFoodPercentage() {
        const misses = game.dance?.misses || 0;
        return Math.max(0, Math.min(100, Math.round(100 - misses * 8)));
    }

    function applyRewards(reason) {
        if (!game.dance || game.dance.rewardApplied || reason === 'death') return;
        const multiplier = Math.min(4, Math.max(1, game.dance.multiplier || 1));
        const pollenBonus = Math.max(0, Math.round(game.runStats.pollen * (multiplier - 1)));
        const waterBonus = Math.max(0, Math.round(game.runStats.water * (multiplier - 1)));
        if (pollenBonus > 0) {
            game.runStats.pollen += pollenBonus;
            game.player.pollen += pollenBonus;
        }
        if (waterBonus > 0) {
            game.runStats.water += waterBonus;
            game.player.water += waterBonus;
        }
        game.dance.rewardApplied = true;
        if (pollenBonus || waterBonus) {
            helpers.addLog('Dance Reward', `Food dance multiplied rewards: +${pollenBonus} pollen, +${waterBonus} water.`);
        }
    }

    return {
        start,
        stopMusic,
        update,
        drawArrow,
        drawHoldForeground,
        drawScoreOverlay,
        drawFeedbackLane,
        handleClick,
        isActiveCell,
        startHold,
        endHold,
        getFoodPercentage,
        applyRewards,
        getMovesRequired: () => settings.movesRequired
    };
}

window.HW_DANCE = {
    createDanceSystem
};
})();
