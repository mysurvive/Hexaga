import { SvelteComponent } from "svelte";
import AspectTreeShell from "./components/AspectTreeShell.svelte";

export class AspectTreeSheet extends foundry.applications.sheets.ItemSheetV2 {
    private svelteComponent: SvelteComponent | null = null;
    private hookId: number | null = null;

    static override DEFAULT_OPTIONS = {
        classes: ["hexaga", "sheet", "aspect-tree"],
        tag: "form",
        window: { resizable: false },
        position: { width: 1100, height: 900 },
    };

    protected override async _renderHTML(_context: object, _options: object): Promise<HTMLElement> {
        return document.createElement("div");
    }

    protected override _replaceHTML(_result: HTMLElement, content: HTMLElement, _options: object): void {
        if (this.svelteComponent) {
            this.svelteComponent.$set({
                item: this.document,
            });
            return;
        }

        content.replaceChildren();

        this.svelteComponent = new AspectTreeShell({
            target: content,
            props: {
                isEditable: game.user.isGM,
                item: this.document,
            },
        });
    }

    protected override async _onRender(context: any, options: any): Promise<void> {
        await super._onRender(context, options);
        if (this.svelteComponent && this.document.actor) {
            this.svelteComponent.$set({ actor: this.document.actor });
        }

        if (this.hookId === null && this.document.actor) {
            this.hookId = Hooks.on("updateItem", (item: any, _changes: any, _options: any, _userId: string) => {
                if (item.parent?.id === this.document.actor?.id && this.svelteComponent) {
                    this.svelteComponent.$set({ actor: this.document.actor });
                }
            });
        }
    }

    protected override async _onClose(options: object): Promise<void> {
        if (this.svelteComponent) {
            this.svelteComponent.$destroy?.();
            this.svelteComponent = null;
        }
        if (this.hookId !== null) {
            Hooks.off("updateItem", this.hookId);
            this.hookId = null;
        }
        return super._onClose(options);
    }
}
