export class Modifier extends foundry.abstract.DataModel<
    ModifierSchema,
    foundry.abstract.DataModel<ModifierSchema> | null
> {
    static override defineSchema(): ModifierSchema {
        return defineModifierSchema();
    }

    declare label: string;
    declare modifier: number;
    declare domains: string[];
    declare slug: string;
    declare type: string;
    declare path: string;

    protected override _initialize(options?: Record<string, unknown>) {
        super._initialize(options);

        this.label = this.label ?? this.slug;
        this.modifier = this.modifier;
        this.domains = this.domains;
        this.slug = this.slug;
        this.type = this.type;
        this.path = this.path;
    }
}

export interface ModifierSchema extends fields.DataSchema {
    slug: fields.StringField<{ required: true }>;
    label: fields.StringField<{ required: true }>;
    modifier: fields.NumberField<{ required: true }>;
    domains: fields.ArrayField<fields.StringField>;
    type: fields.StringField;
    path: fields.StringField;
}

const defineModifierSchema = () => {
    return {
        slug: new fields.StringField({ required: true }),
        label: new fields.StringField({ required: true }),
        modifier: new fields.NumberField({ required: true }),
        domains: new fields.ArrayField(new fields.StringField()),
        type: new fields.StringField(),
        path: new fields.StringField(),
    };
};
