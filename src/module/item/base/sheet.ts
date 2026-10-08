import { DeepPartial } from "fvtt-types/utils";
import { RuleElementData, RuleElementDataConstructor } from "../../system/ruleElement/data.ts";
import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

const HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export class ItemSheetHex extends HandlebarsApplicationMixin(ItemSheetV2)<
    ItemSheetV2.RenderContext,
    ItemSheetV2.Configuration,
    ItemSheetV2.RenderOptions
> {
    declare activeTab: typeof this.tabGroups | undefined | null;

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
                rules: this.document.system.rules ?? [],
                ruleElements: Object.keys(CONFIG.hexaga.ruleElements),
            });
        }
        if (partId === "description") {
            fu.mergeObject(partContext, {
                description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
                    this.document.system.description,
                    { secrets: this.document.isOwner, relativeTo: this.document },
                ),
            });
        }
        return partContext;
    }

    protected static async onSubmit(
        this: ItemSheetHex,
        _event: Event,
        _form: HTMLFormElement,
        _formData: foundry.applications.ux.FormDataExtended,
    ): Promise<void> {
        _event.preventDefault();
        const data = _formData.object;
        const rules = Array.isArray(data.rules) ? data.rules : [data.rules];
        data.rules = rules
            ? rules
                  .map((r) => {
                      const validationErrors = RuleElementData.schema.validate(r);
                      if (!validationErrors) {
                          return r;
                      } else {
                          for (const field in validationErrors.fields) {
                              ui.notifications.error(`${field} - ${validationErrors.fields[field].message}`);
                          }
                          console.error(validationErrors);
                          return undefined;
                      }
                  })
                  .filter((r) => r !== undefined)
            : null;
        data.rules = rules;
        await this.document.update({ system: data });
    }

    protected override async _onRender(
        context: DeepPartial<ItemSheetV2.RenderContext>,
        options: DeepPartial<ItemSheetV2.RenderOptions>,
    ): Promise<void> {
        await super._onRender(context, options);

        // Handle the handlebars mixin nonsense where all tabs get the active class on partial re-render
        // Honestly? Super jank wtf.
        if (options.isFirstRender) this.activeTab = { primary: "description" };
        if (this.activeTab) {
            const tabs = this.element.querySelectorAll(".tab");
            const tabToActivate = this.activeTab.primary;
            for (const tab of tabs) {
                if (tab && tab.attributes.getNamedItem("data-tab")?.value !== tabToActivate) {
                    tab.classList.remove("active");
                } else if (tab.attributes.getNamedItem("data-tab")?.value === tabToActivate) {
                    tab.classList.add("active");
                }
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
