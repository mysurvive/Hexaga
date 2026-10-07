import { ItemSheetHex } from "../../base/sheet.ts";
import { DeepPartial } from "fvtt-types/utils";
import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

export class HeritageSheet extends ItemSheetHex {
    static override PARTS = {
        ...super.PARTS,
        foundational: { template: "systems/hexaga/templates/items/foundational.hbs", id: "foundational" },
    };

    static override TABS = {
        primary: {
            tabs: [{ id: "description" }, { id: "foundational" }, { id: "config" }],
            labelPrefix: "hexaga.item.sheet.tabs",
            initial: "description",
        },
    };

    protected override async _preparePartContext(
        partId: string,
        context: ItemSheetV2.RenderContext,
        options: DeepPartial<ItemSheetV2.RenderOptions> & {
            isFirstRender: boolean;
        },
    ): Promise<ItemSheetV2.RenderContext> {
        const partContext = await super._preparePartContext(partId, context, options);
        if (partId === "foundational") {
            fu.mergeObject(partContext, {
                improvements: this.item.system.improvements,
            });
        }
        return partContext;
    }

    protected override async _onRender(
        context: DeepPartial<ItemSheetV2.RenderContext>,
        options: DeepPartial<ItemSheetV2.RenderOptions>,
    ): Promise<void> {
        super._onRender(context, options);
    }
}
