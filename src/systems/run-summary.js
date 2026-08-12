// End-run death tips and tactical recommendations.
(() => {
function createRunSummarySystem({ getLanguage }) {
    function isSpanish() {
        return getLanguage() === 'es-419';
    }

    function getDeathTip(source = '') {
        const lower = source.toLowerCase();
        if (lower.includes('bat')) {
            return isSpanish()
                ? 'Los murcielagos castigan quedarse al lado. Guarda Aguijon doble o alejate antes de que se llene el mordisco.'
                : 'Bats punish standing adjacent. Save Double Sting or move away before the bite timer fills.';
        }
        if (lower.includes('wasp')) {
            return isSpanish()
                ? 'La presion de avispa es posicionamiento. Evita terminar el turno dentro de su anillo de peligro.'
                : 'Wasp pressure is about positioning. Avoid ending your turn inside its danger ring.';
        }
        if (lower.includes('vine')) {
            return isSpanish()
                ? 'Las enredaderas son un costo permanente. Cruzalas solo cuando puedas pagar vida o escudo.'
                : 'Vines are permanent taxes. Cross them only when you can afford the health or shield loss.';
        }
        if (lower.includes('moth')) {
            return isSpanish()
                ? 'Las polillas son amenazas de apoyo. Limpialas temprano antes de que roben ritmo u oculten la sala.'
                : 'Moths are support threats. Clear them early before they steal tempo or hide the room.';
        }
        if (lower.includes('beetle')) {
            return isSpanish()
                ? 'Los escarabajos controlan cuellos de botella. No te quedes al lado sin escudo.'
                : 'Beetles control chokepoints. Do not linger beside one without shield.';
        }
        return isSpanish()
            ? 'Mira los temporizadores de peligro arriba a la derecha y sal de las celdas amenazadas antes de que se llenen.'
            : 'Watch the top-right danger timers and leave threatened cells before they fill.';
    }

    function getRunRecommendation({ reason, metrics, player, runStats }) {
        const damageEntries = Object.entries(metrics.damageBySource || {}).sort((a, b) => b[1] - a[1]);
        const topSource = damageEntries[0]?.[0]?.toLowerCase() || '';
        const unspent = player.pollen + player.water + player.honey;
        if (reason === 'death' && topSource.includes('wasp')) {
            return isSpanish()
                ? 'Evita terminar turnos dentro de anillos de avispa; usa movimiento para salir antes de atacar otra vez.'
                : 'Avoid ending turns inside wasp rings; spend movement to leave before attacking again.';
        }
        if (reason === 'death' && topSource.includes('bat')) {
            return isSpanish()
                ? 'Guarda Aguijon doble para murcielagos o planea dos golpes con una salida segura.'
                : 'Save Double Sting for bats or plan two hits with a safe escape cell.';
        }
        if (reason === 'death' && topSource.includes('burn')) {
            return isSpanish()
                ? 'Reserva agua para apagar fuego o cambia la ruta cuando el fuego bloquee la salida.'
                : 'Reserve water for fire cells or reroute when fire blocks the exit.';
        }
        if (unspent >= 5) {
            return isSpanish()
                ? 'Terminaste con muchos recursos; compra curacion, escudo o mapa en el proximo mercado.'
                : 'You carried many resources; spend them on healing, shield, or map help at the next market.';
        }
        if (metrics.attacksMade < metrics.turns / 4 && runStats.kills < 2) {
            return isSpanish()
                ? 'Estas evitando muchas amenazas; a veces matar el guardia abre una ruta mas segura.'
                : 'You avoided many threats; sometimes killing the guard creates the safer route.';
        }
        if (metrics.repeatedAttackRetreatPatterns > 1) {
            return isSpanish()
                ? 'Los bucles de golpear y huir activan presion; busca mejorar rango/movimiento antes del jefe.'
                : 'Hit-and-run loops build pressure; look for range or movement upgrades before the boss.';
        }
        return isSpanish()
            ? 'Buen ritmo. Sigue inspeccionando celdas para ver costos, dano y rutas letales antes de moverte.'
            : 'Good pace. Keep inspecting cells to read costs, damage, and lethal routes before moving.';
    }

    return {
        getDeathTip,
        getRunRecommendation
    };
}

window.HW_RUN_SUMMARY = {
    createRunSummarySystem
};
})();
