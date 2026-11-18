import { ActorHex } from "../../actor/base/baseActor.ts";
import { Modifier } from "./modifier.ts";

interface AttributeModifierArgs {
    actor: ActorHex;
    attribute: string;
    domains: string[];
    multiplier?: number;
}

export function createAttributeModifier({ actor, attribute, domains, multiplier }: AttributeModifierArgs): Modifier {
    return new Modifier({
        slug: attribute,
        label: game.i18n.localize(`hexaga.attributes.${attribute}.label`),
        modifier: actor.system.attributes[attribute as keyof typeof actor.system.attributes].total * (multiplier ?? 1),
        domains: domains,
        modifies: "dice",
    });
}
