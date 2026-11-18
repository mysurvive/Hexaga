import { ActorHex } from "../../actor/base/baseActor.ts";
import { Attributes } from "../../actor/types.ts";
import { createAttributeModifier } from "../modifier/helpers.ts";
import { Modifier } from "../modifier/modifier.ts";
import { Test, TestContext } from "../test.ts";
import { Statistic } from "./statistic.ts";

export class ResistStatistic extends Statistic {
    declare attributes: Array<keyof Attributes>;
    declare group: "physical" | "mental" | "personality";

    constructor(
        actor: ActorHex,
        data: { attributes: Array<keyof Attributes>; slug: string; group: "physical" | "mental" | "personality" },
    ) {
        super(actor, data);

        this.attributes = data.attributes;
        this.domains = ["all", "resist", `${data.slug}-resist, data.slug`];
        this.group = data.group;
    }

    protected override getBaseModifiers(): Modifier[] {
        const baseMods: Modifier[] = [];

        if (!("resist" in this.actor.system)) {
            baseMods.push(
                new Modifier({
                    slug: "base-resist",
                    label: "Base Resist",
                    modifier: 1,
                    domains: this.domains,
                    modifies: "dice",
                }),
            );

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
        } else {
            baseMods.push(
                new Modifier({
                    slug: "npc-resist",
                    label: `Resist: ${this.group}`,
                    domains: this.domains,
                    modifier: this.actor.system.resist?.[this.group].base ?? 0,
                    modifies: "dice",
                }),
            );
        }

        return baseMods;
    }

    get base() {
        return "resist" in this.actor.system
            ? (this.actor.system.resist?.[this.group].base ?? 0)
            : this.getSpecificModifierValue(this.getBaseModifiers());
    }

    override get total() {
        return "resist" in this.actor.system
            ? (this.actor.system.resist?.[this.group].base ?? 0)
            : this.getModifierValue();
    }

    async roll(options: Partial<TestContext> = {}) {
        const testContext: TestContext = {
            roller: this.actor,
            dv: options.dv,
            rollOptions: [],
            group: this.group,
            domains: this.domains,
            type: "resist",
        };
        await new Test(testContext).roll();
    }
}
