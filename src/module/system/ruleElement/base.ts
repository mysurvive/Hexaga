import { ItemHex } from "../../item/base/base.ts";
import { Predicate } from "../predicate/predicate.ts";
import { RuleElementData } from "./data.ts";
import { FlatModifierConfig } from "./flatModifier.ts";

export abstract class RuleElement<TConfig extends RuleElementConfig = RuleElementConfig> {
    constructor(
        public item: ItemHex,
        public data: RuleElementData & { config: TConfig },
    ) {}

    get actor() {
        return this.item.actor;
    }

    abstract onPrepareDerivedData(): void;

    testPredicate(rollOptions?: string[]): boolean {
        if (!this.actor) return false;

        const options = [...(rollOptions ?? []), ...this.actor.getRollOptions()];

        return Predicate.test(this.data.predicate, options);
    }
}

type RuleElementConfig = FlatModifierConfig;
