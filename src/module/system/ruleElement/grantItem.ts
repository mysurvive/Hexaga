import { ItemHex } from "../../item/base/base.ts";
import { RuleElement } from "./base.ts";

export class GrantItem extends RuleElement<GrantItemSchema> {
    static override defineSchema() {
        return defineGrantItemSchema();
    }

    async onCreate(): Promise<void> {
        const uuid = this.uuid;
        if (!uuid || typeof uuid !== "string" || !this.actor) return;

        const grantedItem = await fromUuid(uuid);
        if (!grantedItem || !(grantedItem instanceof ItemHex)) return;

        const grantedItemObj = grantedItem.toObject();

        const grantedByString =
            this.parent.type === "heritage" || this.parent.type === "profession" ? this.parent.type : this.parent.uuid;
        foundry.utils.setProperty(grantedItemObj, "flags.hexaga.grantedBy", grantedByString);

        this.actor.createEmbeddedDocuments("Item", [grantedItemObj]);
    }
}

const defineGrantItemSchema = () => {
    return {
        ...RuleElement.defineSchema(),
        uuid: new fields.DocumentUUIDField({ required: true, initial: undefined }),
    };
};

export type GrantItemSchema = ReturnType<typeof defineGrantItemSchema>;

export interface GrantItem {
    readonly key: "GrantItem";
}
