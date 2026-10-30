import { RuleElementData } from "../../system/ruleElement/data.ts";
import { Override } from "fvtt-types/utils";

export class ItemHexData<TSchema extends ItemHexSchema> extends foundry.abstract.TypeDataModel<TSchema, Item> {
    static override defineSchema(): ItemHexSchema {
        return defineItemSchema();
    }

    override async _preCreate(
        data: foundry.abstract.TypeDataModel.ParentAssignmentType<TSchema, Item>,
        options: foundry.abstract.DatabaseBackend.CreateOperation,
        user: Override<User, object>,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;

        if (!this.sourceId) {
            const source = this.parent.pack
                ? `Compendium.${this.parent.pack}.${this.parent.type}.${this.parent._id}`
                : this.parent.uuid;
            // Temporary type fix
            if (source) this.updateSource({ sourceId: source } as any);
        }
    }

    getRollOptions(prefix: string = this.parent.type): string[] {
        const rollOptions = [`${prefix}:id:${this.parent.id}`, `${prefix}:${this.slug}`];

        return rollOptions;
    }
}

const defineItemSchema = () => {
    return {
        description: new fields.HTMLField(),
        rules: new fields.ArrayField(new fields.EmbeddedDataField(RuleElementData), { required: true, initial: [] }),
        slug: new fields.StringField({ required: true, nullable: false, initial: "" }),
        sourceId: new fields.StringField({ required: true }),
    };
};

export type ItemHexSchema = ReturnType<typeof defineItemSchema>;
export { defineItemSchema };
