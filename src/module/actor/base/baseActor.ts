import { ItemHex } from "../../item/base/base.ts";
import { ApplyDamageContext } from "../../system/dice/roller.ts";
import { RuleElement } from "../../system/ruleElement/base.ts";
import { RulesEngine } from "../../system/ruleElement/rulesEngine.ts";
import {
    AttackStatistic,
    HitpointStatistic,
    ResistanceValueStatistic,
    SkillStatistic,
} from "../../system/statistic/statistic.ts";
import { ActorSynthetics } from "../synthetics.ts";
import type { AspectData } from "../../item/character-options/aspect/aspectData.ts";

export class ActorHex<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {
    declare public synthetics: ActorSynthetics;
    declare skills: SkillStatisticRecord;
    declare rv: Record<string, ResistanceValueStatistic>;
    declare intrinsics: Record<string, any>;
    declare hp: HitpointStatistic;
    declare expertise: Record<string, string>[];
    declare maneuvers: AttackStatistic[];
    public wornArmor: ItemHex<"armor"> | undefined = undefined;
    public rules: RuleElement[] = [];

    protected override async _preCreate(
        data: Actor.CreateData,
        options: Actor.Database.PreCreateOptions,
        user: User.Stored,
    ): Promise<boolean | void> {
        if ((await super._preCreate(data, options, user)) === false) return false;

        if (this.type === "hero") {
            this.updateSource({
                prototypeToken: {
                    actorLink: true,
                    sight: { enabled: true },
                    disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
                },
            });
        }
    }

    protected override _onUpdateDescendantDocuments(...args: Actor.OnUpdateDescendantDocumentsArgs): void {
        super._onUpdateDescendantDocuments(...args);
        const [_parent, collection, documents] = args;
        if (collection !== "items") return;

        const improvements = foundry.utils.deepClone(this.system.improvements ?? []);
        let changed = false;

        for (const document of documents) {
            const selections = document.getFlag("hexaga", "selections") ?? {};
            const attributes = Array.isArray(selections.attributes) ? selections.attributes : [];
            const skills = Array.isArray(selections.skills) ? selections.skills : [];
            const expertise = Array.isArray(selections.expertise) ? selections.expertise : [];
            const aspects = Array.isArray(document.system?.improvements?.aspects)
                ? document.system.improvements.aspects
                : document.system?.improvements?.aspects
                  ? [document.system.improvements.aspects]
                  : [];
            if (document.type === "heritage") {
                const heritageImprovements = improvements.find((i) => i.source === "heritage");
                if (heritageImprovements) {
                    heritageImprovements.attributes = attributes;
                    heritageImprovements.skills = skills;
                    heritageImprovements.expertise = expertise;
                    if (!Array.isArray(heritageImprovements.aspects)) {
                        heritageImprovements.aspects = [];
                    }
                    for (const aspect of aspects) {
                        if (!heritageImprovements.aspects.includes(aspect)) {
                            heritageImprovements.aspects.push(aspect);
                        }
                    }
                } else {
                    improvements.push({ source: document.type, attributes, skills, expertise, aspects: [...aspects] });
                }
                changed = true;
            }

            if (document.type === "profession") {
                const professionImprovements = improvements.find((i) => i.source === "profession");
                if (professionImprovements) {
                    professionImprovements.attributes = attributes;
                    professionImprovements.skills = skills;
                    professionImprovements.expertise = expertise;
                    if (!Array.isArray(professionImprovements.aspects)) {
                        professionImprovements.aspects = [];
                    }
                    for (const aspect of aspects) {
                        if (!professionImprovements.aspects.includes(aspect)) {
                            professionImprovements.aspects.push(aspect);
                        }
                    }
                } else {
                    improvements.push({ source: document.type, attributes, skills, expertise, aspects: [...aspects] });
                }
                changed = true;
            }
        }

        if (changed) {
            this.update({ system: { improvements: improvements } });
        }
    }

    protected override _onDeleteDescendantDocuments(
        parent: any,
        collection: any,
        documents: any[],
        ids: any[],
        options: any,
        userId: any,
    ): void {
        super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);

        if (collection !== "items" || !documents || !documents.length) return;

        const itemsToDeleteIds: string[] = [];

        const deletedItems = documents as unknown as Item[];

