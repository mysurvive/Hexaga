import { ItemHex } from "../../item/base/base.ts";
import { ApplyDamageContext } from "../../system/dice/roller.ts";
import { RulesEngine } from "../../system/ruleElement/rulesEngine.ts";
import { AttackStatistic, SkillStatistic } from "../../system/statistic/statistic.ts";
import { HitpointStatistic } from "../../system/statistic/hitpointStatistic.ts";
import { ValueSlugModel } from "../hero/heroData.ts";
import { ActorSynthetics } from "../synthetics.ts";
import { AnyRuleElement } from "../../system/ruleElement/types.ts";
import { ResistanceValueStatistic } from "../../system/statistic/resistanceValueStatistic.ts";
import { ResistStatistic } from "../../system/statistic/resistStatistic.ts";
import { AblationStatistic } from "../../system/statistic/ablationStatistic.ts";

export class ActorHex<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {
    declare public synthetics: ActorSynthetics;
    declare skills: SkillStatisticRecord;
    declare rv: Record<string, ResistanceValueStatistic>;
    declare resist: Record<string, ResistStatistic>;
    declare intrinsics: Record<string, any>;
    declare hp: HitpointStatistic;
    declare expertise: ValueSlugModel[];
    declare maneuvers: AttackStatistic[];
    declare wornArmor: { item: ItemHex<"armor"> | undefined; ablation: AblationStatistic | undefined };
    public fading: boolean = false;
    public rules: AnyRuleElement[] = [];

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

    protected override _onCreateDescendantDocuments(...args: Actor.OnCreateDescendantDocumentsArgs): void {
        super._onCreateDescendantDocuments(...args);

        // Delegate to the DataModel
        if (typeof this.system._onCreateDescendantDocuments === "function") {
            this.system._onCreateDescendantDocuments(...args);
        }
    }

    protected override async _onUpdateDescendantDocuments(
        ...args: Actor.OnUpdateDescendantDocumentsArgs
    ): Promise<void> {
        super._onUpdateDescendantDocuments(...args);

        // Delegate to the DataModel
        if (typeof this.system._onUpdateDescendantDocuments === "function") {
            await this.system._onUpdateDescendantDocuments(...args);
        }
    }

    protected override async _onDeleteDescendantDocuments(
        ...args: Actor.OnDeleteDescendantDocumentsArgs
    ): Promise<void> {
        super._onDeleteDescendantDocuments(...args);

        // Delegate to the DataModel
        if (typeof this.system._onDeleteDescendantDocuments === "function") {
            await this.system._onDeleteDescendantDocuments(...args);
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

        this.fading = this.hp.current === 0;

        const wornArmor = this.itemTypes.armor.filter((a) => a.system.equipped === true)[0];
        const ablation = new AblationStatistic(this, {
            item: wornArmor,
            slug: "armor-ablation",
            domains: [],
            type: "armor",
        });

        this.wornArmor = { item: wornArmor, ablation: ablation };

        this.system.rollOptions.all[`self:armored`] = this.wornArmor.item !== undefined;
        if (this.wornArmor.item !== undefined) {
            const armorOptions = this.wornArmor.item.system.getRollOptions();
            for (const option of armorOptions) {
                this.system.rollOptions.all[option] = true;
            }
        }
    }

    async applyDamage(context: ApplyDamageContext) {
        let totalDamage = context.totalDamage;
        let durabilityDamage = 0;

        if (context.rollType === "damage" && context.against === "physical") {
            if (!this.wornArmor.item) {
                totalDamage = -totalDamage;
            } else {
                durabilityDamage =
                    Math.max(
                        0,
                        totalDamage < (this.wornArmor.ablation?.total ?? 0)
                            ? totalDamage
                            : (this.wornArmor.ablation?.total ?? 0),
                    ) * -1;
                totalDamage -= durabilityDamage;
                totalDamage = totalDamage * -1;
                this.wornArmor.item.system.modifyDurability(durabilityDamage);
            }
        } else {
        }
        const chatFlavor = `${this.name}: ${totalDamage} hp. ${this.wornArmor ? `\n ${this.wornArmor.item?.name ?? "Unarmored"}: ${durabilityDamage} durability.` : ""}`;
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
