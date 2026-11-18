import { ActorHex } from "../../actor/base/baseActor.ts";
import { Attributes } from "../../actor/types.ts";
import { createAttributeModifier } from "../modifier/helpers.ts";
import { Modifier } from "../modifier/modifier.ts";
import { BaseStatistic } from "./statistic.ts";

export class ResistanceValueStatistic extends BaseStatistic<ActorHex> {
    declare attributes: Array<keyof Attributes>;
    declare group: "physical" | "mental" | "personality";

    constructor(
        actor: ActorHex,
        data: { attributes: Array<keyof Attributes>; slug: string; group: "physical" | "mental" | "personality" },
    ) {
        super(actor, data);

        this.attributes = data.attributes;
        this.domains = ["all", "rv", `${data.slug}-rv`, data.slug];
        this.group = data.group;
    }

    protected override getBaseModifiers(): Modifier[] {
        if ("rv" in this.actor.system) return [];

        const baseMods: Modifier[] = [];

        for (const attribute of this.attributes) {
            baseMods.push(
                createAttributeModifier({
                    actor: this.actor,
                    attribute: attribute,
                    domains: this.domains,
                    multiplier: 0.5,
                }),
            );
        }

        return baseMods;
    }

    get base() {
        return "rv" in this.actor.system
            ? (this.actor.system.rv?.[this.group].base ?? 0)
            : this.getSpecificModifierValue(this.getBaseModifiers());
    }

    get total() {
        return "rv" in this.actor.system ? (this.actor.system.rv?.[this.group].base ?? 0) : this.getModifierValue();
    }
}
