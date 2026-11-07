import { AnyRuleElementSchema } from "../../system/ruleElement/types.ts";

export class ItemHexData<TSchema extends ItemHexSchema> extends foundry.abstract.TypeDataModel<TSchema, Item> {
    static override defineSchema(): ItemHexSchema {
        return defineItemSchema();
    }

    getRollOptions(prefix: string = this.parent.type): string[] {
        const rollOptions = [`${prefix}:id:${this.parent.id}`, `${prefix}:${this.slug}`];

        return rollOptions;
    }
}

const defineItemSchema = () => {
    return {
        description: new fields.HTMLField(),
        rules: new fields.ArrayField(new fields.ObjectField(), { required: true, initial: [] }),
        slug: new fields.StringField({ required: true, nullable: false, initial: "" }),
        sourceId: new fields.StringField({ required: true }),
    };
};

export type ItemHexSchema = ReturnType<typeof defineItemSchema>;
export { defineItemSchema };

export interface ItemHexData<TSchema> {
    rules: fields.SchemaField.SourceData<AnyRuleElementSchema>[];
}
