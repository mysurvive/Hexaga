import { ItemHex } from "../../item/base/base.ts";
import { RuleElement } from "./base.ts";
import { FlatModifier } from "./flatModifier.ts";
import { FlatModifierSchema } from "./flatModifier.ts";
import { GrantItem } from "./grantItem.ts";
import { GrantItemSchema } from "./grantItem.ts";

export type RuleElementSchemaMap = {
    FlatModifier: FlatModifierSchema & { readonly key: "FlatModifier" };
    GrantItem: GrantItemSchema & { readonly key: "GrantItem" };
};
export type RuleElementMap = {
    FlatModifier: FlatModifier;
    GrantItem: GrantItem;
};

export type RuleElementConstructor<K extends keyof RuleElementSchemaMap> = new (
    data: RuleElement<RuleElementSchemaMap[K]>,
    options?: { parent?: ItemHex },
) => RuleElementMap[K];

export type AnyRuleElement = RuleElementMap[keyof RuleElementMap];
export type AnyRuleElementSchema = RuleElementSchemaMap[keyof RuleElementSchemaMap];
