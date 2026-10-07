export class StatisticData extends foundry.abstract.DataModel<StatisticSchema> {
    static override defineSchema(): StatisticSchema {
        return defineStatisticSchema();
    }
}

const defineStatisticSchema = () => {
    return { rank: new fields.NumberField({ required: true, nullable: false, initial: 0 }) };
};

type StatisticSchema = ReturnType<typeof defineStatisticSchema>;
