import { ActorHex } from "../actor/base/baseActor.ts";
import { ItemHex } from "../item/base/base.ts";
import { TestRollArgs, TestRoll, TestRollContext } from "./dice/roller.ts";
import { Modifier } from "./modifier.ts";
import { RollDialog } from "./rollDialog/rollDialog.ts";
import { SkillStatistic } from "./statistic/statistic.ts";

export class Test {
    declare target?;
    declare domains;
    declare rollOptions;
    declare skill;
    declare item;
    declare dv;
    declare roller;
    declare type;
    declare mmp;

    constructor(context: TestContext) {
        this.roller = context.roller;
        this.target = context.target;
        this.domains = context.domains;
        this.rollOptions = context.rollOptions;
        this.skill = context.skill;
        this.item = context.item;
        this.dv = context.dv ?? 0;
        this.type = context.type;
        this.mmp = context.mmp ?? 0;
    }

    getRollContext(): TestRollContext {
        const activeRollOptions = [...this.rollOptions];
        if (this.target && this.target.actor) {
            activeRollOptions.push(
                ...this.target.actor.getContextualSelfRollOptions("target"),
                ...this.roller.getContextualSelfRollOptions("origin"),
            );
        }

        console.log(this.domains);
        const modifiers = Object.entries(this.roller.synthetics.modifiers).flatMap(([domain, modifiers]) =>
            this.domains.includes(domain)
                ? modifiers.map((m) => m(activeRollOptions)).filter((m) => m !== undefined)
                : [],
        );
        if (this.mmp < 0) {
            modifiers.push(
                new Modifier({ label: "Multiple Maneuver Penalty", slug: "mmp", modifier: this.mmp, domains: ["all"] }),
            );
        }

        return {
            roller: this.roller,
            dv: this.dv,
            item: this.item,
            origin: { token: this.roller.token, actor: this.roller },
            target: this.target && this.target.actor ? { token: this.target, actor: this.target.actor } : null,
            skill: this.skill,
            modifiers: modifiers,
        };
    }

    async roll(args: TestRollArgs = {}) {
        args.title = args.title
            ? args.title
            : this.type === "attack"
              ? `Attack: ${this.item?.name}`
              : `Test: ${_loc(this.skill.label as string)}`;

        const rollContext = this.getRollContext();

        const finalRollContext = await RollDialog.prompt(rollContext, args);

        if (!finalRollContext) return;
        console.log(finalRollContext);

        const roll = await new TestRoll(finalRollContext, args).evaluate();
        await roll.toMessage();
    }
}

export interface TestContext {
    roller: ActorHex;
    dv?: number;
    item?: ItemHex;
    target?: TokenDocument;
    domains: string[];
    rollOptions: string[];
    skill: SkillStatistic;
    type: string;
    mmp?: number;
}
