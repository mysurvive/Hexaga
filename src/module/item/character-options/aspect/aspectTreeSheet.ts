import { SvelteComponent } from "svelte";
import AspectTreeShell from "./components/AspectTreeShell.svelte";
import { DeepPartial } from "fvtt-types/utils";

export class AspectTreeSheet extends foundry.applications.sheets.ItemSheetV2 {
    private svelteComponent: SvelteComponent | null = null;
    private hookId: number | null = null;
    private levelContext: number = 1;

    static override DEFAULT_OPTIONS = {
        classes: ["hexaga", "sheet", "aspect-tree"],
        tag: "form",
        window: { resizable: false },
        position: { width: 1100, height: 900 },
    };

    protected override async _renderHTML(_context: object, _options: object): Promise<HTMLElement> {
        return document.createElement("div");
    }

    protected override _replaceHTML(
        _result: HTMLElement,
        content: HTMLElement,
        _options: foundry.applications.api.ApplicationV2.RenderOptionsOf<this> & { levelContext: number },
    ): void {
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
                levelContext: this.levelContext,
            },
        });
    }

    override async _prepareContext(
        options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions> & {
            isFirstRender: boolean;
            levelContext?: number;
        },
    ): Promise<foundry.applications.api.ApplicationV2.RenderContextOf<this>> {
        const context = await super._prepareContext(options);
        this.levelContext = options.levelContext ?? 1;
        return context;
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
