import { HeroSheet } from "../module/actor/hero/heroSheet.ts";
import { HeritageSheet } from "../module/item/character-options/heritage/sheet.ts";
const dsc = foundry.applications.apps.DocumentSheetConfig;

export function registerSheets(): void {
    dsc.registerSheet(Item, "hexaga", HeritageSheet, {
        label: "Heritage",
        types: ["heritage"],
        makeDefault: true,
    });

    dsc.registerSheet(Actor, "hexaga", HeroSheet, {
        label: "Hero",
        types: ["hero"],
        makeDefault: true,
    });
}
