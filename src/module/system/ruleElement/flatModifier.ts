import { Modifier } from "../modifier/modifier.ts";
import { RuleElement } from "./base.ts";

export class FlatModifier extends RuleElement<FlatModifierSchema> {
    onPrepareDerivedData(): void {
        if (this.phase !== "derived") return;
        if (!this.actor) return;

        console.log("hit");

        for (const target of this.targets) {
            if (!target) continue;

            this.actor.synthetics.modifiers[target] ??= [];
            this.actor.synthetics.modifiers[target].push((rollOptions: string[] | undefined) => {
                if (!this.testPredicate(rollOptions)) return;
                return new Modifier({
                    slug: this.slug ?? this.parent.name.slugify(),
                    label: this.label ?? this.parent.name,
                    modifier: this.modifier ?? 0,
                    modifies: this.modifies ?? "dice",
                });
            });
        }
    }

    static override defineSchema() {
        return defineFlatModifierSchema();
    }
}

const defineFlatModifierSchema = () => {
    return {
        ...RuleElement.defineSchema(),
        // Targets are the list of domains that this rule targets
        targets: new fields.ArrayField(new fields.StringField(), { required: true, nullable: false, initial: [] }),
        phase: new fields.StringField({ required: false, nullable: true, choices: ["derived"], initial: "derived" }),
        modifier: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        modifies: new fields.StringField({
            required: true,
            nullable: false,
            initial: "dice",
            choices: ["dice", "flat"],
        }),
    };
};

export type FlatModifierSchema = ReturnType<typeof defineFlatModifierSchema>;

export interface FlatModifier {
    readonly key: "FlatModifier";
}
