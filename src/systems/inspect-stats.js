// Data-to-chip helpers for the persistent dungeon inspect panel.
(() => {
function createInspectStatsSystem({ hudRows, getLanguage, vineDamage }) {
    const resourceIcons = { pollen: '*', water: '~', honey: 'H', stingCharges: '+' };
    const resourceKinds = { pollen: 'pollen', water: 'water', honey: 'honey', stingCharges: 'sting' };
    const resourceRows = { pollen: hudRows.pollen, water: hudRows.water, honey: hudRows.honey, stingCharges: hudRows.sting };

    function getObjectEffectStats(objectId, objects) {
        const stats = [];
        const def = objects[objectId] || objects.empty || {};
        const effects = def.effects || [];

        effects.forEach((effect) => {
            if (effect.type === 'gainResource') {
                stats.push({
                    icon: resourceIcons[effect.resource] || '+',
                    label: `+${effect.amount}`,
                    tone: 'good',
                    kind: resourceKinds[effect.resource] || 'gain',
                    hudRow: resourceRows[effect.resource]
                });
            } else if (effect.type === 'heal' || effect.type === 'royalNectar') {
                stats.push({
                    icon: '+',
                    label: `+${effect.amount ?? effect.heal}`,
                    tone: 'good',
                    kind: 'health',
                    hudRow: hudRows.health
                });
            } else if (effect.type === 'gainShield') {
                stats.push({ icon: '+', label: `+${effect.amount}`, tone: 'good', kind: 'shield', hudRow: hudRows.shield });
            } else if (effect.type === 'revealAround') {
                stats.push({ icon: 'O', label: `${isSpanish() ? 'Radio' : 'Radius'} ${effect.radius}`, tone: 'route', kind: 'reveal', hudRow: hudRows.objective });
            } else if (effect.type === 'pauseEnemyTimers') {
                stats.push({ icon: 'II', label: `${Math.round(effect.durationMs / 1000)}s`, tone: 'route', kind: 'pause', hudRow: hudRows.pause });
            } else if (effect.type === 'revealEnemies' || effect.type === 'revealExitHint' || effect.type === 'revealExitRoute') {
                stats.push({ icon: 'O', label: isSpanish() ? 'Revela' : 'Reveal', tone: 'route', kind: 'reveal', hudRow: hudRows.objective });
            }
        });

        addTerrainStats(stats, objectId);
        return stats;
    }

    function addTerrainStats(stats, objectId) {
        if (objectId === 'vine') {
            stats.push({ icon: '-', label: `${vineDamage}`, tone: 'danger', kind: 'damage', hudRow: hudRows.danger });
        } else if (objectId === 'burningCell') {
            stats.push({ icon: '-', label: '1', tone: 'danger', kind: 'damage', hudRow: hudRows.danger });
            stats.push({ icon: '~', label: '1', tone: 'cost', kind: 'water', hudRow: hudRows.water });
        } else if (objectId === 'waxDoor') {
            stats.push({ icon: '*', label: '1', tone: 'cost', kind: 'pollen', hudRow: hudRows.pollen });
        } else if (objectId === 'wall') {
            stats.push({ icon: 'X', label: isSpanish() ? 'Paso' : 'Path', tone: 'cost', kind: 'blocked', hudRow: hudRows.danger });
        } else if (objectId === 'exit' || objectId === 'finalExit' || objectId === 'entry') {
            stats.push({ icon: '!', label: isSpanish() ? 'Accion' : 'Action', tone: 'route', kind: 'action', hudRow: hudRows.objective });
        }
    }

    function isSpanish() {
        return getLanguage() === 'es-419';
    }

    return {
        getObjectEffectStats
    };
}

window.HW_INSPECT_STATS = {
    createInspectStatsSystem
};
})();
