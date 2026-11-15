import { ActorHex } from "./baseActor.ts";

export class ActorHexData<Schema extends ActorHexSchema, SubType extends Actor.SubType> extends foundry.abstract
    .TypeDataModel<Schema, ActorHex<SubType>> {
    public rollOptions: Record<string, Record<string, boolean>> = {};

    static override defineSchema() {
        return defineActorSchema();
    }
}

const defineActorSchema = () => {
    return {};
};

export type ActorHexSchema = ReturnType<typeof defineActorSchema>;
