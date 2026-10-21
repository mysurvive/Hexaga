import { Modifier } from "../system/modifier.ts";

export interface ActorSynthetics {
    modifiers: Record<string, DeferredModifier[]>;
}

export type DeferredModifier = (rollOptions?: string[]) => Modifier | undefined;
