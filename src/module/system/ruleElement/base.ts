import { ItemHex } from "../../item/base/base.ts";
import { Modifier } from "../modifier.ts";
import { RuleElementData } from "./data.ts";

export abstract class RuleElement {
    constructor(
        public item: ItemHex,
        public data: RuleElementData,
    ) {}

    get actor() {
        return this.item.actor;
    }

    abstract onPrepareDerivedData(): void;

    generateSynthetics(modifier: Modifier): void {
        if (!this.actor) return;
        for (const domain of this.data.domains) {
            if (!domain) continue;

            this.actor.synthetics.modifiers[domain] ??= [];
            this.actor.synthetics.modifiers[domain].push(modifier);
        }
    }
}
