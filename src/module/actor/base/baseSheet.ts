import { ActorHex } from "./baseActor.ts";
import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

const HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

import DragDrop = foundry.applications.ux.DragDrop;
import { DeepPartial } from "fvtt-types/utils";
import { ItemHex } from "../../item/base/base.ts";

export class ActorSheetHex extends HandlebarsApplicationMixin(ActorSheetV2)<
    ActorSheetV2.RenderContext,
    ActorSheetV2.Configuration,
    ActorSheetV2.RenderOptions
> {
    declare _dragDropHandlers: DragDrop[];

    constructor(options: SheetConstructorOptions) {
        super(options);
        this._dragDropHandlers = this._createDragDropHandlers();
    }

    protected _createDragDropHandlers(): DragDrop[] {
        return [
            new DragDrop({
                dragSelector: ".draggable",
                dropSelector: ".item-drop",
                permissions: {
                    dragstart: this._canDragStart.bind(this),
                    drop: this._canDragDrop.bind(this),
                },
                callbacks: {
                    dragstart: this._onDragStart.bind(this),
                    drop: this._onDrop.bind(this),
                },
            }),
        ];
    }

    protected override async _onRender(
        context: DeepPartial<ActorSheetV2.RenderContext>,
        options: DeepPartial<ActorSheetV2.RenderOptions>,
    ): Promise<void> {
        await super._onRender(context, options);

        for (const dragDrop of this._dragDropHandlers) {
            dragDrop.bind(this.element);
        }
    }

    protected override _canDragDrop(_selector: string): boolean {
        return this.isEditable;
    }

    protected override async _onDrop(event: DragEvent): Promise<void> {
        event.stopImmediatePropagation();
        const droppedDataString = event.dataTransfer?.getData("text/plain");
        try {
            if (!droppedDataString) throw new Error("No drop data received");

            const droppedData = JSON.parse(droppedDataString);
            const itemInstance = await fromUuid(droppedData.uuid);
            if (!itemInstance || !("toObject" in itemInstance)) {
                throw new Error("Unable to create the Item object");
            }

            const target = event.currentTarget as HTMLElement;
            const targetDataType = target.getAttribute("data-drop-type");
            if (targetDataType && "type" in itemInstance) {
                if (itemInstance.type === targetDataType || targetDataType === "gear") {
                    const data = itemInstance.toObject() as { name: string; type: Item.SubType };
                    if (!data || !data.type || !data.name) throw new Error("Invalid data on Item");

                    await this.actor.createEmbeddedDocuments("Item", [data]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    protected makeImprovementChoice(item: ItemHex, choices: string | string[]) {
        item.setFlag("hexaga", "selections", choices);
    }
}

type SheetConstructorOptions = {
    document: ActorHex;
};
