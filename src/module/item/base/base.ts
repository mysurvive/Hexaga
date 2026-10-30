import { RuleElement } from "../../system/ruleElement/base.ts";

export class ItemHex<SubType extends Item.SubType = Item.SubType> extends Item<SubType> {
    declare runtimeRules: RuleElement[];

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
        const grantRules = this.runtimeRules.filter((r) => r.data.key === "GrantItem");
        if (grantRules.length > 0) {
            for (const rule of grantRules) {
                const uuid = rule.data.config.uuid;
                if (!uuid || typeof uuid !== "string") continue;
                const grantedItem = await fromUuid(uuid);
                if (!grantedItem || !(grantedItem instanceof ItemHex)) continue;
                const grantedItemObj = grantedItem.toObject();
                foundry.utils.setProperty(grantedItemObj, "flags.hexaga.grantedBy", this.uuid);
                this.actor.createEmbeddedDocuments("Item", [grantedItemObj]);
            }
        }
    }

    protected override async _onDelete(options: Item.Database.OnDeleteOptions, userId: string): Promise<void> {
        await super._onDelete(options, userId);

        if (!this.actor || game.user.id !== userId) return;
        const grantedItems = this.actor.items
            .filter((i) => i.getFlag("hexaga", "grantedBy") === this.uuid)
            .map((i) => i._id);
        if (grantedItems.length > 0) await this.actor.deleteEmbeddedDocuments("Item", grantedItems);
    }

    get slug() {
        return this.system.slug;
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
        this.runtimeRules = [];
        const savedRules = this.system.rules ?? [];
        for (const rule of savedRules) {
            if (!rule.key) continue;
            this.runtimeRules.push(new CONFIG.hexaga.ruleElements[rule.key](this, rule));
        }
    }
}