        for (const item of deletedItems) {
            if (item && item.type === "aspect") {
                const aspectModel = item.system as unknown as AspectData;
                const aspectSlug = aspectModel.slug;
                if (!aspectSlug) continue;

                for (const ownedItem of this.items) {
                    if (ownedItem.type === "aspectNode") {
                        const nodeAspectSlug = (ownedItem.system as any).aspectSlug;

                        if (nodeAspectSlug === aspectSlug) {
                            itemsToDeleteIds.push(ownedItem.id!);
                        }
                    }
                }
            }

            if ((item && item.type === "heritage") || item.type === "profession") {
                const index = this.system.improvements.findIndex((i) => i.source === item.type);
                this.system.improvements.splice(index, 1);
            }
        }

        if (itemsToDeleteIds.length > 0) {
            void this.deleteEmbeddedDocuments("Item", itemsToDeleteIds);
        }
    }

    // We don't use Active Effects, make it not happen.
    override applyActiveEffects(_phase?: unknown): void {}

    override prepareBaseData(): void {
        super.prepareBaseData();
        this.system.rollOptions = { all: { [`self:type:${this.type}`]: true } };
    }

    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();

        this.synthetics = { modifiers: {} };
        this.rules = [];

        this.prepareActorItemData();

        for (const item of this.items) {
            const rules = RulesEngine.initialize(item);
            this.rules.push(...rules);
        }
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        this.wornArmor = this.itemTypes.armor.filter((a) => a.system.equipped === true)[0];
        this.system.rollOptions.all[`self:armored`] = this.wornArmor !== undefined;
        if (this.wornArmor !== undefined) {
            const armorOptions = this.wornArmor.system.getRollOptions();
            for (const option of armorOptions) {
                this.system.rollOptions.all[option] = true;
            }
        }
    }

    async applyDamage(context: ApplyDamageContext) {
        let totalDamage = context.totalDamage;
        let durabilityDamage = 0;

        if (context.rollType === "damage" && context.against === "physical") {
            if (!this.wornArmor) {
                totalDamage = -totalDamage;
            } else {
                durabilityDamage =
                    Math.max(
                        0,
                        totalDamage < this.wornArmor.system.ablation ? totalDamage : this.wornArmor.system.ablation,
                    ) * -1;
                totalDamage -= durabilityDamage;
                totalDamage = totalDamage * -1;
                this.wornArmor.system.modifyDurability(durabilityDamage);
            }
        } else {
        }
        const chatFlavor = `${this.name}: ${totalDamage} hp. ${this.wornArmor ? `\n ${this.wornArmor.name}: ${durabilityDamage} durability.` : ""}`;
        await ChatMessage.create({ flavor: chatFlavor });
        await this.modifyHealth(totalDamage);
    }

    // Incredibly simplified for the time being
    async modifyHealth(input: string | number): Promise<void> {
        let finalHp = this.system.intrinsic.hp.current;
        if (typeof input === "number") {
            finalHp += input;
        } else {
            const stringInput = String(input).trim();
            if (!stringInput) return;

            const regex = /([+-])\s*(\d+)/;
            const match = stringInput.match(regex);

            if (match) {
                const sign = match[1];
                const amount = Number(match[2]);

                if (sign === "+") {
                    finalHp += amount;
                } else {
                    finalHp -= amount;
                }
            } else {
                const absoluteChange = Number(stringInput.replace(/[^\d.-]/g, ""));
                if (!isNaN(absoluteChange)) finalHp = absoluteChange;
            }
        }
        finalHp = Math.clamp(finalHp, 0, this.hp.max);
        if (finalHp === this.system.intrinsic.hp.current) return;
        await this.update({ system: { intrinsic: { hp: { current: finalHp } } } });
    }

    prepareActorItemData() {
        for (const item of this.items) {
            item.system.prepareActorData?.();
        }
    }

    getRollOptions(domains: string[] = []): string[] {
        const rollOptions: string[] = [];
        for (const domain of ["all", ...domains]) {
            const actorRollOptions = this.system.rollOptions[domain] ?? {};
            for (const option of Object.keys(actorRollOptions)) {
                if (option) rollOptions.push(option);
            }
        }
        return rollOptions;
    }

    getContextualSelfRollOptions(prefix: string = "self"): string[] {
        const rollOptions = Object.keys(this.system.rollOptions.all).flatMap((option) =>
            option.startsWith("self:") ? option.replace(/^self/, prefix) : [],
        );
        return rollOptions;
    }
}

type SkillStatisticRecord = Record<string, SkillStatistic>;
