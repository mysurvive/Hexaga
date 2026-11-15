import { HEXAGACONFIG } from "../../../config/index.ts";
import { SkillStatistic } from "../../system/statistic/statistic.ts";
import { ActorHexData } from "../base/baseActorData.ts";

export class CharacterHexData<
    Schema extends CharacterSchema = CharacterSchema,
    SubType extends Actor.SubType = Actor.SubType,
> extends ActorHexData<Schema, SubType> {
    static override defineSchema() {
        return defineCharacterSchema();
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.parent.skills = {};

        // Create Skill Statistics
        const skillsConfig = CONFIG.hexaga?.skills ?? HEXAGACONFIG.skills;
        if (skillsConfig) {
            for (const [skill, _config] of Object.entries(skillsConfig)) {
                this.parent.skills[skill] = new SkillStatistic(this.parent, {
                    slug: skill,
                    rank: this.skills[skill as keyof typeof HEXAGACONFIG.skills].rank,
                });
            }
        }
    }

    _onCreateDescendantDocuments(..._args: Actor.OnCreateDescendantDocumentsArgs): void {}
    async _onUpdateDescendantDocuments(..._args: Actor.OnUpdateDescendantDocumentsArgs): Promise<void> {}
    async _onDeleteDescendantDocuments(..._args: Actor.OnDeleteDescendantDocumentsArgs): Promise<void> {}
}

const defineAttributeSchema = () => {
    return {
        rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        label: new fields.StringField({ required: true }),
        group: new fields.StringField({ required: true }),
        mod: new fields.NumberField({ required: true, initial: 0, nullable: false }),
        breakdown: new fields.ArrayField(new fields.StringField(), {
            required: true,
            initial: [],
            nullable: false,
        }),
        total: new fields.NumberField({ required: true, initial: 0, nullable: false }),
    };
};

const defineSkillSchema = () => {
    return {
        rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        mod: new fields.NumberField({ required: true, initial: 0, nullable: false, persisted: false }),
        breakdown: new fields.ArrayField(new fields.StringField(), {
            required: true,
            initial: [],
            nullable: false,
            persisted: false,
        }),
    };
};

const defineCharacterSchema = () => {
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
        skills: new fields.SchemaField({
            brawn: new fields.SchemaField(defineSkillSchema()),
            striking: new fields.SchemaField(defineSkillSchema()),
            menace: new fields.SchemaField(defineSkillSchema()),
            marksmanship: new fields.SchemaField(defineSkillSchema()),
            legerdemain: new fields.SchemaField(defineSkillSchema()),
            stealth: new fields.SchemaField(defineSkillSchema()),
            knowledge: new fields.SchemaField(defineSkillSchema()),
            arcane: new fields.SchemaField(defineSkillSchema()),
            tinker: new fields.SchemaField(defineSkillSchema()),
            sense: new fields.SchemaField(defineSkillSchema()),
            discernment: new fields.SchemaField(defineSkillSchema()),
            nature: new fields.SchemaField(defineSkillSchema()),
            spirituality: new fields.SchemaField(defineSkillSchema()),
            survival: new fields.SchemaField(defineSkillSchema()),
            empathy: new fields.SchemaField(defineSkillSchema()),
            speech: new fields.SchemaField(defineSkillSchema()),
            command: new fields.SchemaField(defineSkillSchema()),
            occult: new fields.SchemaField(defineSkillSchema()),
        }),
    };
};

export type CharacterSchema = ReturnType<typeof defineCharacterSchema>;
