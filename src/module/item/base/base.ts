import { RulesEngine } from "../../system/ruleElement/rulesEngine.ts";
import { AnyRuleElement } from "../../system/ruleElement/types.ts";

export class ItemHex<SubType extends Item.SubType = Item.SubType> extends Item<SubType> {
    declare rules: AnyRuleElement[];

    get slug() {
        return this.system.slug;
    }

    get sourceId() {
        const isCompendiumItem = this._id && this.pack && !this.isEmbedded;
        return isCompendiumItem ? this.uuid : (this._stats.duplicateSource ?? this._stats.compendiumSource);
    }

    // Temporary Typing
    static override async createDocuments(
        this: new (...args: any[]) => Document,
        data: any[] = [],
        context: any = {},
    ): Promise<any[]> {
        if (context.parent?.documentName === "Actor") {
            for (const createData of data) {
                const sidebarItem = game.items.get(createData._id ?? "");

                if (sidebarItem && !createData._stats?.duplicateSource) {
                    createData._stats = {
                        ...createData._stats,
                        duplicateSource: sidebarItem.uuid,
                    };
                }
            }
        }
        return super.createDocuments(data, context);
    }

    static override async fromDropData(data: object): Promise<Item.Implementation | undefined> {
        if ("uuid" in data && typeof data.uuid === "string") {
            const item = await fromUuid(data.uuid);
            if (item instanceof ItemHex && item.parent && !item.sourceId) {
                item._source._stats.duplicateSource = item.uuid;
                item._stats.duplicateSource = item._source._stats.duplicateSource;
                item._source._stats.compendiumSource ??= item.uuid?.startsWith("Compendium.") ? item.uuid : null;
                item._stats.compendiumSource = item._source._stats.compendiumSource;
            }
        }

        return super.fromDropData(data);
    }

    protected override async _preCreate(
        data: Item.CreateData,
        options: Item.Database.PreCreateOptions,
        user: User.Stored,
    ): Promise<boolean | void> {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;

        if (!this.system.slug) {
            try {
                const update = { slug: this.name.slugify() };
                await this.system.updateSource(update);
            } catch (error) {
                console.error(error);
            }
        }
    }

    protected override async _onCreate(
        data: Item.CreateData,
        options: Item.Database.OnCreateOptions,
        userId: string,
    ): Promise<void> {
        await super._onCreate(data, options, userId);
        if (!this.actor || game.user.id !== userId) return;
        for (const rule of this.rules) {
            if ("onCreate" in rule && typeof rule.onCreate === "function") {
                await rule.onCreate();
            }
        }
    }

    protected override async _preDelete(
        options: Item.Database.PreDeleteOptions,
        user: User.Stored,
    ): Promise<boolean | void> {
        if (!this.actor || game.user.id !== user.id) return;

        for (const rule of this.rules) {
            if ("preDelete" in rule && typeof rule.preDelete === "function") {
                await rule.preDelete();
            }
        }

        await super._preDelete(options, user);
    }

    protected override async _onDelete(options: Item.Database.OnDeleteOptions, userId: string): Promise<void> {
        await super._onDelete(options, userId);

        if (!this.actor || game.user.id !== userId) return;
        const grantedItems = this.actor.items
            .filter(
                (i) =>
                    i.getFlag("hexaga", "grantedBy") ===
                    (this.type === "heritage" || this.type === "profession" ? this.type : this.uuid),
            )
            .map((i) => i._id);
        if (grantedItems.length > 0) await this.actor.deleteEmbeddedDocuments("Item", grantedItems);
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.rules = RulesEngine.initialize(this);
        for (const rule of this.rules) {
            if ("onPrepareDerivedData" in rule && typeof rule.onPrepareDerivedData === "function") {
                rule.onPrepareDerivedData();
            }
        }
    }
}
