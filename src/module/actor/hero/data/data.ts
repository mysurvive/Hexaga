export class HeroData extends foundry.abstract.TypeDataModel<HeroModelSchema, Actor.Implementation> {
    static override defineSchema(): HeroModelSchema {
        return defineHeroSchema();
    }
}

const defineHeroSchema = () => {
    return {};
};

type HeroModelSchema = ReturnType<typeof defineHeroSchema>;
