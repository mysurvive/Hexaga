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

    Hooks.on("preCreateActor", (actorDoc: any, targetPayload: any, _options: any, _userId: string): boolean | void => {
        if (actorDoc.type !== "hero") return;

        const initialItems: any[] = Array.from(targetPayload.items || []);
        const operationalItemsUpdate: any[] = [...initialItems];

        const foundationalItems = initialItems.filter((i) => i.type === "heritage" || i.type === "profession");

        if (foundationalItems.length === 0) return;

        let modificationsApplied = false;

        for (const itemSource of foundationalItems) {
            const aspectUuid = itemSource.system?.improvements?.aspects;
            if (!aspectUuid) continue;

            const masterAspectTemplate = fromUuidSync(aspectUuid) as any;
            if (!masterAspectTemplate || masterAspectTemplate.type !== "aspect") continue;

            const targetSlug = masterAspectTemplate.system?.slug;
            const alreadyHasAspect = operationalItemsUpdate.some(
                (i) => i.type === "aspect" && i.system?.slug === targetSlug,
            );

            if (!alreadyHasAspect) {
                operationalItemsUpdate.push({
                    name: masterAspectTemplate.name,
                    type: "aspect",
                    img: masterAspectTemplate.img || "icons/svg/book.svg",
                    system: { ...masterAspectTemplate.system, slug: targetSlug },
                    flags: { hexaga: { grantedBy: itemSource.type } },
                });
                modificationsApplied = true;
            }
        }

        if (modificationsApplied) {
            actorDoc.updateSource({ items: operationalItemsUpdate });
        }
    });

    Hooks.on("preCreateItem", (itemDoc: any, targetPayload: any, _options: any, _userId: string): boolean | void => {
        const actor = itemDoc.parent;
        if (!actor || actor.type !== "hero") return;

        if (targetPayload.type === "aspect") {
            if (targetPayload.flags?.hexaga?.grantedBy) return;

            const newAspectSlug = targetPayload.system?.slug;
            if (!newAspectSlug) return;

            const currentChoices: string[] = [...(actor.system?.improvements?.aspects || [])];
            if (currentChoices.includes(newAspectSlug)) return;

            if (currentChoices.length >= 1) {
                ui.notifications?.error("Cannot equip Aspect Tree: You have no available chosen tree slots.");
                return false;
            }

            setTimeout(async () => {
                try {
                    currentChoices.push(newAspectSlug);
                    await actor.update({ "system.improvements.aspects": currentChoices });
                } catch (err) {
                    console.error("Hexaga | Aspect choice registration failed:", err);
                }
            }, 0);
        }
    });

    Hooks.on("deleteItem", (itemDoc: any, _options: any, _userId: string): boolean | void => {
        const actor = itemDoc.parent;
        if (!actor || actor.type !== "hero") return;

        if (itemDoc.type === "aspect") {
            const aspectSlug = itemDoc.system?.slug;
            if (!aspectSlug) return;

            const currentChoices: string[] = [...(actor.system?.improvements?.aspects || [])];
            if (currentChoices.includes(aspectSlug)) {
                setTimeout(async () => {
                    try {
                        const updatedChoices = currentChoices.filter((slug) => slug !== aspectSlug);
                        await actor.update({ "system.improvements.aspects": updatedChoices });
                    } catch (err) {
                        console.error("Hexaga | Error cleaning choice tracking data paths:", err);
                    }
                }, 0);
            }
        }
    });
}
