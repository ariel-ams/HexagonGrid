// Data-to-chip helpers for the persistent dungeon inspect panel.
(() => {
function createInspectStatsSystem({ hudRows, getLanguage, vineDamage, hasEnemyBehavior, getEnemyBehavior }) {
    const resourceIcons = { pollen: '*', water: '~', honey: 'H', stingCharges: '+' };
    const resourceKinds = { pollen: 'pollen', water: 'water', honey: 'honey', stingCharges: 'sting' };
    const resourceRows = { pollen: hudRows.pollen, water: hudRows.water, honey: hudRows.honey, stingCharges: hudRows.sting };

    function getStatCaption(stat) {
        const spanish = isSpanish();
        if (stat.kind === 'health') return 'HP';
        if (stat.kind === 'shield') return spanish ? 'Escudo' : 'Shield';
        if (stat.kind === 'damage' || stat.kind === 'attack') return spanish ? 'Daño' : 'Damage';
        if (['lethal', 'danger', 'spawn'].includes(stat.kind)) return spanish ? 'Peligro' : 'Threat';
        if (stat.tone === 'good') return spanish ? 'Ganas' : 'Gain';
        if (stat.tone === 'cost') return spanish ? 'Costo' : 'Cost';
        if (['move', 'range', 'reveal', 'hidden', 'action'].includes(stat.kind)) return spanish ? 'Ruta' : 'Route';
        return spanish ? 'Efecto' : 'Effect';
    }

    function enrichStats(stats) {
        return stats.map((stat) => ({
            ...stat,
            caption: stat.caption || getStatCaption(stat)
        }));
    }

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
            } else if (effect.type === 'slowNearbyEnemies') {
                stats.push({ icon: 'II', label: isSpanish() ? 'Lento' : 'Slow', tone: 'route', kind: 'slow', hudRow: hudRows.pause });
            } else if (effect.type === 'transformCell') {
                stats.push({ icon: 'O', label: isSpanish() ? 'Trampa' : 'Trap', tone: 'cost', kind: 'terrain', hudRow: hudRows.objective });
            }
        });

        addTerrainStats(stats, objectId);
        return enrichStats(stats);
    }

    function getEnemyStats(objectId, cell, enemy) {
        const stats = [];
        const maxHp = cell.bossHp || enemy.hp;
        const hp = Math.max(0, maxHp - (cell.hits || 0));

        stats.push({ icon: '+', label: `${hp}/${maxHp}`, tone: 'danger', kind: 'health', hudRow: hudRows.health });
        stats.push({ icon: '!', label: `${enemy.attack}`, tone: 'danger', kind: 'attack', hudRow: hudRows.danger });
        stats.push({ icon: 'R', label: `${enemy.range}`, tone: 'route', kind: 'range', hudRow: hudRows.sting });

        if (hasEnemyBehavior(objectId, 'armoredFacing')) {
            stats.push({ icon: 'S', label: isSpanish() ? 'Frente' : 'Front', tone: 'cost', kind: 'guard', hudRow: hudRows.shield });
            const flankBonus = getEnemyBehavior(objectId, 'armoredFacing')?.flankBonus || 0;
            if (flankBonus > 0) {
                stats.push({ icon: '+', label: isSpanish() ? `Flanco +${flankBonus}` : `Flank +${flankBonus}`, tone: 'good', kind: 'attack', hudRow: hudRows.sting });
            }
        }
        if (hasEnemyBehavior(objectId, 'chargeLane')) {
            stats.push({ icon: '!', label: isSpanish() ? 'Carril' : 'Lane', tone: 'danger', kind: 'danger', hudRow: hudRows.danger });
        }
        if (hasEnemyBehavior(objectId, 'markCellsAura')) {
            stats.push({ icon: '!', label: isSpanish() ? 'Marca' : 'Marks', tone: 'danger', kind: 'danger', hudRow: hudRows.danger });
        }
        if (enemy.behaviors?.some((behavior) => behavior.type === 'spawnEnemyAura')) {
            stats.push({ icon: '!', label: isSpanish() ? 'Invoca' : 'Spawns', tone: 'danger', kind: 'spawn', hudRow: hudRows.danger });
        }
        const stealBehavior = getEnemyBehavior(objectId, 'stealResourceAura');
        if (stealBehavior) {
            const resource = stealBehavior.resource || 'pollen';
            stats.push({
                icon: resourceIcons[resource] || '-',
                label: isSpanish() ? 'Roba' : 'Steals',
                tone: 'cost',
                kind: resourceKinds[resource] || 'cost',
                hudRow: resourceRows[resource] ?? hudRows.pollen
            });
        }
        if (hasEnemyBehavior(objectId, 'waterDrainAura')) {
            stats.push({ icon: '~', label: isSpanish() ? 'Drena' : 'Drains', tone: 'cost', kind: 'water', hudRow: hudRows.water });
        }
        if (hasEnemyBehavior(objectId, 'refogAura')) {
            stats.push({ icon: 'O', label: isSpanish() ? 'Niebla' : 'Fog', tone: 'route', kind: 'reveal', hudRow: hudRows.objective });
        }
        const terrainBehavior = getEnemyBehavior(objectId, 'spawnTerrainAura');
        if (terrainBehavior) {
            const isBurning = terrainBehavior.object === 'burningCell';
            stats.push({
                icon: isBurning ? '!' : 'O',
                label: isSpanish() ? 'Terreno' : 'Terrain',
                tone: isBurning ? 'danger' : 'cost',
                kind: isBurning ? 'danger' : 'terrain',
                hudRow: isBurning ? hudRows.danger : hudRows.objective
            });
        }
        if (hasEnemyBehavior(objectId, 'weakPointWindow')) {
            stats.push({ icon: '+', label: isSpanish() ? 'Nucleo' : 'Core', tone: 'route', kind: 'attack', hudRow: hudRows.sting });
        }

        return enrichStats(stats);
    }

    function getRouteStats(preview, moveBudget) {
        const stats = [];
        if (!preview?.path?.length) return enrichStats(stats);

        const reachable = Math.min(preview.path.length, moveBudget);
        stats.push({
            icon: '>',
            label: `${reachable}/${preview.path.length}`,
            tone: preview.complete ? 'route' : 'cost',
            kind: 'move',
            hudRow: hudRows.stamina
        });
        if (preview.risk?.totalDamage > 0) {
            stats.push({ icon: '-', label: `${preview.risk.totalDamage}`, tone: 'danger', kind: 'damage', hudRow: hudRows.danger });
        }
        if (preview.risk?.totalBlocked > 0) {
            stats.push({ icon: 'S', label: `${preview.risk.totalBlocked}`, tone: 'route', kind: 'shield', hudRow: hudRows.shield });
        }
        if (preview.risk?.waterSpent > 0) {
            stats.push({ icon: '~', label: `${preview.risk.waterSpent}`, tone: 'cost', kind: 'water', hudRow: hudRows.water });
        }
        if (preview.deathCell) {
            stats.push({ icon: 'X', label: isSpanish() ? 'Letal' : 'Lethal', tone: 'danger', kind: 'lethal', hudRow: hudRows.danger });
        } else if (!preview.complete || preview.blockedTarget) {
            stats.push({ icon: '!', label: isSpanish() ? 'Bloqueado' : 'Blocked', tone: 'cost', kind: 'blocked', hudRow: hudRows.danger });
        }

        return enrichStats(stats);
    }

    function getVisibilityStats(cell, isDanceMode) {
        if (!cell.revealed && !cell.litByLamp && !isDanceMode) {
            return enrichStats([{ icon: '?', label: isSpanish() ? 'Oculto' : 'Hidden', tone: 'route', kind: 'hidden', hudRow: hudRows.objective }]);
        }
        if (!cell.revealed && cell.litByLamp && !isDanceMode) {
            return enrichStats([{ icon: 'O', label: isSpanish() ? 'Iluminada' : 'Lit', tone: 'route', kind: 'reveal', hudRow: hudRows.objective }]);
        }
        return [];
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
        getEnemyStats,
        getObjectEffectStats,
        getRouteStats,
        getVisibilityStats
    };
}

window.HW_INSPECT_STATS = {
    createInspectStatsSystem
};
})();
