import { Modifier } from "../modifier.ts";
import { RuleElement } from "./base.ts";

export class FlatModifier extends RuleElement<FlatModifierConfig> {
    override onPrepareDerivedData(): void {
        if (this.data.phase !== "derived") return;
        if (!this.actor) return;

        for (const domain of this.data.domains) {
            if (!domain) continue;

            this.actor.synthetics.modifiers[domain] ??= [];
            this.actor.synthetics.modifiers[domain].push((rollOptions: string[] | undefined) => {
                if (!this.testPredicate(rollOptions)) return;
                return new Modifier({
                    slug: this.data.slug ?? this.item.name.slugify(),
                    label: this.data.label ?? this.item.name,
                    modifier: this.data.config.value ?? 0,
                });
            });
        }
    }
}

export type FlatModifierConfig = {
    value: number;
    type?: string;
};
