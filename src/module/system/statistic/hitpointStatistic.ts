import { BaseStatistic } from "./statistic.ts";
import { ActorHex } from "../../actor/base/baseActor.ts";
import { Modifier } from "../modifier/modifier.ts";

export class HitpointStatistic extends BaseStatistic<ActorHex> {
    declare modifiers;

    constructor(actor: ActorHex, data: { slug: string; label?: string; modifiers?: Modifier[] }) {
        super(actor, data);

        this.domains = Array.from(new Set(["max-hp", data.slug]));
        this.modifiers = data.modifiers ?? [];

        // Make sure HP is within bounds
        this.actor.system.updateSource({ intrinsic: { hp: { current: Math.clamp(this.current, 0, this.max) } } });
    }

    get current() {
        return this.actor.system.intrinsic.hp.current;
    }

    get max() {
        return this.modifiers.reduce((total, current) => {
            return total + current.modifier;
        }, 0);
    }

    get breakdown() {
        return this.modifiers.map((m) => `${m.label} +${m.modifier}`).join(", ");
    }
}
