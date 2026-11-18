import { ActorHex } from "../../actor/base/baseActor.ts";
import { RollArgs, TempoRoll } from "../dice/roller.ts";
import { createAttributeModifier } from "../modifier/helpers.ts";
import { Modifier } from "../modifier/modifier.ts";
import { Test, TestContext } from "../test.ts";
import { Statistic } from "./statistic.ts";

export class TempoStatistic extends Statistic {
    declare attributes;
    constructor(actor: ActorHex, data: { attributes: (keyof typeof CONFIG.hexaga.attributes)[]; slug: string }) {
        data.slug = "tempo";
        super(actor, data);

        this.domains = ["all", data.slug];
        this.attributes = data.attributes;
    }

    get base() {
        return "tempo" in this.actor.system.intrinsic
            ? this.actor.system.intrinsic.tempo.total
            : this.getSpecificModifierValue(this.getBaseModifiers());
    }

    override get total() {
        return Math.max(
            "tempo" in this.actor.system.intrinsic ? this.getModifierValue() : super.total,
            this.actor.fading ? 0 : 1,
        );
    }

    protected override getBaseModifiers(): Modifier[] {
        const baseMods: Modifier[] = [];

        if ("tempo" in this.actor.system.intrinsic) {
            return [
                new Modifier({
                    slug: "npc-tempo",
                    label: "Tempo",
                    domains: ["tempo"],
                    modifies: "dice",
                    modifier: this.actor.system.intrinsic.tempo.total,
                }),
            ];
        }

        for (const attribute of this.attributes) {
            baseMods.push(createAttributeModifier({ actor: this.actor, attribute: attribute, domains: this.domains }));
        }

        return baseMods;
    }

    async roll(args: RollArgs = {}): Promise<TempoRoll | undefined> {
        const testContext: TestContext = {
            roller: this.actor,
            rollOptions: [],
            domains: this.domains,
            type: "tempo",
        };
        const result = await new Test(testContext).roll(args);
        if (!result) return;

        const actorID = this.actor.id;
        if (!actorID) return;

        if (!args.fromCombat && game.combat) {
            const targetCombatants = this.actor.token?.combatant
                ? [this.actor.token.combatant]
                : game.combat.getCombatantsByActor(actorID);

            const updates = targetCombatants
                .filter((c) => c.id)
                .map((c) => ({ _id: c.id!, initiative: result.rawSuccesses }));

            if (updates.length > 0) {
                await game.combat.updateEmbeddedDocuments("Combatant", updates);
            }
        }

        return result instanceof TempoRoll ? result : undefined;
    }
}
