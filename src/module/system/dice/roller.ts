import { ActorHex } from "../../actor/base/baseActor.ts";
import { ItemHex } from "../../item/base/base.ts";
import { SkillStatistic } from "../statistic/statistic.ts";
import { Modifier } from "../modifier.ts";

export interface RollArgs {
    flavor?: string;
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
    dealsDamage: boolean;
    rollType: "attack" | "test";
}

export class TestRoll {
    declare dicePool: number;
    declare options: RollArgs;
    declare title: string;
    declare skill: SkillStatistic;
    declare dv: number;
    declare roller: ActorHex;
    declare item: ItemHex | undefined;
    declare dealsDamage: boolean;
    declare testType;
    declare flatSuccesses;

    public results: number[] = [];
    public rolledNetSuccesses = 0;
    public successesAfterMods = 0;
    public successesAfterDV = 0;
    public pass = false;
    public successLevel = 0;
    public isCriticalFailure = false;
    public diceSuccessCounts = {};

    constructor(context: TestRollContext, options: RollArgs) {
        this.skill = context.skill;
        this.dv = context.dv;

        this.title = options.title ?? "Roll";
        this.options = options;
        this.roller = context.roller;
        this.item = context.item;
        this.dealsDamage = context.dealsDamage;
        this.testType = context.rollType;

        const successModifications = context.modifiers.reduce((total: number, current: Modifier) => {
            return current.modifies === "flat" ? (total += current.modifier) : total;
        }, 0);
        const poolModifications = context.modifiers.reduce((total: number, current: Modifier) => {
            return current.modifies === "dice" ? (total += current.modifier) : total;
        }, 0);

        this.flatSuccesses = successModifications;
        this.dicePool = Math.max(poolModifications, 0);
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

        const pushes = this.results.filter((r) => r === 6).length;
        const successes = this.results.filter((r) => r >= successThreshold).length;
        const failures = this.results.filter((r) => r < successThreshold).length;
        const pulls = this.results.filter((r) => r === 1).length;
        this.diceSuccessCounts = {
            pushes,
            successes,
            failures,
            pulls,
        };

        this.rolledNetSuccesses = successes + 2 * pushes - pulls + this.flatSuccesses;
        this.successesAfterDV = this.rolledNetSuccesses - (this.dv ?? 0);

        this.pass = this.successesAfterDV >= 1;

        if (this.pass) {
            this.successLevel = 1 + Math.floor((this.successesAfterDV - 1) / 4);
            this.isCriticalFailure = false;
        } else {
            this.successLevel = 0;

            this.isCriticalFailure = this.successesAfterDV <= -4;
        }

        return this;
    }

    async toMessage() {
        const MESSAGE_TEMPLATE = "systems/hexaga/templates/chat/testRoll.hbs";

        const hasCriticalSuccess = this.pass && this.successLevel > 1;
        const criticalMultiplier = hasCriticalSuccess ? this.successLevel - 1 : 0;

        const chatData = {
            totalSuccesses: this.successesAfterMods,
            dv: this.dv,
            actorId: this.roller.id,
            itemId: this.item ? this.item.id : null,
            finalSuccesses: this.successesAfterDV,
            formula: `${this.dicePool}d6`,
            passed: this.pass,
            title: this.title,
            flavor: this.options.flavor,
            modifierTrace: this.options.traceData,
            diceList: this.results,
            isCriticalFailuer: this.isCriticalFailure,
            successLevel: this.successLevel,
            criticalMulitplier: criticalMultiplier,
            dealsDamage: this.dealsDamage,
        };

        return await ChatMessage.create({
            content: await foundry.applications.handlebars.renderTemplate(MESSAGE_TEMPLATE, chatData),
            speaker: ChatMessage.getSpeaker(),
            flags: {
                hexaga: {
                    rollContext: {
                        actorId: this.roller.id,
                        itemId: this.item ? this.item.id : null,
                        successesAfterDV: this.successesAfterDV,
                        successLevel: this.successLevel,
                        isCriticalFailure: this.isCriticalFailure,
                        pass: this.pass,
                    },
                },
            },
        });
    }
}

export interface DamageRollContext {
    roller: ActorHex;
    modifiers?: Modifier[];
    item?: ItemHex<"weapon">;
    skill?: SkillStatistic;
    rollType: "damage" | "healing";
    successLevel: number;
}

export class DamageRoll {
    declare item;
    declare flatModifications;
    declare poolModifications;
    declare successLevel;
    declare title;

    public roll!: Roll;
    public results: number[] = [];

    constructor(context: DamageRollContext, args: RollArgs) {
        this.title = args.title ?? "Damage Roll";
        this.item = context.item;
        this.successLevel = context.successLevel;
        if (context.modifiers) {
            this.flatModifications = context.modifiers.reduce((total: number, current: Modifier) => {
                return current.modifies === "flat" ? (total += current.modifier) : total;
            }, 0);
            this.poolModifications = context.modifiers.reduce((total: number, current: Modifier) => {
                return current.modifies === "dice" ? (total += current.modifier) : total;
            }, 0);
        }
    }

    async evaluate() {
        if (!this.item || !this.item.system.damagePool) return;
        const criticalSuccesses = this.successLevel > 1 ? this.successLevel - 1 : 0;
        const basePool = { ...this.item.system.damagePool.base };
        basePool.damagePool = basePool.damagePool + (this.poolModifications ?? 0) + 2 * criticalSuccesses;
        basePool.flatDamage = (basePool.flatDamage ?? 0) + (this.flatModifications ?? 0);
        const additionalPools = this.item.system.damagePool.additional.map((p) => ({ ...p }));
        const damagePools = [basePool, ...additionalPools];
        const formula = damagePools
            .map((p) => {
                return `(${p.damagePool}d6${p.flatDamage && p.flatDamage > 0 ? `+${p.flatDamage}` : ""})[${p.damageType}]`;
            })
            .join(" + ");

        this.roll = await new Roll(formula).evaluate();

        this.results =
            this.roll.dice.flatMap((die) => {
                {
                    return die.results.map((results) => {
                        return results.result;
                    });
                }
            }) ?? ([] as number[]);

        console.log(this.roll);
        return this;
    }

    async toMessage() {
        if (!this.roll) return;
        const speaker = ChatMessage.getSpeaker();

        const MESSAGE_TEMPLATE = "systems/hexaga/templates/chat/damageRoll.hbs";

        const chatData = {
            title: this.title,
            speaker: speaker,
            rolls: this.roll,
        };

        return await ChatMessage.create({
            content: await foundry.applications.handlebars.renderTemplate(MESSAGE_TEMPLATE, chatData),
            speaker: ChatMessage.getSpeaker(),
            flags: {
                hexaga: {
                    rollContext: {
                        type: "damageReceipt",
                        itemId: this.item?.id,
                        totalDamage: this.roll.total,
                        results: this.results,
                    },
                },
            },
        });
    }
}
