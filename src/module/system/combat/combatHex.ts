import { MaybeArray } from "fvtt-types/utils";
import { TempoRoll } from "../dice/roller.ts";

export class CombatHex extends Combat {
    override async rollInitiative(ids: MaybeArray<string>, options?: Combat.InitiativeOptions): Promise<this> {
        const idList = typeof ids === "string" ? [ids] : ids;
        const updates = [];
        const rollAll = idList.length > 1;

        for (const id of idList) {
            const combatant = this.combatants.get(id);
            const actor = combatant?.actor;

            if (!combatant || !actor?.intrinsics?.tempo) continue;

            const tempoRoll = await actor.intrinsics.tempo.roll({ skipDialog: rollAll });

            if (!(tempoRoll instanceof TempoRoll)) continue;

            updates.push({ _id: id, initiative: tempoRoll.rawSuccesses });
        }
        if (updates.length > 0) {
            await this.updateEmbeddedDocuments("Combatant", updates);
        }
        if (options?.updateTurn !== false && this.started) {
            await this.update({ turn: 0 });
        }
        return this;
    }

    protected override _sortCombatants(a: Combatant, b: Combatant): number {
        const initA = Number.isNumeric(a.initiative) ? a.initiative! : -Infinity;
        const initB = Number.isNumeric(b.initiative) ? b.initiative! : -Infinity;

        if (initA !== initB) {
            return initB - initA;
        }

        if (a.hasPlayerOwner !== b.hasPlayerOwner) {
            return a.hasPlayerOwner ? -1 : 1;
        }

        return (a.id ?? "").localeCompare(b.id ?? "");
    }

    override async nextRound(): Promise<this> {
        await super.nextRound();
        await this.rollInitiative(this.combatants.filter((c) => !c.isDefeated).map((c) => c.id));
        return this;
    }
}
