import { RuleElement } from "./base.ts";

export class Choice extends RuleElement<ChoiceSchema> {
    static override defineSchema() {
        return defineChoiceRuleElementSchema();
    }

    async onCreate(): Promise<void> {
        const selectOptions = await Promise.all(
            this.choices.map(async (c, index) => {
                const maybeObject =
                    typeof c.value === "string" && foundry.utils.parseUuid(c.value) !== null
                        ? await fromUuid(c.value)
                        : null;
                const label = c.label ? c.label : maybeObject !== null ? maybeObject.name : undefined;
                if (label !== null && label !== undefined) return { label: label, value: index.toString() };
                else return undefined;
            }),
        );

        const selectInput = foundry.applications.fields.createSelectInput({
            options: selectOptions.filter((c) => c !== undefined && c !== null),
            name: "choices",
        });

        const selectGroup = foundry.applications.fields.createFormGroup({
            input: selectInput,
            label: "Choices",
        });

        const dialogOptions = {
            window: { title: `${this.parent.name} Choices` },
            content: (this.prompt ?? "Make a choice.") + selectGroup.outerHTML,
            ok: {
                label: "Save",
                icon: "fa-solid fa-floppy-disk",
            },
        };

        const response = await foundry.applications.api.DialogV2.input(dialogOptions);

        if (!response) return;

        const flagName = this.flagName ?? this.slug;
        const choiceFromResponse = this.choices[Number(response.choices)];

        if (this.actor && this.actorFlag) {
            await this.actor.setFlag("hexaga", `choices.${flagName}`, choiceFromResponse.value);
        } else {
            await this.parent.setFlag("hexaga", `choices.${flagName}`, choiceFromResponse.value);
        }

        if (typeof choiceFromResponse.value === "string") {
            this.updateSource({ choice: choiceFromResponse.value });
        } else {
            this.updateSource({ choice: String(response.choices) });
        }
    }

    onPrepareDerivedData() {
        if (this.actor && this.prefix) {
            this.actor.system.rollOptions.all[`${this.prefix}:${this.choice}`] = true;
        }
    }

    async preDelete() {
        const flagName = this.flagName ?? this.slug;
        if (this.actor && this.actorFlag) {
            await this.actor.unsetFlag("hexaga", `choices.${flagName}`);
        }
    }
}

const defineChoiceRuleElementSchema = () => {
    return {
        ...RuleElement.defineSchema(),
        choices: new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField({ required: false, nullable: true }),
                value: new fields.AnyField({ required: true }),
            }),
            { required: true, nullable: false, initial: [] },
        ),
        prefix: new fields.StringField(),
        prompt: new fields.StringField(),
        actorFlag: new fields.BooleanField({ required: true, initial: false }),
        flagName: new fields.StringField(),
        choice: new fields.StringField(),
    };
};

export type ChoiceSchema = ReturnType<typeof defineChoiceRuleElementSchema>;

export interface Choice {
    key: "Choice";
    choices: Array<{ label: string | undefined | null; value: Record<string, unknown> | string | number }>;
}
