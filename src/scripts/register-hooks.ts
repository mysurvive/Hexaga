import { DamageRollContext } from "../module/system/dice/roller.ts";
import { AttackStatistic } from "../module/system/statistic/statistic.ts";

export function registerHooks() {
    Hooks.on("renderChatMessageHTML", (message: ChatMessage, html: HTMLElement) => {
        const rollContext = message.getFlag("hexaga", "rollContext");
        if (!rollContext) return;

        const damageBtn = html.querySelector('.roll-damage-btn[data-action="roll-damage"]') as HTMLButtonElement;
        if (!damageBtn) return;

        damageBtn.addEventListener("click", () => {
            const roller = game.actors.get(rollContext.actorId);
            const item = roller?.items.get(rollContext.itemId);
            if (!roller || !item || item.type !== "weapon") return;

            const attackStatistic = new AttackStatistic(roller, { weapon: item, slug: item.slug });

            if (!message.flags.hexaga) return;

            const damageRollContext: DamageRollContext = {
                roller: roller,
                target: rollContext.target ?? undefined,
                item: item,
                rollType: rollContext.rollType,
                successLevel: message.flags.hexaga.rollContext.successLevel,
                against: rollContext.against,
            };

            attackStatistic.damage(damageRollContext);
        });
    });

    Hooks.on("renderChatMessageHTML", (message: ChatMessage, html: HTMLElement) => {
        const rollContext = message.getFlag("hexaga", "rollContext");
        if (!rollContext) return;
        const applyDamageBtn = html.querySelector('.apply-damage-btn[data-action="apply-damage"]');
        if (!applyDamageBtn) return;

        applyDamageBtn.addEventListener("click", () => {
            const selectedToken = canvas.tokens.controlled[0];
            if (selectedToken.actor) selectedToken.actor.applyDamage(rollContext);
        });
    });
}
