import { ActorHex } from "./baseActor.ts";

export class ActorHexData<Schema extends ActorHexSchema> extends foundry.abstract.TypeDataModel<Schema, ActorHex> {
    static override defineSchema(): ActorHexSchema {
        return defineActorSchema();
    }
}

const defineAttributeSchema = () => {
    return {
        rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        label: new fields.StringField({ required: true }),
        group: new fields.StringField({ required: true }),
        mod: new fields.NumberField({ required: true, initial: 0, nullable: false, persistent: false }),
        breakdown: new fields.ArrayField(new fields.StringField(), {
            required: true,
            initial: [],
            nullable: false,
            persistent: false,
        }),
        total: new fields.NumberField({ required: true, initial: 0, nullable: false, persistent: false }),
    };
};

const defineActorSchema = () => {
    return {
        attributes: new fields.SchemaField({
            physique: new fields.SchemaField(defineAttributeSchema()),
            deftness: new fields.SchemaField(defineAttributeSchema()),
            wit: new fields.SchemaField(defineAttributeSchema()),
            acumen: new fields.SchemaField(defineAttributeSchema()),
            will: new fields.SchemaField(defineAttributeSchema()),
            ego: new fields.SchemaField(defineAttributeSchema()),
        }),
        intrinsic: new fields.SchemaField({
            hp: new fields.SchemaField({
                current: new fields.NumberField({ required: true, nullable: false, initial: 10 }),
            }),
        }),
        skillData: new fields.SchemaField({
            brawn: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            striking: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            menace: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            marksmanship: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            legerdemain: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            stealth: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            knowledge: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            arcane: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            tinker: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            sense: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            discernment: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            nature: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            spirituality: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            survival: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            empathy: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            speech: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            command: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            occult: new fields.SchemaField({
                rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
        }),
    };
};

export type ActorHexSchema = ReturnType<typeof defineActorSchema>;
