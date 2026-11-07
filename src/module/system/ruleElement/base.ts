import { ItemHex } from "../../item/base/base.ts";
import { Predicate } from "../predicate/predicate.ts";

export class RuleElement<TSchema extends BaseRuleElementSchema = BaseRuleElementSchema> extends foundry.abstract
    .DataModel<TSchema, ItemHex> {
    static override defineSchema() {
        return defineRuleElementSchema();
    }

    get actor() {
        return this.parent?.actor;
    }

    testPredicate(rollOptions?: string[]): boolean {
        if (!this.actor) return false;

        const options = [...(rollOptions ?? []), ...this.actor.getRollOptions()];

        return Predicate.test(this.predicate, options);
    }
}

const defineRuleElementSchema = () => {
    return {
        label: new fields.StringField({ required: false, nullable: true }),
        key: new fields.StringField({
            required: true,
            nullable: false,
            choices: Object.keys(CONFIG.hexaga.ruleElements),
        }),
        slug: new fields.StringField({ required: true, nullable: false }),
        predicate: new fields.ArrayField(new fields.ObjectField(), { required: true, initial: [] }),
    };
};

export type BaseRuleElementSchema = ReturnType<typeof defineRuleElementSchema>;
