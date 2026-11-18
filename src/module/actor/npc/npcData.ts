import { Modifier } from "../../system/modifier/modifier.ts";
import { HitpointStatistic } from "../../system/statistic/hitpointStatistic.ts";
import { ResistanceValueStatistic } from "../../system/statistic/resistanceValueStatistic.ts";
import { ResistStatistic } from "../../system/statistic/resistStatistic.ts";
import { TempoStatistic } from "../../system/statistic/tempoStatistic.ts";
import { CharacterHexData } from "../character/characterData.ts";

export class NPCData extends CharacterHexData<NPCSchema> {
    static override defineSchema() {
        return defineNPCSchema();
    }

    override prepareDerivedData() {
        super.prepareDerivedData();
        this.parent.intrinsics = {};
        this.parent.rv = {};
        this.parent.resist = {};

        // Tempo
        this.parent.intrinsics.tempo = new TempoStatistic(this.parent, {
            attributes: ["acumen", "deftness"],
            slug: "tempo",
        });

        // RVs
        this.parent.rv = {
            physical: new ResistanceValueStatistic(this.parent, {
                attributes: ["physique", "deftness"],
                slug: "physical-rv",
                group: "physical",
            }),
            mental: new ResistanceValueStatistic(this.parent, {
                attributes: ["wit", "acumen"],
                slug: "mental-rv",
                group: "mental",
            }),
            personality: new ResistanceValueStatistic(this.parent, {
                attributes: ["will", "ego"],
                slug: "personality-rv",
                group: "personality",
            }),
        };

        this.parent.resist = {
            physical: new ResistStatistic(this.parent, {
                attributes: ["physique", "deftness"],
                slug: "physical-resist",
                group: "physical",
            }),
            mental: new ResistStatistic(this.parent, {
                attributes: ["wit", "acumen"],
                slug: "mental-resist",
                group: "mental",
            }),
            personality: new ResistStatistic(this.parent, {
                attributes: ["will", "ego"],
                slug: "personality-resist",
                group: "personality",
            }),
        };

        // HP
        this.parent.hp = new HitpointStatistic(this.parent, {
            slug: "hp",
            modifiers: [new Modifier({ slug: "max-hp", modifier: this.intrinsic.hp.max, modifies: "flat" })],
        });
    }
}

const defineNPCSchema = () => {
    return {
        ...CharacterHexData.defineSchema(),
        intrinsic: new fields.SchemaField({
            hp: new fields.SchemaField({
                current: new fields.NumberField({ required: true, nullable: false, initial: 10 }),
                max: new fields.NumberField({ required: true, nullable: false, initial: 10 }),
            }),
            tempo: new fields.SchemaField({
                total: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
            }),
        }),
        expertise: new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField(),
                value: new fields.StringField(),
            }),
            { initial: [] },
        ),
        rv: new fields.SchemaField({
            physical: new fields.SchemaField({
                base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            mental: new fields.SchemaField({
                base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            personality: new fields.SchemaField({
                base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
        }),
        resist: new fields.SchemaField({
            physical: new fields.SchemaField({
                base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            mental: new fields.SchemaField({
                base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
            personality: new fields.SchemaField({
                base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            }),
        }),
        ablation: new fields.SchemaField(
            {
                armor: new fields.SchemaField(
                    {
                        base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
                    },
                    { required: true },
                ),
                shield: new fields.SchemaField({
                    base: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
                }),
            },
            { required: true },
        ),
    };
};

export type NPCSchema = ReturnType<typeof defineNPCSchema>;
