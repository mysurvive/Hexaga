import { RuleElement } from "../../system/ruleElement/base.ts";

export class ItemHex<SubType extends Item.SubType = Item.SubType> extends Item<SubType> {
    declare runtimeRules: RuleElement[];

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.runtimeRules = [];
        const savedRules = this.system.rules ?? [];
        for (const rule of savedRules) {
            if (!rule.key) continue;
            this.runtimeRules.push(new CONFIG.hexaga.ruleElements[rule.key](this, rule));
        }
    }
}
