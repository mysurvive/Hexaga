import { SvelteComponent } from "svelte";
import RollDialogShell from "./components/RollDialogShell.svelte";
import { TestRollArgs, TestRollContext } from "../dice/roller.ts";

export class RollDialog extends foundry.applications.api.ApplicationV2 {
    private svelteComponent: SvelteComponent | null = null;
    private resolvePromise: ((value: TestRollContext | null) => void) | null = null;
    declare context;

    constructor(context: TestRollContext, args: TestRollArgs, resolve: (value: TestRollContext | null) => void) {
        super({ window: { title: args.title } });
        this.context = context;
        this.resolvePromise = resolve;
    }

    static override DEFAULT_OPTIONS = {
        classes: ["hexaga", "dialog"],
        tag: "div",
        window: { resizable: true },
        position: { width: 600, height: 400 },
    };

    static prompt(context: TestRollContext, args: TestRollArgs): Promise<TestRollContext | null> {
        return new Promise((resolve) => {
            const dialog = new RollDialog(context, args, resolve);
            dialog.render(true);
        });
    }

    protected override async _renderHTML(_context: object, _options: object): Promise<HTMLElement> {
        return document.createElement("div");
    }

    protected override _replaceHTML(_result: HTMLElement, content: HTMLElement, _options: object): void {
        if (this.svelteComponent) {
            this.svelteComponent.$set({
                actor: this.context.roller,
                modifiers: this.context.modifiers,
            });
            return;
        }
        content.replaceChildren();
        {
            this.svelteComponent = new RollDialogShell({
                target: content,
                props: {
                    actor: this.context.roller,
                    modifiers: this.context.modifiers,
                    skill: this.context.skill,
                    item: this.context.item ?? undefined,
                    onConfirm: (finalContext: TestRollContext) => this.submitRoll(finalContext),
                },
            });
        }
    }

    public submitRoll(finalContext: TestRollContext) {
        if (this.resolvePromise) {
            this.context.modifiers = finalContext.modifiers ?? this.context.modifiers;

            this.resolvePromise(this.context);
            this.resolvePromise = null;
        }
        this.close();
    }

    protected override async _onClose(options: object): Promise<void> {
        if (this.resolvePromise) {
            this.resolvePromise(null);
            this.resolvePromise = null;
        }
        if (this.svelteComponent) {
            this.svelteComponent.$destroy?.();
            this.svelteComponent = null;
        }
        return super._onClose(options);
    }
}
