import { ATTRIBUTE_STRINGS } from "../../../actor/foundation.ts";
import { ItemHex } from "../../base/base.ts";
import { ItemHexData, ItemHexSchema } from "../../base/data.ts";

export class HeritageData extends foundry.abstract.TypeDataModel<HeritageSchema, ItemHex> {
    static override defineSchema(): HeritageSchema & ItemHexSchema {
        return { ...ItemHexData.defineSchema(), ...defineHeritageSchema() };
    }
}

const defineHeritageSchema = () => {
    return {
        improvements: new fields.SchemaField({
            attributes: new fields.SchemaField({
                choices: new fields.ArrayField(new fields.StringField(), {
                    required: true,
                    nullable: false,
                    initial: [...ATTRIBUTE_STRINGS],
                    readonly: true,
                }),
                selected: new fields.ArrayField(new fields.StringField({ choices: [...ATTRIBUTE_STRINGS] }), {
                    required: true,
                    initial: [],
                }),
            }),
            aspects: new fields.DocumentUUIDField(),
        }),
    };
};

type HeritageSchema = ReturnType<typeof defineHeritageSchema>;
