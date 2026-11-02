import { HEXAGACONFIG } from "../../../config/index.ts";
import {
    AttackStatistic,
    HitpointStatistic,
    ResistanceValueStatistic,
    SkillStatistic,
} from "../../system/statistic/statistic.ts";
import { ATTRIBUTE_GROUP_MAPS, ATTRIBUTE_STRINGS, SKILL_STRINGS } from "../foundation.ts";
import { ActorHexData } from "../base/baseActorData.ts";
import { ItemHex } from "../../item/base/base.ts";
import { AspectData } from "../../item/character-options/aspect/aspectData.ts";

export class HeroData extends ActorHexData<HeroSchema> {
    static override defineSchema(): HeroSchema {
        return defineHeroSchema();
    }

    get heritage() {
        return this.parent.itemTypes.heritage[0] ?? null;
    }

    get profession() {
        return this.parent.itemTypes.profession[0] ?? null;
    }

    override prepareBaseData(): void {
        super.prepareBaseData();

        // Prepare Attributes
        this.prepareBaselineStats();
        for (const attribute in this.attributes) {
            const a = attribute as keyof typeof this.attributes;

            const groupPair = Object.keys(ATTRIBUTE_GROUP_MAPS).find((attrKey) => {
                const groups = Object.keys(
                    ATTRIBUTE_GROUP_MAPS[attrKey as keyof typeof ATTRIBUTE_GROUP_MAPS].attributes,
                );
                return groups.includes(a);
            });
            if (!groupPair) throw new Error(`No matching group found for ${a}`);

            this.attributes[a].label = `hexaga.attributes.${attribute}.label`;
            this.attributes[a].group = groupPair;
            this.attributes[a].mod = 0;
            this.attributes[a].total = this.attributes[a].rank;
            this.attributes[a].breakdown = [];
        }
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        // Clear Memory
        this.parent.skills = {};
        this.parent.expertise = [];
        this.parent.rv = {};
        this.parent.intrinsics = {};
        this.parent.maneuvers = [];

        this.options.heritage = this.heritage ?? null;
        this.options.profession = this.profession ?? null;

        // Create Skill Statistics
        const skillsConfig = CONFIG.hexaga?.skills ?? HEXAGACONFIG.skills;
        if (skillsConfig) {
            for (const [skill, _config] of Object.entries(skillsConfig)) {
                this.parent.skills[skill] = new SkillStatistic(this.parent, {
                    slug: skill,
                    rank: this.skills[skill as keyof typeof this.skills].rank,
                });
            }
        }

        this.parent.expertise = this.getExpertise().sort((a, b) => a.value.localeCompare(b.value));
        for (const exp of this.parent.expertise) {
            this.rollOptions.all[`expertise:${exp.slug}`] = true;
        }

        for (const weapon of this.parent.itemTypes.weapon) {
            this.parent.maneuvers.push(new AttackStatistic(this.parent, { slug: `${weapon.slug}`, weapon: weapon }));
        }

        this.prepareNumericRollOptions();

        for (const rule of this.parent.rules) {
            rule.onPrepareDerivedData();
        }

        const allDomainModifiers = this.parent.synthetics.modifiers["all"] ?? [];

        // Intrinsics
        //    Speed
        const baseSpeed = 4 + Math.floor(this.attributes.deftness.rank / 2);
        const speedDomainModifiers = this.parent.synthetics.modifiers["speed"] ?? [];
        const speedModifiers = [...allDomainModifiers, ...speedDomainModifiers];
        const speedBonus = speedModifiers.reduce((sum, mod) => {
            const modifier = mod();
            if (!modifier) return sum;
            return sum + modifier.modifier;
        }, 0);

        this.parent.intrinsics.speed = baseSpeed + speedBonus;

        //    Tempo
        const baseTempo = this.attributes.deftness.rank + this.attributes.acumen.rank;
        const tempoDomainModifiers = this.parent.synthetics.modifiers["tempo"] ?? [];
        const tempoModifiers = [...allDomainModifiers, ...tempoDomainModifiers];
        const tempoBonus = tempoModifiers.reduce((sum, mod) => {
            const modifier = mod();
            if (!modifier) return sum;
            return sum + modifier.modifier;
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

    _onCreateDescendantDocuments(...args: Actor.OnCreateDescendantDocumentsArgs): void {
        const [_parent, _collection, documents] = args;

        if (!documents || !documents.length) return;

        const aspectUpdates = documents.filter((d) => d.type === "aspect" || d.type === "aspectNode");
        if (aspectUpdates.length > 0) {
            this.prepareAspectProgression();
        }
    }

    async _onUpdateDescendantDocuments(...args: Actor.OnUpdateDescendantDocumentsArgs): Promise<void> {
        const [_parent, collection, documents] = args;

        if (collection !== "items" || !documents || !documents.length) return;

        for (const document of documents) {
            const selections = document.getFlag("hexaga", "selections") ?? {};
            const attributes = selections.attributes;
            const skills = selections.skills;
            const expertise = selections.expertise;
            const aspects = Array.isArray(document.system?.improvements?.aspects)
                ? document.system.improvements.aspects
                : document.system?.improvements?.aspects
                  ? [document.system.improvements.aspects]
                  : [];

            if (document.type === "heritage" || document.type === "profession") {
                const improvements = foundry.utils.deepClone(this.improvements);
                improvements.attributes[document.type] = attributes;
                improvements.skills[document.type] = skills;
                improvements.expertise[document.type] = expertise;
                improvements.aspects[document.type] = aspects;

                await this.parent.update({ system: { improvements: improvements } });
            }
        }
    }

    async _onDeleteDescendantDocuments(...args: Actor.OnDeleteDescendantDocumentsArgs): Promise<void> {
        const [_parent, collection, documents] = args;

        if (collection !== "items" || !documents || !documents.length) return;

        const itemsToDeleteIds: string[] = [];
        const deletedItems = documents as unknown as Item[];

        // Delete all aspect nodes purchased from an aspect when an aspect is deleted
        for (const item of deletedItems) {
            if (item && item.type === "aspect") {
                const aspectModel = item.system as unknown as AspectData;
                const aspectSlug = aspectModel.slug;
                if (!aspectSlug) continue;

                for (const ownedItem of this.parent.items) {
                    if (ownedItem.type === "aspectNode") {
                        const nodeAspectSlug = (ownedItem.system as any).aspectSlug;

                        if (nodeAspectSlug === aspectSlug) {
                            itemsToDeleteIds.push(ownedItem.id!);
                        }
                    }
                }
            }

            if (item && (item.type === "heritage" || item.type === "profession")) {
                for (const improvement in this.improvements) {
                    const i = improvement as keyof typeof this.improvements;
                    if (item.type in this.improvements[i]) {
                        await this.parent.update({
                            [`system.improvements.${i}`]: { [item.type]: new foundry.data.operators.ForcedDeletion() },
                        });
                    }
                }
            }
        }

        if (itemsToDeleteIds.length > 0) {
            void this.parent.deleteEmbeddedDocuments("Item", itemsToDeleteIds);
        }

        const aspectUpdates = documents.filter((d) => d.type === "aspect" || d.type === "aspectNode");
        if (aspectUpdates.length > 0) {
            this.prepareAspectProgression();
        }
    }

    override async _preUpdate(changes: object, options: Actor.Database.PreUpdateOptions, user: User.Stored) {
        const allowed = await super._preUpdate(changes, options, user);
        if (allowed === false) return false;

        if (
            foundry.utils.hasProperty(changes, "itemTypes.aspect") ||
            foundry.utils.hasProperty(changes, "itemTypes.aspectNode")
        ) {
            const aspectChanges = this.prepareAspectProgression();
            foundry.utils.mergeObject(changes, { "system.improvements.aspects": aspectChanges });
        }

        return true;
    }

    getExpertise(): ValueSlugModel[] {
        const improvementExpertise = Object.values(this.improvements.expertise).flatMap((e) => e);
        const expertise = [...(this.parent.expertise ?? []), ...improvementExpertise];

        return expertise;
    }

    prepareAspectProgression() {
        const aspects = [...this.parent.itemTypes.aspect, ...this.parent.itemTypes.aspectNode].reduce(
            (acc, a) => {
                const level = (a.system.level.taken ?? a.flags.hexaga?.grantedBy ?? "bonus").toString();
                if (!acc[level]) {
                    acc[level] = [];
                }
                acc[level].push(a.uuid);
                return acc;
            },
            {} as Record<string, string[]>,
        );

        this.parent.update({ system: { improvements: { aspects: aspects } } });
    }

    prepareBaselineStats(): void {
        const attributes = this.attributes;
        const skills = this.skills;

        const levelMap = Array.from({ length: this.level }, (_, index) => {
            return index + 1;
        });

        const attributeImprovements = Object.entries(this.improvements.attributes)
            .flatMap((key) => {
                {
                    if (levelMap.includes(Number(key[0])) || key[0] === "heritage" || key[0] === "profession") {
                        return key[1];
                    }
                    return undefined;
                }
            })
            .filter((a) => a !== undefined);

        for (const attr in attributes) {
            const a = attr as keyof typeof attributes;
            attributes[a].rank = attributeImprovements.reduce((total, current) => {
                return current === a ? total + 1 : total;
            }, 0);
        }

        const skillImprovements = Object.entries(this.improvements.skills)
            .flatMap((key) => {
                {
                    if (levelMap.includes(Number(key[0])) || key[0] === "heritage" || key[0] === "profession") {
                        return key[1];
                    }
                    return undefined;
                }
            })
            .filter((a) => a !== undefined);

        for (const skl in skills) {
            const s = skl as keyof typeof skills;
            skills[s].rank = skillImprovements.reduce((total, current) => {
                return current === s ? total + 1 : total;
            }, 0);
        }
    }

    prepareNumericRollOptions() {
        for (const attribute of ATTRIBUTE_STRINGS) {
            const rank = this.attributes[attribute].total;
            this.rollOptions.all[`${attribute}:rank:${rank}`] = true;
        }

        for (const skill of SKILL_STRINGS) {
            const rank = this.parent.skills[skill].total;
            this.rollOptions.all[`${skill}:rank:${rank}`] = true;
        }

        // for (const aspect of this.parent.itemTypes.aspect ?? []) {
        //     const count = aspect.system.pointsSpent;
        //     this.rollOptions.all[`aspect:${aspect.system.slug}:count:${count}`] = true;
        // }
    }
}

const defineHeroSchema = () => {
    return {
        ...ActorHexData.defineSchema(),
        level: new fields.NumberField({ nullable: false, required: true, initial: 1 }),
        options: new fields.SchemaField({
            heritage: new fields.EmbeddedDataField(ItemHex, { nullable: true, persisted: false }),
            profession: new fields.EmbeddedDataField(ItemHex, { nullable: true, persisted: false }),
        }),
        improvements: new fields.SchemaField({
            attributes: new fields.TypedObjectField(
                new fields.ArrayField(new fields.StringField({ choices: [...ATTRIBUTE_STRINGS] })),
            ),
            skills: new fields.TypedObjectField(
                new fields.ArrayField(new fields.StringField({ choices: [...SKILL_STRINGS] })),
            ),
            expertise: new fields.TypedObjectField(new fields.ArrayField(new fields.EmbeddedDataField(ValueSlugModel))),
            aspects: new fields.TypedObjectField(new fields.ArrayField(new fields.StringField())),
        }),
    };
};

export class ValueSlugModel extends foundry.abstract.DataModel<ValueSlugModelSchema> {
    static override defineSchema() {
        return defineValueSlugModel();
    }
}

const defineValueSlugModel = () => {
    return {
        value: new fields.StringField({ required: true, nullable: false }),
        slug: new fields.StringField({ required: true, nullable: false }),
    };
};

type ValueSlugModelSchema = ReturnType<typeof defineValueSlugModel>;

type HeroSchema = ReturnType<typeof defineHeroSchema>;
