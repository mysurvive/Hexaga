import { RuleElement } from "./base.ts";

export class GrantItem extends RuleElement<GrantItemSchema> {
    static override defineSchema() {
        return defineGrantItemSchema();
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
