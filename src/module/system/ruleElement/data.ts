import { ItemHex } from "../../item/base/base.ts";

export class RuleElementData<TItem extends ItemHex = ItemHex> extends foundry.abstract.DataModel<
    BaseRuleElementSchema,
    TItem
> {
    declare parent: TItem;
    static override defineSchema(): BaseRuleElementSchema {
        return defineRuleElementSchema();
    }
}

const defineRuleElementSchema = () => {
    return {
        domains: new fields.ArrayField(new fields.StringField(), { required: true, initial: ["all"] }),
        label: new fields.StringField({ required: false, nullable: true }),
        key: new fields.StringField({
            required: true,
            nullable: false,
            choices: Object.keys(CONFIG.hexaga.ruleElements),
        }),
        slug: new fields.StringField({ required: true, nullable: false }),
        phase: new fields.StringField({
            required: true,
            nullable: true,
            choices: ["beforeDerived", "derived"],
            initial: "derived",
        }),

        value: new fields.NumberField({ required: false, nullable: true }),
        target: new fields.StringField({ required: false, nullable: true, initial: "" }),

        // Choice Rule Element
        choices: new fields.ArrayField(new fields.StringField(), { required: false, nullable: true }),
    };
};

export type BaseRuleElementSchema = ReturnType<typeof defineRuleElementSchema>;
export type RuleElementDataConstructor = ConstructorParameters<(typeof CONFIG.hexaga.ruleElements)[string]>[1];
