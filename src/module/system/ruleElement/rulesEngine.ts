import { ItemHex } from "../../item/base/base.ts";
import { AnyRuleElement } from "./types.ts";

export class RulesEngine {
    static initialize(item: ItemHex): AnyRuleElement[] {
        const rules: AnyRuleElement[] = [];
        const rulesData = item.system.rules || [];

        for (const ruleData of rulesData) {
            if (!(ruleData.key in CONFIG.hexaga.ruleElements)) continue;
            const Constructor = CONFIG.hexaga.ruleElements[ruleData.key as keyof typeof CONFIG.hexaga.ruleElements];
            if (!Constructor) {
                console.warn(`Invalid Rule Element type ${ruleData.key} on ${item.name}`);
                continue;
            }

            try {
                const ruleInstance = new Constructor(ruleData as never, { parent: item });
                rules.push(ruleInstance);
            } catch (error) {
                console.error(`Unable to create rule element ${ruleData.key} on ${item.name}`, error);
            }
        }
        return rules;
    }
}
