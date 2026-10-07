import { ATTRIBUTE_STRINGS } from "../../../actor/foundation.ts";
import { ItemHexData } from "../../base/data.ts";

export class HeritageData extends ItemHexData<HeritageSchema> {
    static override defineSchema(): HeritageSchema {
        return defineHeritageSchema();
    }
}

const defineHeritageSchema = () => {
    return {
        ...ItemHexData.defineSchema(),
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
