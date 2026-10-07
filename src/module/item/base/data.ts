import { ConfiguredItem } from "fvtt-types/configuration";
import { RuleElementData } from "../../system/ruleElement/data.ts";
import { ItemHex } from "./base.ts";

export class ItemHexData extends foundry.abstract.TypeDataModel<ItemHexSchema, Item> {
    static override defineSchema(): ItemHexSchema {
        return defineItemSchema();
    }
}

const defineItemSchema = () => {
    return {
        rules: new fields.ArrayField(new fields.EmbeddedDataField(RuleElementData), { required: true, initial: [] }),
    };
};

export type ItemHexSchema = ReturnType<typeof defineItemSchema>;
export { defineItemSchema };
