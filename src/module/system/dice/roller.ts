import { ActorHex } from "../../actor/base/baseActor.ts";
import { ItemHex } from "../../item/base/base.ts";
import { SkillStatistic } from "../statistic/statistic.ts";
import { Modifier } from "../modifier/modifier.ts";

export interface RollArgs {
    flavor?: string;
    traceData?: Array<{ label: string; value?: string | null; type: string }>;
    title?: string;
    skipDialog?: boolean;
    createMessage?: boolean;
    fromCombat?: boolean;
}

export interface TestRollContext {
    roller: ActorHex;
    modifiers: Modifier[];
    rollType: "attack" | "test" | "tempo" | "resist";
}

export interface SkillTestContext extends TestRollContext {
    dv: number;
    origin: { token: TokenDocument | null; actor: ActorHex };
    target?: { token: TokenDocument; actor: ActorHex } | null;
    skill: SkillStatistic;
    dealsDamage: boolean;
    item?: ItemHex;
    against: "physical" | "mental" | "personality";
    rollType: "test";
}

export interface TempoContext extends TestRollContext {
    rollType: "tempo";
}

export abstract class TestRoll<RollContext extends TestRollContext = TestRollContext> {
    declare roll: Roll;
    declare diceTiers: Record<string, number>;
    declare rawSuccesses: number;
    declare results: number[];

    constructor(
        public readonly context: RollContext,
        public readonly options: RollArgs,
    ) {}

    get successModifications() {
        return this.context.modifiers.reduce((total: number, current: Modifier) => {
            return current.modifies === "flat" ? (total += current.modifier) : total;
        }, 0);
    }

    get poolModifications() {
        return this.context.modifiers.reduce((total: number, current: Modifier) => {
            return current.modifies === "dice" ? (total += current.modifier) : total;
        }, 0);
    }

    get dicePool() {
        return Math.max(this.poolModifications, 0);
    }

    get successThreshold() {
        return 4;
    }

    async getRoll(): Promise<void> {
        try {
            if (this.dicePool === undefined || this.dicePool === null) throw Error("No dice pool found");
            const formula = `${this.dicePool}d6`;
            this.roll = await new Roll(formula).evaluate();

            this.results =
                this.roll.dice.flatMap((die) => {
                    {
                        return die.results.map((results) => {
                            return results.result;
                        });
                    }
                }) ?? ([] as number[]);

            const pushes = this.results.filter((r) => r === 6).length;
            const successes = this.results.filter((r) => r >= this.successThreshold).length;
            const failures = this.results.filter((r) => r < this.successThreshold).length;
            const pulls = this.results.filter((r) => r === 1).length;
            this.diceTiers = {
                pushes,
                successes,
                failures,
                pulls,
            };

            this.rawSuccesses = successes + 2 * pushes - pulls + this.successModifications;
        } catch (error) {
            ui.notifications.error("No dice pool found");
        }
    }

    abstract evaluate(): Promise<this>;

    abstract toMessage(): Promise<ChatMessage | null>;
}

export class SkillTestRoll extends TestRoll<SkillTestContext> {
    declare netSuccesses: number;
    declare pass: boolean;
    declare successLevel: number;

    override get successThreshold() {
        return this.context.skill?.trained ? 4 : 5;
    }

    get isCriticalFailure() {
        return this.netSuccesses <= -4;
    }

    override async evaluate(): Promise<this> {
        await this.getRoll();

        this.netSuccesses = this.rawSuccesses - (this.context.dv ?? 0);

        this.pass = this.netSuccesses >= 1;

        if (this.pass) {
            this.successLevel = 1 + Math.floor((this.netSuccesses - 1) / 4);
        } else {
            this.successLevel = 0;
        }

        return this;
    }

