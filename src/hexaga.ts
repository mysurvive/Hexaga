import { HeroData } from "./module/actor/hero/data/data.ts";
import { HeritageData } from "./module/item/heritage/data.ts";

import { registerHandlebarsHelpers } from "./scripts/register-handlebars-helpers.ts";
import { registerSheets } from "./scripts/register-sheets.ts";
import { registerTemplates } from "./scripts/register-templates.ts";
import "./styles/hexaga.scss";

Hooks.on("init", () => {
    registerSheets();
    registerTemplates();
    registerHandlebarsHelpers();

    Object.assign(CONFIG.Actor.dataModels, { hero: HeroData });

    Object.assign(CONFIG.Item.dataModels, { heritage: HeritageData });
});
