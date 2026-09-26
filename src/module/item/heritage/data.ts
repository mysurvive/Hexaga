export class HeritageData extends foundry.abstract.TypeDataModel<HeritageModelSchema, Item.Implementation> {
    static override defineSchema(): HeritageModelSchema {
        return defineHeritageSchema();
    }
}

const defineHeritageSchema = () => {
    return {
        name: new fields.StringField({ required: true, nullable: false }),
        attribute: new fields.SchemaField({
            value: new fields.ArrayField(new fields.StringField()),
            selected: new fields.StringField(),
        }),
    };
};

type HeritageModelSchema = ReturnType<typeof defineHeritageSchema>;
