import { HitpointStatistic, ResistanceValueStatistic, SkillTraceData } from "../../system/statistic/statistic.ts";
import { ActorSynthetics } from "../synthetics.ts";

export class ActorHex<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {
    declare public synthetics: ActorSynthetics;
    declare skills: SkillStatisticRecord;
    declare rv: Record<string, ResistanceValueStatistic>;
    declare intrinsics: Record<string, any>;
    declare hp: HitpointStatistic;

    override prepareBaseData(): void {
        super.prepareBaseData();
    }

    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();

        // const sourceItems = this.items ?? [];
        // // Stores the breakdown of the data
        // const attributeData: Record<
        //     string,
        //     { base: number; bonus: number; details: { value: number; label: string }[] }
        // > = {};

        // // Loop through items
        // for (const item of sourceItems) {
        //     // Loop through item's rules
        //     for (const rule of item.system.rules) {
        //         if (rule.target) {
        //             attributeData[rule.target] ??= { base: 0, bonus: 0, details: [] };
        //             // Check whether the rule is rule.phase === "beforeDerived"
        //             if (rule.phase !== "beforeDerived") continue;
        //             // If so, check whether it is a "levelImprovement" type
        //             if (rule.value) {
        //                 if (item.type === "levelImprovement") {
        //                     // If it is, drop it into the "base" bucket
        //                     attributeData[rule.target].base += rule.value;
        //                 } else {
        //                     // If it is not, drop it into the "modifier" bucket
        //                     attributeData[rule.target].bonus += rule.value;
        //                     attributeData[rule.target].details.push({
        //                         value: rule.value,
        //                         label: rule.label ?? item.name,
        //                     });
        //                 }
        //             }
        //         }
        //     }
        // }

        // // Loop through the actor's attributes
        // for (const attribute in this.system.attributes) {
        //     // Check whether there is any breakdown data, initialize it if not
        //     const data = attributeData[attribute] ?? { base: 0, bonus: 0, details: [] };

        //     // Calculate the rank of the item based on the items
        //     this.system.attributes[attribute as keyof typeof this.system.attributes].rank = data.base + data.bonus;

        //     // Generate the breakdown data
        //     const breakdownParts: string[] = [`${data.base} (Base)`];

        //     for (const detail of data.details) {
        //         breakdownParts.push(`${detail.value >= 0 ? "+" : "-"} ${Math.abs(detail.value)} (${detail.label})`);
        //     }
        //     // Give it to the attribute
        //     this.system.attributes[attribute as keyof typeof this.system.attributes].breakdown =
        //         breakdownParts.join(", ");
        // }

        this.synthetics = { modifiers: {} };
    }
}

type SkillStatisticRecord = Record<string, SkillTraceData>;
