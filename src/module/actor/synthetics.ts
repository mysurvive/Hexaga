import { Modifier } from "../system/modifier.ts";

export interface ActorSynthetics {
    modifiers: Record<string, Modifier[]>;
}
