import { HeroSheet } from "../module/actor/hero/HeroSheet.ts";
import { ItemSheetHex } from "../module/item/base/sheet.ts";
import { AspectTreeSheet } from "../module/item/character-options/aspect/aspectTreeSheet.ts";
import { BASIC_ITEMS } from "../module/item/itemConfig.ts";
const dsc = foundry.applications.apps.DocumentSheetConfig;

export function registerSheets(): void {
    dsc.registerSheet(Item, "hexaga", ItemSheetHex, {
        label: "ItemHex",
        types: BASIC_ITEMS,
        makeDefault: true,
    });

    dsc.registerSheet(Item, "hexaga", AspectTreeSheet, {
        label: "Aspect",
        types: ["aspect"],
        makeDefault: true,
    });

    dsc.registerSheet(Actor, "hexaga", HeroSheet, {
        label: "Hero",
        types: ["hero"],
        makeDefault: true,
    });
}
