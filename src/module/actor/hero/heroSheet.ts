import { SvelteComponent } from "svelte";
import HeroShell from "./components/HeroShell.svelte";

export class HeroSheet extends foundry.applications.sheets.ActorSheetV2 {
    private svelteComponent: SvelteComponent | null = null;

    static override DEFAULT_OPTIONS = {
        classes: ["hexaga", "sheet", "actor"],
        tag: "form",
        window: { resizable: false },
        position: { width: 900, height: 900 },
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

        this.svelteComponent = new HeroShell({
            target: content,
            props: {
                actor: this.document,
            },
        });
    }

    protected override async _onClose(options: object): Promise<void> {
        if (this.svelteComponent) {
            this.svelteComponent.$destroy?.();
            this.svelteComponent = null;
        }
        return super._onClose(options);
    }
}
