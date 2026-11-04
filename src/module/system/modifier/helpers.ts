import { ActorHex } from "../../actor/base/baseActor.ts";
import { Modifier } from "./modifier.ts";

interface AttributeModifierArgs {
    actor: ActorHex;
    attribute: string;
    domains: string[];
}

export function createAttributeModifier({ actor, attribute, domains }: AttributeModifierArgs): Modifier {
    return new Modifier({
        slug: attribute,
        label: game.i18n.localize(`hexaga.attributes.${attribute}.label`),
        modifier: actor.system.attributes[attribute as keyof typeof actor.system.attributes].total,
        domains: domains,
        modifies: "flat",
    });
}
