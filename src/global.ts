declare global {
    namespace globalThis {
        export import fields = foundry.data.fields;
        export import fu = foundry.utils;
    }
}

declare module "fvtt-types/configuration" {
    interface DocumentClassConfig {}
    interface ConfiguredActor<SubType extends Actor.SubType> {}
    interface DataModelConfig {}
}
