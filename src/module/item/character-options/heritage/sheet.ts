import { ItemSheetHex } from "../../base/sheet.ts";
import { DeepPartial } from "fvtt-types/utils";
import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

export class HeritageSheet extends ItemSheetHex {
    static override DEFAULT_OPTIONS = {
        form: { handler: this.onSubmit },
    } as typeof ItemSheetHex.DEFAULT_OPTIONS;

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

    protected static override async onSubmit(
        this: ItemSheetHex,
        _event: Event,
        _form: HTMLFormElement,
        _formData: foundry.applications.ux.FormDataExtended,
    ): Promise<void> {
        await super.onSubmit(_event, _form, _formData);
        const attributeSelections = (_formData.object.attributes as string[]).filter((a) => a !== null);
        await this.item.update(
            {
                system: { improvements: { attributes: { selected: attributeSelections } } },
            },
            { render: false },
        );
        this.render({ parts: ["description"] });
    }

    protected override async _preparePartContext(
        partId: string,
        context: ItemSheetV2.RenderContext,
        options: DeepPartial<ItemSheetV2.RenderOptions> & {
            isFirstRender: boolean;
        },
    ): Promise<ItemSheetV2.RenderContext> {
        const partContext = await super._preparePartContext(partId, context, options);
        if (["foundational", "description"].includes(partId)) {
            fu.mergeObject(partContext, {
                improvements: this.item.system.improvements,
            });
        }
        return partContext;
    }
}
