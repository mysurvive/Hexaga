import { HitpointStatistic, ResistanceValueStatistic, SkillTraceData } from "../../system/statistic/statistic.ts";
import { ActorSynthetics } from "../synthetics.ts";

export class ActorHex<SubType extends Actor.SubType = Actor.SubType> extends Actor<SubType> {
    declare public synthetics: ActorSynthetics;
    declare skills: SkillStatisticRecord;
    declare rv: Record<string, ResistanceValueStatistic>;
    declare intrinsics: Record<string, any>;
    declare hp: HitpointStatistic;

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

    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();

        this.system.prepareAttributes();

        this.synthetics = { modifiers: {} };
    }

    // Incredibly simplified for the time being
    async modifyHealth(input: string | number): Promise<void> {
        const stringInput = String(input).trim();
        if (!stringInput) return;

        const regex = /([+-])\s*(\d+)/;
        const match = stringInput.match(regex);

        let finalHp = this.system.intrinsic.hp.current;

        if (match) {
            const sign = match[1];
            const amount = Number(match[2]);
            console.log(sign, amount);

            if (sign === "+") {
                finalHp += amount;
            } else {
                finalHp -= amount;
            }
        } else {
            const absoluteChange = Number(stringInput.replace(/[^\d.-]/g, ""));
            if (!isNaN(absoluteChange)) finalHp = absoluteChange;
        }
        finalHp = Math.clamp(finalHp, 0, this.hp.max);
        await this.update({ system: { intrinsic: { hp: { current: finalHp } } } });
    }
}

type SkillStatisticRecord = Record<string, SkillTraceData>;
