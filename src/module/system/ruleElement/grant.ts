import { RuleElement } from "./base.ts";

export class GrantItem extends RuleElement<GrantItemConfig> {
    override onPrepareDerivedData(): void {}

    get uuid() {
        return this.data.config.uuid;
    }
}

export type GrantItemConfig = {
    uuid: string;
};
