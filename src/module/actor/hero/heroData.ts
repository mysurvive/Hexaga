import { HEXAGACONFIG } from "../../../config/index.ts";
import { HitpointStatistic, ResistanceValueStatistic, SkillStatistic } from "../../system/statistic/statistic.ts";
import { ATTRIBUTE_GROUP_MAPS } from "../foundation.ts";
import { ActorHexData } from "../base/baseActorData.ts";
import { HeritageData } from "../../item/character-options/heritage/data.ts";
import { ItemHex } from "../../item/base/base.ts";

export class HeroData extends ActorHexData<HeroSchema> {
    static override defineSchema(): HeroSchema {
        return defineHeroSchema();
    }

    get unspentAttributePoints() {
        return this.improvements.abilities.allowed - this.improvements.abilities.used;
    }

    get heritage() {
        return this.parent.itemTypes.heritage[0] ?? null;
    }

    override prepareBaseData(): void {
        super.prepareBaseData();

        // Prepare Attributes
        for (const attribute in this.attributes) {
            const a = attribute as keyof typeof this.attributes;
            this.attributes[a].label = `hexaga.attributes.${attribute}.label`;

            const groupPair = Object.keys(ATTRIBUTE_GROUP_MAPS).find((attrKey) => {
                const groups = Object.keys(
                    ATTRIBUTE_GROUP_MAPS[attrKey as keyof typeof ATTRIBUTE_GROUP_MAPS].attributes,
                );
                return groups.includes(a);
            });
            if (!groupPair) throw new Error(`No matching group found for ${a}`);
            this.attributes[a].group = groupPair;
            this.attributes[a].rank = 0;
        }
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        // Clear Memory
        this.parent.skills = {};
        this.parent.rv = {};
        this.parent.intrinsics = {};

        this.options.heritage = this.parent.itemTypes.heritage[0] ?? null;

        // Create Skill Statistics
        const skillsConfig = CONFIG.hexaga?.skills ?? HEXAGACONFIG.skills;
        if (skillsConfig) {
            for (const [skill, _config] of Object.entries(skillsConfig)) {
                this.parent.skills[skill] = new SkillStatistic(this.parent, {
                    slug: skill,

                    rank: this.skillData[skill as keyof typeof this.skillData].rank,
                }).getTraceData();
            }
        }

        const allDomainModifiers = this.parent.synthetics.modifiers["all"] ?? [];

        // Intrinsics
        //    Speed
        const baseSpeed = 4 + Math.floor(this.attributes.deftness.rank / 2);
        const speedDomainModifiers = this.parent.synthetics.modifiers["speed"] ?? [];
        const speedModifiers = [...allDomainModifiers, ...speedDomainModifiers];
        const speedBonus = speedModifiers.reduce((sum, mod) => {
            return sum + mod.modifier;
        }, 0);

        this.parent.intrinsics.speed = baseSpeed + speedBonus;

        //    Tempo
        const baseTempo = this.attributes.deftness.rank + this.attributes.acumen.rank;
        const tempoDomainModifiers = this.parent.synthetics.modifiers["tempo"] ?? [];
        const tempoModifiers = [...allDomainModifiers, ...tempoDomainModifiers];
        const tempoBonus = tempoModifiers.reduce((sum, mod) => {
            return sum + mod.modifier;
        }, 0);

        this.parent.intrinsics.tempo = Math.max(baseTempo + tempoBonus, 1);

        // Defense
        //     RVs
        this.parent.rv.physical = new ResistanceValueStatistic(this.parent, {
            attributes: ["physique", "deftness"],
            slug: "physical-rv",
        });
        this.parent.rv.mental = new ResistanceValueStatistic(this.parent, {
            attributes: ["wit", "acumen"],
            slug: "mental-rv",
        });
        this.parent.rv.personality = new ResistanceValueStatistic(this.parent, {
            attributes: ["will", "ego"],
            slug: "personality-rv",
        });

        // HP
        this.parent.hp = new HitpointStatistic(this.parent, {
            label: "hexaga.hitpoints.label",
            slug: "hp",
        });
    }
}

const defineHeroSchema = () => {
    return {
        ...ActorHexData.defineSchema(),
        level: new fields.NumberField({ nullable: false, required: true, initial: 1 }),
        options: new fields.SchemaField({
            heritage: new fields.EmbeddedDataField(ItemHex, { nullable: true, persisted: false }), // this thing is a problem right now
        }),
        improvements: new fields.SchemaField({
            abilities: new fields.SchemaField({
                used: new fields.NumberField({ nullable: false, required: true, initial: 0 }),
                allowed: new fields.NumberField({ nullable: false, required: true, initial: 5 }),
            }),
            skills: new fields.SchemaField({
                used: new fields.NumberField({ nullable: false, required: true, initial: 0 }),
                allowed: new fields.NumberField({ nullable: false, required: true, initial: 6 }),
            }),
        }),
    };
};

type HeroSchema = ReturnType<typeof defineHeroSchema>;
