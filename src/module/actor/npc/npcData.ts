import { Modifier } from "../../system/modifier/modifier.ts";
import { HitpointStatistic } from "../../system/statistic/hitpointStatistic.ts";
import { TempoStatistic } from "../../system/statistic/tempoStatistic.ts";
import { CharacterHexData } from "../character/characterData.ts";

export class NPCData extends CharacterHexData<NPCSchema> {
    static override defineSchema() {
        return defineNPCSchema();
    }

    override prepareDerivedData() {
        super.prepareDerivedData();
        this.parent.intrinsics = {};

        // Tempo
        this.parent.intrinsics.tempo = new TempoStatistic(this.parent, {
            attributes: ["acumen", "deftness"],
            slug: "tempo",
        });

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
        }),
        expertise: new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField(),
                value: new fields.StringField(),
            }),
            { initial: [] },
        ),
    };
};

export type NPCSchema = ReturnType<typeof defineNPCSchema>;
