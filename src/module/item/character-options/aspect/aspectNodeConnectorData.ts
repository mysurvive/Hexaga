import { AspectData } from "./aspectData.ts";

export class AspectNodeConnectorData extends foundry.abstract.DataModel<AspectNodeConnectorDataSchema, AspectData> {
    static override defineSchema(): fields.DataSchema {
        return defineAspectNodeConnectorSchema();
    }
}

const defineAspectNodeConnectorSchema = () => {
    return {
        posX: new fields.NumberField({ required: true, nullable: false }),
        posY: new fields.NumberField({ required: true, nullable: false }),
        requirements: new fields.ArrayField(new fields.StringField()),
        nodeUUID: new fields.StringField({ required: true, nullable: false }),
        requiredLevel: new fields.NumberField({ required: true, integer: true, min: 1, initial: 1 }),
    };
};

type AspectNodeConnectorDataSchema = ReturnType<typeof defineAspectNodeConnectorSchema>;
