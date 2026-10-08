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

    override prepareBaseData(): void {
        super.prepareBaseData();
    }

    override prepareEmbeddedDocuments(): void {
        super.prepareEmbeddedDocuments();

        this.synthetics = { modifiers: {} };

        const sourceItems = this.items ?? [];
        // Stores the breakdown of the data
        const attributeData: Record<
            string,
            { base: number; bonus: number; details: { value: number; label: string }[] }
        > = {};

        // Loop through items
        for (const item of sourceItems) {
            // Loop through item's rules
            for (const rule of item.system.rules) {
            }

            this.synthetics = { modifiers: {} };
        }
    }
}

type SkillStatisticRecord = Record<string, SkillTraceData>;
