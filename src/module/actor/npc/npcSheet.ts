import { SvelteComponent } from "svelte";
import NPCShell from "./components/NPCShell.svelte";
export class NPCSheet extends foundry.applications.sheets.ActorSheetV2 {
    private svelteComponent: SvelteComponent | null = null;

    public activeTab: string = "character";

    static override DEFAULT_OPTIONS = {
        classes: ["hexaga", "sheet", "npc"],
        tag: "form",
        window: { resizable: true },
        position: { width: 800, height: 800 },
    };

    protected override async _renderHTML(_context: object, _options: object): Promise<HTMLElement> {
        return document.createElement("div");
    }

    protected override _replaceHTML(_result: HTMLElement, content: HTMLElement, _options: object): void {
        if (this.svelteComponent) {
            this.svelteComponent.$set({
                actor: this.document,
            });
            return;
        }

        content.replaceChildren();

        this.svelteComponent = new NPCShell({
            target: content,
            props: {
                actor: this.document,
                sheetData: this,
            },
        });
    }

    protected override async _onDropItem(
        event: DragEvent,
        data: Item.Implementation,
    ): Promise<Item.Implementation | null> {
        if (!this.actor.isOwner) return Promise.reject("You can only drop items on an owned sheet.");
        if (data.uuid === undefined || data.uuid === null) return Promise.reject("Invalid UUID");

        const cleanData = { ...data, uuid: data.uuid };
        const item = await Item.fromDropData(cleanData);
        if (!item) return super._onDropItem(event, data);

        return super._onDropItem(event, data);
    }

    protected override async _onClose(options: object): Promise<void> {
        if (this.svelteComponent) {
            this.svelteComponent.$destroy?.();
            this.svelteComponent = null;
        }
        return super._onClose(options);
    }
}
