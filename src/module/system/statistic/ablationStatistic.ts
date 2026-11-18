import { ActorHex } from "../../actor/base/baseActor.ts";
import { ItemHex } from "../../item/base/base.ts";
import { Modifier } from "../modifier/modifier.ts";
import { BaseStatistic } from "./statistic.ts";

export class AblationStatistic extends BaseStatistic<ActorHex> {
    declare item?: ItemHex<"armor">;
    declare type: "armor" | "shield";

    constructor(
        actor: ActorHex,
        // Need to add in shield once it's created
        data: { item?: ItemHex<"armor">; slug: string; domains: string[]; type: "armor" | "shield" },
    ) {
        super(actor, data);
        this.item = data.item;
        this.type = data.type;
        this.domains = ["all", ...data.domains];
        const armored = this.item ? true : false;
        this.domains.push(armored ? `ablation-${this.type}` : "ablation-unarmored");
    }

    override getBaseModifiers(): Modifier[] {
        const baseMods: Modifier[] = [];

        if (!this.item && "ablation" in this.actor.system) {
            baseMods.push(
                new Modifier({
                    slug: `base-ablation-${this.type}`,
                    label: `Base ${this.item ? this.type : "Unarmored"} Ablation`,
                    domains: this.domains,
                    modifies: "flat",
                    modifier: this.actor.system.ablation?.[this.type].base ?? 0,
                }),
            );
        } else {
            baseMods.push(
                new Modifier({
                    slug: `base-ablation-${this.type}`,
                    label: `Base ${this.item ? this.type : "Unarmored"} Ablation`,
                    domains: this.domains,
                    modifies: "flat",
                    modifier: this.item?.system.ablation ?? 0,
                }),
            );
        }
        return baseMods;
    }

    get base() {
        return this.getSpecificModifierValue(this.getBaseModifiers()) ?? 0;
    }

    get total() {
        return this.getModifierValue() ?? 0;
    }
}
