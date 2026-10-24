<script>
    export let item;

    $: system = item.system;
    $: ablation = system.ablation;
    $: durability = system.durability.max;

    async function updateItemFromEvent(path, event) {
        const target = event.currentTarget;

        if (!target || (!"value") in target) return;
        try {
            await item.update({ [path]: target.value });
        } catch (error) {
            console.error(`Error updating ${path} on ${item.name}`);
        }
    }
</script>

<section class="item-tab">
    <div>
        <div class="flex-row">
            <label for="ablation">Ablation: </label>
            <input
                type="number"
                id="ablation"
                value={ablation}
                on:change={(e) => {
                    updateItemFromEvent("system.ablation", e);
                }}
            />
        </div>
        <div class="flex-row">
            <label for="durability">Durability: </label>
            <input
                type="number"
                id="durability"
                value={durability}
                on:change={(e) => {
                    updateItemFromEvent("system.durability.max", e);
                }}
            />
        </div>
    </div>
</section>

<style lang="scss">
    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 5px;
        margin-top: 5px;
        label {
            margin-right: 10px;
        }
        input {
            width: 40px;
        }
    }
</style>
