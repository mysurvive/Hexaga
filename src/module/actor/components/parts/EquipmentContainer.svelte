<script>
    import EquipmentItem from "./EquipmentItem.svelte";

    export let actor;
    export let itemType;

    $: items = [...actor.itemTypes[itemType]];
</script>

<div class={`${itemType}-container`}>
    <div class="title-left">
        {window.game.i18n.localize(`hexaga.itemTypes.${itemType}`)}
        <hr />
    </div>
    <div class="equipment-container">
        {#each items as item (item.id)}
            <EquipmentItem {actor} {itemType} {item} />
        {/each}
    </div>
</div>

<style lang="scss">
    .title-left {
        margin-top: 20px;
    }
    .equipment-container {
        margin: 10px;
    }
</style>
