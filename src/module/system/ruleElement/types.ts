import { ItemHex } from "../../item/base/base.ts";
import { RuleElement } from "./base.ts";
import { RuleElementData } from "./data.ts";

export type RuleElementConstructor = new (item: ItemHex, data: RuleElementData) => RuleElement;
