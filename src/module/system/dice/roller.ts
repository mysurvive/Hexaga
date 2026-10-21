import { ActorHex } from "../../actor/base/baseActor.ts";
import { ItemHex } from "../../item/base/base.ts";
import { SkillStatistic } from "../statistic/statistic.ts";
import { Modifier } from "../modifier.ts";

export interface TestRollArgs {
    flavor?: string;
    difficultyValue?: number;
    isTempo?: boolean;
    traceData?: Array<{ label: string; value?: string | null; type: string }>;
    title?: string;
}

export interface TestRollContext {
    roller: ActorHex;
    dv: number;
    item?: ItemHex;
    origin: { token: TokenDocument | null; actor: ActorHex };
    target?: { token: TokenDocument; actor: ActorHex } | null;
    skill: SkillStatistic;
    modifiers: Modifier[];
}

export class TestRoll {
    declare dicePool: number;
    declare options: TestRollArgs;
    declare title: string;
    declare skill: SkillStatistic;
    declare dv: number;
    public results: number[] = [];

    public pushes = 0;
    public successes = 0;
    public failures = 0;
    public pulls = 0;
    public rolledNetSuccesses = 0;
    public successesAfterMods = 0;
    public successesAfterDV = 0;
    public pass = false;

    constructor(context: TestRollContext, options: TestRollArgs) {
        this.skill = context.skill;
        this.dv = context.dv;
        this.dicePool = Math.max(this.skill.total, 0);
        this.title = options.title ?? "Roll";
        this.options = options;
    }

    async evaluate(): Promise<this> {
        const formula = `${this.dicePool}d6`;
        const roll = await new Roll(formula).evaluate();

        this.results =
            roll.dice.flatMap((die) => {
                {
                    return die.results.map((results) => {
                        return results.result;
                    });
                }
            }) ?? ([] as number[]);

        const successThreshold = this.skill.trained ? 4 : 5;

        this.pushes = this.results.filter((r) => r === 6).length;
        this.successes = this.results.filter((r) => r >= successThreshold).length;
        this.failures = this.results.filter((r) => r < successThreshold).length;
        this.pulls = this.results.filter((r) => r === 1).length;

        this.rolledNetSuccesses = this.successes + this.pushes - this.pulls;
        this.successesAfterMods = this.rolledNetSuccesses;
        this.successesAfterDV = this.successesAfterMods - (this.dv ?? 0);

        if (this.successesAfterDV >= 1) {
            this.pass = true;
        }

        return this;
    }

    async toMessage() {
        const MESSAGE_TEMPLATE = "systems/hexaga/templates/chat/test/testRoll.hbs";

        const chatData = {
            totalSuccesses: this.successesAfterMods,
            dv: this.dv,
            finalSuccesses: this.successesAfterDV,
            formula: `${this.dicePool}d6`,
            passed: this.pass,
            title: this.title,
            flavor: this.options.flavor,
            modifierTrace: this.options.traceData,
            diceList: this.results,
        };

        return ChatMessage.create({
            content: await foundry.applications.handlebars.renderTemplate(MESSAGE_TEMPLATE, chatData),
            speaker: ChatMessage.getSpeaker(),
        });
    }
}