    override async toMessage() {
        const MESSAGE_TEMPLATE = "systems/hexaga/templates/chat/testRoll.hbs";

        const hasCriticalSuccess = this.pass && this.successLevel > 1;
        const criticalMultiplier = hasCriticalSuccess ? this.successLevel - 1 : 0;

        const chatData = {
            totalSuccesses: this.rawSuccesses,
            dv: this.context.dv,
            actorId: this.context.roller.id,
            itemId: this.context.item ? this.context.item.id : null,
            finalSuccesses: this.netSuccesses,
            formula: `${this.dicePool}d6`,
            passed: this.pass,
            title: this.options.title,
            flavor: this.options.flavor,
            modifierTrace: this.options.traceData,
            diceList: this.results,
            isCriticalFailure: this.isCriticalFailure,
            successLevel: this.successLevel,
            criticalMulitplier: criticalMultiplier,
            dealsDamage: this.context.dealsDamage,
        };

        const message = await ChatMessage.create({
            content: await foundry.applications.handlebars.renderTemplate(MESSAGE_TEMPLATE, chatData),
            speaker: ChatMessage.getSpeaker(),
            flags: {
                hexaga: {
                    rollContext: {
                        actorId: this.context.roller.id,
                        target: this.context.target,
                        itemId: this.context.item ? this.context.item.id : null,
                        successesAfterDV: this.netSuccesses,
                        successLevel: this.successLevel,
                        isCriticalFailure: this.isCriticalFailure,
                        pass: this.pass,
                        against: this.context.against,
                    },
                },
            },
        });
        if (message) {
            return message;
        } else {
            return null;
        }
    }
}

export class TempoRoll extends TestRoll<TempoContext> {
    override get dicePool() {
        const pool = Math.max(super.dicePool, 1);
        return this.context.roller.fading ? 0 : pool;
    }

    override async evaluate() {
        await this.getRoll();
        return this;
    }

    override async toMessage() {
        const MESSAGE_TEMPLATE = "systems/hexaga/templates/chat/tempoRoll.hbs";

        const chatData = {
            totalSuccesses: this.rawSuccesses,
            actorId: this.context.roller.id,
            formula: `${this.dicePool}d6`,
            title: this.options.title,
            flavor: this.options.flavor,
            modifierTrace: this.options.traceData,
            diceList: this.results,
        };

        const message = await ChatMessage.create({
            content: await foundry.applications.handlebars.renderTemplate(MESSAGE_TEMPLATE, chatData),
            speaker: ChatMessage.getSpeaker(),
            flags: {
                hexaga: {
                    rollContext: {
                        actorId: this.context.roller.id,
                    },
                },
                core: {
                    initiativeRoll: true,
                },
            },
        });
        if (message) {
            return message;
        } else {
            return null;
        }
    }
}

export interface DamageRollContext {
    roller: ActorHex;
    target: { token: TokenDocument; actor: ActorHex } | null;
    modifiers?: Modifier[];
    item?: ItemHex<"weapon">;
    skill?: SkillStatistic;
    rollType: "damage" | "healing";
    successLevel: number;
    against: "physical" | "mental" | "personality";
}

export interface ApplyDamageContext {
    rollType: "damage" | "healing";
    itemId: string;
    totalDamage: number;
    results: number[];
    against?: "physical" | "mental" | "personality";
}

export class DamageRoll {
    declare item;
    declare flatModifications;
    declare poolModifications;
    declare successLevel;
    declare title;
    declare rollType;
    declare against;

    public roll!: Roll;
    public results: number[] = [];

    constructor(context: DamageRollContext, args: RollArgs) {
        this.title = args.title ?? "Damage Roll";
        this.item = context.item;
        this.successLevel = context.successLevel;
        this.rollType = context.rollType ?? "damage";
        this.against = context.against;
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
                return `(${p.damagePool}d6${p.flatDamage && p.flatDamage > 0 ? `+${p.flatDamage}` : p.flatDamage && p.flatDamage < 0 ? `${p.flatDamage}` : ""})[${p.damageType}]`;
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
                        rollType: this.rollType,
                        type: "damage",
                        itemId: this.item?.id,
                        totalDamage: this.roll.total,
                        results: this.results,
                        against: this.against,
                    },
                },
            },
        });
    }
}
