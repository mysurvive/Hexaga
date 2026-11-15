import { ActorHex } from "../base/baseActor.ts";

export async function updateActorFromInput(actor: ActorHex, path: string, event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const value = input.value;

    try {
        await actor.update({ [path]: value });
    } catch (error) {
        console.error("Unable to update Actor", error);
    }
}
