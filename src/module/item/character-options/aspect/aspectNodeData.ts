import { ItemHexData } from "../../base/data.ts";

export class AspectNodeData extends ItemHexData<AspectNodeSchema> {
    static override defineSchema(): AspectNodeSchema {
        return defineAspectNodeSchema();
    }
}

const defineAspectNodeSchema = () => {
    return {
        ...ItemHexData.defineSchema(),
        templateUuid: new fields.StringField({ required: true, blank: true, initial: "" }),
        aspectSlug: new fields.StringField({ required: true, blank: true, initial: "" }),
    };
};

type AspectNodeSchema = ReturnType<typeof defineAspectNodeSchema>;
