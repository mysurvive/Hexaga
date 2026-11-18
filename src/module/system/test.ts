import { ActorHex } from "../actor/base/baseActor.ts";
import { ItemHex } from "../item/base/base.ts";
import { RollArgs, SkillTestRoll, TestRollContext, TestRoll, TempoRoll } from "./dice/roller.ts";
import { Modifier } from "./modifier/modifier.ts";
import { RollDialog } from "./rollDialog/rollDialog.ts";
import { SkillStatistic } from "./statistic/statistic.ts";

export class Test {
    declare target?;
    declare domains;
    declare rollOptions;
    declare skill;
    declare group;
    declare item;
    declare dv;
    declare roller;
    declare type;
    declare mmp;
    declare dealsDamage;
    declare against;

    constructor(context: TestContext) {
        this.roller = context.roller;
        this.target = context.target;
        this.domains = context.domains;
        this.rollOptions = context.rollOptions;
        this.skill = context.skill;
        this.group = context.group;
        this.item = context.item;
        this.dv = context.dv;
        this.type = context.type;
        this.mmp = context.mmp ?? 0;
        this.dealsDamage = context.dealsDamage ?? false;
        this.against = context.against;
    }

    getRollContext(): TestRollContext {
        const activeRollOptions = [...this.rollOptions];
        if (this.target && this.target.actor) {
            activeRollOptions.push(
                ...this.target.actor.getContextualSelfRollOptions("target"),
                ...this.roller.getContextualSelfRollOptions("origin"),
            );
        }

        const modifiers = this.skill
            ? this.skill.getModifierList(this.domains, activeRollOptions)
            : this.type === "tempo"
              ? this.roller.intrinsics.tempo.getModifierList(this.domains, activeRollOptions)
              : this.type === "resist" && this.group
                ? this.roller.resist[this.group].getModifierList()
                : [];

        if (this.mmp < 0) {
            modifiers.push(
                new Modifier({
                    label: "Multiple Maneuver Penalty",
                    slug: "mmp",
                    modifier: this.mmp,
                    domains: ["all"],
                    modifies: "flat",
                }),
            );
        }

        if (!this.dv && this.against && this.target) {
            this.dv = this.target.actor?.rv[this.against].total ?? 0;
        } else if (!this.dv) {
            this.dv = 0;
        }

        const testRollContext = {
            roller: this.roller,
            dv: this.dv,
            item: this.item,
            origin: { token: this.roller.token, actor: this.roller },
            target: this.target && this.target.actor ? { token: this.target, actor: this.target.actor } : null,
            modifiers: modifiers,
            dealsDamage: this.dealsDamage,
            rollType: this.type,
            against: this.against,
        };

        if (this.skill) {
            foundry.utils.setProperty(testRollContext, "skill", this.skill);
        }

        return testRollContext;
    }

    async roll(args: RollArgs = {}): Promise<TestRoll<TestRollContext> | undefined> {
        const label = this.skill ? this.skill.label : this.type;

        if (label) {
            args.title = args.title
                ? args.title
                : this.type === "attack"
                  ? `Attack: ${this.item?.name}`
                  : `Test: ${_loc(label)}`;

            const rollContext = this.getRollContext();

            const finalRollContext = args.skipDialog ? rollContext : await RollDialog.prompt(rollContext, args);

            if (!finalRollContext) return;

            const roll = await new ROLL_TYPE[this.type](finalRollContext, args).evaluate();
            if (args.createMessage !== false) await roll.toMessage();
            return roll;
        } else {
            console.error("Error creating Test instance");
            return;
        }
    }
}

const ROLL_TYPE: Record<string, new (context: TestRollContext, args: RollArgs) => TestRoll> = {
    test: SkillTestRoll,
    tempo: TempoRoll,
    resist: SkillTestRoll,
};

export interface TestContext {
    roller: ActorHex;
    dv?: number;
    item?: ItemHex;
    target?: TokenDocument;
    domains: string[];
    rollOptions: string[];
    skill?: SkillStatistic;
    group?: "physical" | "mental" | "personality";
    type: "attack" | "test" | "tempo" | "resist";
    mmp?: number;
    dealsDamage?: boolean;
    against?: "physical" | "mental" | "personality";
}
