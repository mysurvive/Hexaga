<script>
    import EquipmentContainer from "../parts/EquipmentContainer.svelte";
    import { ItemHex } from "../../../../item/base/base.ts";
    import { ActorHex } from "../../../base/baseActor.ts";

    export let actor;

    $: weapons = [...actor.itemTypes.weapon];
    $: armors = [...actor.itemTypes.armor];

    async function toggleEquip(item) {
        if (!item.id || !item._id) return;
        const currentItem = actor.items.get(item.id || item._id);
        const isEquipped = !item.system.equipped;

        try {
            if (!currentItem) throw Error("Item is undefined");
            await currentItem.update({ system: { equipped: isEquipped } });
        } catch (error) {
            console.error(`Error equipping ${item.name}`);
        }
    }
</script>

<section class="hero-tab droppable">
    <EquipmentContainer {actor} itemType={"weapon"} />
    <EquipmentContainer {actor} itemType={"armor"} />
</section>

<style lang="scss">
    section {
        overflow-y: auto;
    }
</style>
