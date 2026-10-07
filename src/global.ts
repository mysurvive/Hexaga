import { HEXAGACONFIG } from "./config/index.ts";
import { ActorHex } from "./module/actor/base/baseActor.ts";
import { HeroData } from "./module/actor/hero/heroData.ts";
import { ItemHex } from "./module/item/base/base.ts";
import { HeritageData } from "./module/item/character-options/heritage/data.ts";

declare global {
    namespace globalThis {
        export import fields = foundry.data.fields;
        export import fu = foundry.utils;
    }

    interface CONFIG {
        hexaga: typeof HEXAGACONFIG;
    }

    interface AssumeHookRan {
        ready: true;
    }

    interface FlagConfig {
        Item: {
            hexaga: Record<string, any> | undefined;
        };
        Actor: {
            hexaga: Record<string, any> | undefined;
        };
    }
}

declare module "fvtt-types/configuration" {
    interface DocumentClassConfig {
        Actor: typeof ActorHex;
        Item: typeof ItemHex;
    }
    interface ConfiguredActor<SubType extends Actor.SubType> extends ActorHex<SubType> {
        document: ActorHex<SubType>;
    }
    interface ConfiguredItem<SubType extends Item.SubType> extends ItemHex<SubType> {
        document: ItemHex<SubType>;
    }
    interface DataModelConfig {
        Actor: {
            hero: typeof HeroData;
        };
        Item: {
            heritage: typeof HeritageData;
        };
    }
}
