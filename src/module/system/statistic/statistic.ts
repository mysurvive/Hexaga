// Every time I try to consider a better way to do this, it always ends up looking like a Statistic anyways
// The PF2e team just does it right. I don't have anything more to say.

import { TestContext } from "../test.ts";
import { ActorHex } from "../../actor/base/baseActor.ts";
import { Attributes } from "../../actor/types.ts";
import { ItemHex } from "../../item/base/base.ts";
import { Modifier } from "../modifier.ts";
import { Test } from "../test.ts";

// The base statistic class
abstract class BaseStatistic<TActor extends ActorHex> {
    declare protected actor: TActor;
    declare label?: string | null;
    declare domains: string[];
    declare slug: string;

    constructor(actor: TActor, data: { label?: string; slug: string }) {
        Object.defineProperty(this, "actor", {
            value: actor,
            enumerable: false,
            writable: true,
            configurable: true,
        });
        this.label = data.label ?? data.slug;
        this.slug = data.slug;
    }

    getModifierList(rollOptions?: string[]): Modifier[] {
        const deduplicatedModifiers: Modifier[] = [];

        for (const domain of this.domains) {
            const modifiers = this.actor.synthetics.modifiers[domain] ?? [];

            for (const modifier of modifiers) {
                const m = modifier(rollOptions);
                if (!m) continue;
                if (deduplicatedModifiers.some((mod) => mod.slug === m.slug)) {
                    continue;
                }

                deduplicatedModifiers.push(m);
            }
        }

        return deduplicatedModifiers;
    }

    getModifierValue(rollOptions?: string[]): number {
        const modifier = this.getModifierList(rollOptions).reduce((sum, modifier) => {
            return sum + modifier.modifier;
        }, 0);

        return modifier;
    }
}

// The child class that contains rollable data. HitPointStatistic and ResistanceValueStatistic
// don't have rollable data, so there needs to be an extra layer of abstraction
abstract class Statistic extends BaseStatistic<ActorHex> {}

export class SkillStatistic extends Statistic {
    declare rank: number;
    declare attribute: string;

    constructor(actor: ActorHex, data: { rank: number; slug: string; domains?: string[] }) {
        super(actor, data);

        const config = CONFIG.hexaga.skills[data.slug as keyof typeof CONFIG.hexaga.skills];
        this.domains = ["all", "skill", data.slug, ...(data.domains ?? [])];
        this.rank = data.rank;
        this.attribute = config.attribute;
        this.label = _loc(config.label);
    }

    get trained() {
        return this.rank !== 0;
    }

    get attributeRank() {
        return this.actor.system.attributes[this.attribute as keyof typeof this.actor.system.attributes]?.total;
    }

    get baseRank() {
        return this.trained ? this.attributeRank + this.rank : 1;
    }

    get total() {
        return this.baseRank + this.getModifierValue();
    }

    get breakdown() {
        const breakdownParts: string[] = [];
        if (this.trained) {
            breakdownParts.push(`+ ${this.rank} (${_loc(this.label as string)} Rank)`);
            breakdownParts.push(`+ ${this.attributeRank} (${_loc(`hexaga.attributes.${this.attribute}.label`)} Rank)`);
        } else {
            breakdownParts.push("Untrained");
        }

        for (const modifier of this.getModifierList()) {
            breakdownParts.push(`${modifier.modifier >= 0 ? "+" : ""} ${modifier.modifier} (${modifier.label})`);
        }
        return breakdownParts.join(", ");
    }

    getTraceData() {
        return {
            slug: this.slug,
            label: this.label,
            modifier: this.getModifierValue(),
            rank: this.rank,
            total: this.total,
            modifiers: this.getModifierList(),
            breakdown: this.breakdown,
            roll: this.roll.bind(this),
        };
    }

    async roll(options: Partial<TestContext> = {}) {
        const testContext: TestContext = {
            roller: this.actor,
            dv: options.dv,
            skill: this,
            rollOptions: [],
            domains: this.domains,
            type: "skill-test",
        };
        await new Test(testContext).roll();
    }
}

export class ResistanceValueStatistic extends BaseStatistic<ActorHex> {
    declare attributes: Array<keyof Attributes>;

    constructor(actor: ActorHex, data: { attributes: Array<keyof Attributes>; slug: string }) {
        super(actor, data);

        this.attributes = data.attributes;
        this.domains = ["all", "rv", data.slug];
    }

    get base() {
        const firstAttribute =
            this.actor.system.attributes[this.attributes[0] as keyof typeof this.actor.system.attributes].rank;
        const secondAttribute =
            this.actor.system.attributes[this.attributes[1] as keyof typeof this.actor.system.attributes].rank;
        return Math.floor((firstAttribute + secondAttribute) / 2);
    }

    get total() {
        return this.base + this.getModifierValue();
    }
}

export class HitpointStatistic extends BaseStatistic<ActorHex> {
    constructor(actor: ActorHex, data: { slug: string; label?: string }) {
        super(actor, data);

        this.domains = Array.from(new Set(["all", "max-hp", data.slug]));

        // Make sure HP is within bounds
        this.actor.system.updateSource({ intrinsic: { hp: { current: Math.clamp(this.current, 0, this.max) } } });
    }

    get base() {
        return 10 + this.actor.system.attributes.physique.total * this.actor.system.level;
    }

    get current() {
        return this.actor.system.intrinsic.hp.current;
    }

    get max() {
        return this.base + this.getModifierValue();
    }
}

export class AttackStatistic extends Statistic {
    declare type;
    declare weapon;
    declare skill;
    declare rollOptions;

    constructor(actor: ActorHex, data: AttackStatisticData) {
        super(actor, data);
        this.weapon = data.weapon;
        this.type = this.weapon.system.attackType;
        this.skill = this.actor.skills[this.weapon.system.attackSkill];
        const extraDomains = data.extraDomains ?? [];
        const extraRollOptions = data.extraRollOptions ?? [];
        this.domains = [
            `all`,
            `attack`,
            `${this.type}`,
            `${this.skill.slug}-attack`,
            `${this.skill.attribute}-attack`,
            `${this.weapon.slug}-attack`,
            `${this.weapon.id}-attack`,
            ...extraDomains,
        ];
        this.rollOptions = [
            "maneuver:attack",
            `${this.type}`,
            ...this.weapon.system.getRollOptions("item"),
            ...this.actor.getRollOptions(this.domains),
            ...extraRollOptions,
        ];
    }

    attack(context: AttackContext = {}) {
        const target = game.user.targets.first() ?? null;

        const rv =
            target instanceof foundry.canvas.placeables.Token && target.actor ? target.actor.rv.physical.total : 0;

        const testContext = {
            roller: this.actor,
            target: target instanceof foundry.canvas.placeables.Token ? target.document : undefined,
            item: this.weapon,
            domains: this.domains,
            rollOptions: this.rollOptions,
            skill: this.skill,
            type: "attack",
            dv: rv,
            mmp: context.mmp,
        };

        new Test(testContext).roll();
    }
    async damage() {}
}
interface AttackContext {
    mmp?: number;
}

type AttackStatisticData = AttackData & BaseStatisticData;

interface AttackData {
    weapon: ItemHex<"weapon">;
    extraDomains?: string[];
    extraRollOptions?: string[];
}

interface BaseStatisticData {
    slug: string;
    label?: string;
}

export type SkillTraceData = ReturnType<SkillStatistic["getTraceData"]>;
