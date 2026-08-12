// Data-driven item interaction system.
(() => {
const ITEM_EFFECT_HANDLERS = {
    tradeCooldown(effect, { game, result }) {
        if (game.player.pollen >= effect.pollen && game.player.water >= effect.water) {
            game.player.pollen -= effect.pollen;
            game.player.water -= effect.water;
            if (effect.attackRange) {
                game.player.attackRange = (game.player.attackRange || 1) + effect.attackRange;
                result.deltas.push({ stat: 'pollen', amount: -effect.pollen }, { stat: 'water', amount: -effect.water }, { stat: 'range', amount: effect.attackRange });
                result.messages.push('Trade beetle tuned your sting. Attack range increased.');
            } else {
                game.player.maxMovePoints = (game.player.maxMovePoints || game.player.maxStamina || 2) + 1;
                game.player.movePoints = game.player.maxMovePoints;
                result.deltas.push({ stat: 'pollen', amount: -effect.pollen }, { stat: 'water', amount: -effect.water }, { stat: 'stamina', amount: 1 });
                result.messages.push('Trade beetle packed honey fuel. Movement increased.');
            }
        } else {
            result.messages.push('Trade beetle needs pollen and water to improve your tactical options.');
        }
    },
    gainShield(effect, { game, result }) {
        if (game.player.upgrades >= game.player.maxShield) {
            result.consume = false;
            result.messages.push('Shield is already full.');
            return;
        }
        const gained = Math.min(effect.amount, game.player.maxShield - game.player.upgrades);
        game.player.upgrades += gained;
        result.deltas.push({ stat: 'upgrades', amount: gained });
        result.messages.push(`Shield upgrade collected. Added ${gained} shield.`);
    },
    gainResource(effect, { game, result }) {
        const amount = effect.amount || 0;
        game.player[effect.resource] = (game.player[effect.resource] || 0) + amount;
        if (effect.runStat) {
            game.runStats[effect.resource] = (game.runStats[effect.resource] || 0) + amount;
        }
        result.deltas.push({ stat: effect.resource, amount });
        result.messages.push(getResourceMessage(effect.resource));
    },
    heal(effect, { helpers, result }) {
        const healed = helpers.healPlayer(effect.amount);
        if (healed > 0) {
            result.deltas.push({ stat: 'health', amount: healed });
            result.messages.push('Recovered health.');
        }
    },
    royalJelly(effect, { game, helpers, result }) {
        if (!helpers.hasRelic('royalJelly')) return;
        game.royalJellyPollen += 1;
        if (game.royalJellyPollen >= 3) {
            game.royalJellyPollen = 0;
            const healed = helpers.healPlayer(2);
            if (healed > 0) {
                result.deltas.push({ stat: 'health', amount: healed });
                result.messages.push('Royal Jelly healed the bee.');
            }
        }
    },
    revealAround(effect, { cell, helpers, result }) {
        helpers.revealAround(cell.q, cell.r, effect.radius);
        result.messages.push('Mist lifted around the cell.');
    },
    pauseEnemyTimers(effect, { cell, helpers, result }) {
        helpers.pauseEnemyTimers(effect.durationMs, cell.q, cell.r, effect.radius);
        result.messages.push('Enemy timers stalled for a short escape.');
    },
    revealEnemies(effect, { game, helpers, result }) {
        game.cells.forEach((roomCell) => {
            if (helpers.isEnemyObject(roomCell.object)) roomCell.revealed = true;
        });
        result.messages.push('Every enemy in the chamber was revealed.');
    },
    revealExitRoute(effect, { helpers, result }) {
        helpers.revealRouteToExit();
        result.messages.push('A route toward the exit was revealed.');
    },
    royalNectar(effect, { game, helpers, result }) {
        if (game.player.health >= helpers.getPlayerMaxHealth()) {
            game.player.maxHealth += 1;
            game.player.health += 1;
            result.deltas.push({ stat: 'health', amount: 1 });
            result.messages.push('Royal nectar strengthened the bee. Max health increased.');
        } else {
            const healed = helpers.healPlayer(effect.heal || 4);
            if (healed > 0) result.deltas.push({ stat: 'health', amount: healed });
            result.messages.push('Royal nectar restored the bee.');
        }
    },
    slowNearbyEnemies(effect, { cell, helpers, result }) {
        helpers.slowNearbyEnemies(cell.q, cell.r, effect.radius, effect.durationMs);
        result.messages.push('Nearby moving enemies slowed.');
    },
    transformCell(effect, { cell, result }) {
        cell.object = effect.object;
        result.consume = false;
        result.messages.push('The cell changed shape.');
    },
    revealExitHint(effect, { helpers, result }) {
        helpers.revealExitHint();
        result.messages.push('The exit tugged through the mist.');
    }
};

const ITEM_EFFECT_TYPES = Object.freeze(Object.keys(ITEM_EFFECT_HANDLERS));

function hasItemEffectHandler(effectType) {
    return Boolean(ITEM_EFFECT_HANDLERS[effectType]);
}

function createItemSystem(context) {
    const { game, objects, helpers } = context;

    function resolve(objectId, cell) {
        const object = objects[objectId];
        if (!object?.effects?.length) {
            return {
                message: 'Moved to an open cell.',
                deltas: [],
                consume: false
            };
        }

        const result = {
            messages: [],
            deltas: [],
            consume: true
        };

        object.effects.forEach((effect) => applyEffect(effect, cell, result));

        return {
            message: result.messages.filter(Boolean).join(' ') || `${object.name} collected.`,
            deltas: result.deltas,
            consume: result.consume
        };
    }

    function applyEffect(effect, cell, result) {
        const handler = ITEM_EFFECT_HANDLERS[effect.type];
        if (!handler) return;
        handler(effect, { cell, game, helpers, result });
    }

    return { resolve };
}

function getResourceMessage(resource) {
    if (resource === 'pollen') return 'Collected pollen.';
    if (resource === 'water') return 'Collected water.';
    if (resource === 'honey') return 'Collected honey.';
    if (resource === 'stingCharges') return 'Double sting stored.';
    return 'Collected supplies.';
}

window.HW_ITEMS = {
    createItemSystem,
    ITEM_EFFECT_TYPES,
    hasItemEffectHandler
};
})();
