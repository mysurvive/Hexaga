import { SvelteComponent } from "svelte";
import HeroShell from "./components/HeroShell.svelte";
import { ItemHex } from "../../item/base/base.ts";
import { DeepPartial } from "fvtt-types/utils";

export class HeroSheet extends foundry.applications.sheets.ActorSheetV2 {
    private svelteComponent: SvelteComponent | null = null;
    public allAspectItems: Record<string, (ItemHex<"aspect"> | ItemHex<"aspectNode">)[]> = {};

    public activeTab: string = "character";
    public currentLevelContext: number = this.document.system.level;

    static override DEFAULT_OPTIONS = {
        classes: ["hexaga", "sheet", "actor"],
        tag: "form",
        window: { resizable: true },
        position: { width: 1100, height: 900 },
    };

    override async _prepareContext(
        options: DeepPartial<foundry.applications.sheets.ActorSheetV2.RenderOptions> & { isFirstRender: boolean },
    ): Promise<foundry.applications.api.ApplicationV2.RenderContextOf<this>> {
        const context = super._prepareContext(options);

        this.allAspectItems = Object.fromEntries(
            Object.entries(this.document.system.improvements.aspects)
                .map(([key, value]) => {
                    return [key, value.map((v) => fromUuidSync(v)).filter((v) => v !== undefined && v !== null)];
                })
                .filter((e) => e !== undefined && e !== null),
        );

        return context;
    }

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

        if (item.type === "aspect" || item.type === "aspectNode") {
            if (this.activeTab !== "aspects") {
                ui.notifications.warn("Use the Aspects tab to manage aspects.");
                return null;
            }
            const itemData = item.toObject();

            if (
                this.currentLevelContext === 1 &&
                (!this.document.system.improvements.aspects.creation ||
                    this.document.system.improvements.aspects.creation?.length === 0)
            ) {
                foundry.utils.setProperty(itemData, "flags.hexaga.grantedBy", "creation");
            } else {
                foundry.utils.setProperty(itemData, "system.level.taken", this.currentLevelContext);
            }

            const returnItem = await Item.create(itemData, { parent: this.actor, render: true });

            return returnItem ?? null;
        }

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
