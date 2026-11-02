<script>
    export let item;

    $: systemData = item.system;
    $: levelRequirement = systemData.level.value;

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
            <label for="level">Level: </label>
            <input
                type="number"
                id="level"
                value={levelRequirement}
                on:change={(e) => updateItemFromEvent("system.level.value", e)}
            />
        </div>
    </div>
</section>

<style lang="scss">
    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 10px 0;
        label {
            margin-right: 10px;
        }
        input {
            width: 40px;
        }
    }
</style>
