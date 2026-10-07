import { Modifier } from "../modifier.ts";
import { RuleElement } from "./base.ts";

export class FlatModifier extends RuleElement {
    override onPrepareDerivedData(): void {
        if (this.data.phase !== "derived") return;
        if (!this.actor) return;

        const modifier = new Modifier({
            slug: this.data.slug ?? this.item.name.slugify(),
            label: this.data.label ?? this.item.name,
            modifier: this.data.value ?? 0,
        });

        this.generateSynthetics(modifier);
    }
}
