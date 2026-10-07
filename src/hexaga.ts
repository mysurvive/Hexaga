import { HeroData } from "./module/actor/hero/heroData.ts";
import { ItemHex } from "./module/item/base/base.ts";
import { HeritageData } from "./module/item/character-options/heritage/data.ts";

import { registerHandlebarsHelpers } from "./scripts/register-handlebars-helpers.ts";
import { registerSheets } from "./scripts/register-sheets.ts";
import { registerTemplates } from "./scripts/register-templates.ts";
import "./styles/hexaga.scss";
import { HEXAGACONFIG } from "./config/index.ts";
import { ActorHex } from "./module/actor/base/baseActor.ts";

Hooks.on("init", () => {
    registerSheets();
    registerTemplates();
    registerHandlebarsHelpers();

    CONFIG.hexaga = HEXAGACONFIG;

    CONFIG.Actor.dataModels["hero"] = HeroData;
    CONFIG.Item.dataModels["heritage"] = HeritageData;

    CONFIG.Actor.documentClass = ActorHex;
    CONFIG.Item.documentClass = ItemHex;
});
