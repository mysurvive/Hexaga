import { DeepPartial } from "fvtt-types/utils";
import { RuleElementData, RuleElementDataConstructor } from "../../system/ruleElement/data.ts";
import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

const HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export class ItemSheetHex extends HandlebarsApplicationMixin(ItemSheetV2)<
    ItemSheetV2.RenderContext,
    ItemSheetV2.Configuration,
    ItemSheetV2.RenderOptions
> {
    declare activeTab: typeof this.tabGroups;
    static override DEFAULT_OPTIONS = {
        window: { resizable: true },
        position: { width: 600, height: 400 },
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
            handler: this.onSubmit,
        },
        actions: {
            addRuleElement: ItemSheetHex.addRuleElement,
            removeRuleElement: ItemSheetHex.removeRuleElement,
        },
    };

    static override PARTS = {
        tabs: { template: "systems/hexaga/templates/items/tabs.hbs" },
        description: { template: "systems/hexaga/templates/items/description.hbs", id: "description" },
        config: { template: "systems/hexaga/templates/items/config.hbs", id: "config" },
    };

    static override TABS = {
        primary: {
            tabs: [{ id: "description" }, { id: "config" }],
            labelPrefix: "hexaga.item.sheet.tabs",
            initial: "description",
        },
    };

    override _getTabsConfig(group: string): foundry.applications.api.ApplicationV2.TabsConfiguration | null {
        const tabsConfig = fu.deepClone(super._getTabsConfig(group));

        if (tabsConfig && group === "primary" && !game.user?.isGM) {
            tabsConfig.tabs = tabsConfig?.tabs.filter((t) => t.id !== "config" && t.id !== "foundational");
        }

        return tabsConfig;
    }

    protected override async _prepareContext(
        options: DeepPartial<ItemSheetV2.RenderOptions> & { isFirstRender: boolean },
    ): Promise<ItemSheetV2.RenderContext> {
        const context = fu.deepClone(await super._prepareContext(options));
        context.tabs = this._prepareTabs("primary");
        return context;
    }

    protected override async _preparePartContext(
        partId: string,
        context: ItemSheetV2.RenderContext,
        options: DeepPartial<ItemSheetV2.RenderOptions> & {
            isFirstRender: boolean;
        },
    ): Promise<ItemSheetV2.RenderContext> {
        const partContext = await super._preparePartContext(partId, context, options);
        if (partId === "config") {
            fu.mergeObject(partContext, {
                rules: this.item.system.rules ?? [],
                ruleElements: Object.keys(CONFIG.hexaga.ruleElements),
            });
        }
        console.log(context.tabs, this.activeTab);
        return partContext;
    }

    static async onSubmit(
        this: ItemSheetHex,
        _event: Event,
        _form: HTMLFormElement,
        _formData: FormData,
    ): Promise<void> {
        const target = _event.target as HTMLTextAreaElement;

        // Edit rule elements
        // More robust validation can happen later, but for now this will work
        const index = Number(target.closest(".title-box")?.getAttribute("data-index"));
        const rules = this.item.system.rules;
        if (!isNaN(index) && rules[index]) {
            const ruleObjects = rules.map((r) => r.toObject());
            const changedRule = JSON.parse(target.value);
            const validationErrors = RuleElementData.schema.validate(changedRule);
            if (!validationErrors) {
                ruleObjects[index] = changedRule;
                this.item.system.updateSource({ rules: ruleObjects });
            } else {
                for (const field in validationErrors.fields) {
                    ui.notifications.error(`${field} - ${validationErrors.fields[field].message}`);
                }
                console.error(validationErrors);
            }
        }
    }

    protected override _onClickTab(event: PointerEvent): void {
        super._onClickTab(event);
        this.activeTab = this.tabGroups;
    }

    static async addRuleElement(this: ItemSheetHex, _event: PointerEvent, _target: HTMLElement) {
        const ruleSelectMenu = this.element.querySelector("#new-rule-element") as HTMLSelectElement | null;
        if (!ruleSelectMenu) return;

        const ruleType = ruleSelectMenu.value;
        if (!ruleType) return;

        const itemRules = this.item.system.rules;
        const placeholder = {
            domains: ["all"],
            label: `${this.item.name} ${ruleType}`,
            target: "",
            key: ruleType,
            slug: this.item.name.slugify(),
        } as RuleElementDataConstructor;

        const constructedPlaceholder = new CONFIG.hexaga.ruleElements[ruleType](this.item, placeholder);
        itemRules.push(constructedPlaceholder.data);
        await this.item.update({ system: { rules: itemRules } }); // figure out why this won't work with system.rules
    }

    static async removeRuleElement(this: ItemSheetHex, _event: PointerEvent, target: HTMLElement) {
        const rules = this.item.system.rules;
        const ruleIndex = Number(target.closest(".title-box")?.getAttribute("data-index"));
        if (!isNaN(ruleIndex) && rules) {
            const newRules = rules.map((r) => r.toObject()).filter((_, index) => index !== ruleIndex);
            await this.item.update({ system: { rules: newRules } });
        }
    }
}
