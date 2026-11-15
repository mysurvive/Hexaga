<script>
    export let actor;
    export let itemType;
    export let item;

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

{#if itemType === "armor"}
    <div class="armor-stats flex-row">
        Durability: <input
            type="number"
            value={item.system.durability.current}
            on:change={(e) => {
                updateItemFromEvent("system.durability.current", e);
            }}
        />
        / {item.system.durability.max} - Ablation
        {item.system.ablation}
    </div>
{/if}
<details class="equipment-item">
    <summary class={`equipment ${itemType}-item`}>
        <img alt={item.name} src={item.img} />
        <span class="item-name">{item.name}</span>
        <span class="controls flex-row">
            {#if "equipped" in item.system}
                <button
                    class={item.system.equipped ? "active" : ""}
                    type="button"
                    data-tooltip={item.system.equipped ? "Unequip" : "Equip"}
                    on:click={() => toggleEquip(item)}
                >
                    <i class="fa-solid fa-hand-fist"></i>
                </button>
            {/if}
            <button
                type="button"
                data-tooltip="Edit"
                on:click={() => {
                    item.sheet.render(true);
                }}
            >
                <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button
                type="button"
                data-tooltip="Delete"
                on:click={() => {
                    item.deleteDialog();
                }}
            >
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </span>
    </summary>
    <div class="content">
        {#await window.foundry.applications.ux.TextEditor.enrichHTML( item.system.description, { async: true }, ) then enrichedHtml}
            {@html enrichedHtml}
        {/await}
    </div>
</details>

<style lang="scss">
    details {
        > div {
            margin: 10px;
        }
    }

    .equipment {
        height: 40px;
        display: grid;
        grid-template-columns: 50px 2fr 1fr;
        align-items: center;
        border: 1px solid white;
        padding: 5px;
        img {
            max-height: 30px;
        }
    }
    .equipment-item {
        border: 1px solid white;
        margin-bottom: 5px;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
    }
    .controls {
        justify-content: right;
        button {
            border: none;
            background: none;
            width: 30px;
            &:focus {
                outline: none;
                box-shadow: none;
            }
            &.active {
                outline: none;
                background-color: rgba(248, 255, 46, 0.3);
                -webkit-box-shadow: 0px 0px 5px 2px rgba(248, 255, 46, 0.3);
                -moz-box-shadow: 0px 0px 5px 2px rgba(248, 255, 46, 0.3);
                box-shadow: 0px 0px 5px 2px rgba(248, 255, 46, 0.3);
            }
        }
    }
    .armor-stats {
        justify-self: right;
        border: 2px solid white;
        border-bottom: none;
        padding: 5px;
        align-items: center;
        input {
            height: 20px;
            width: 30px;
            background: none;
            justify-items: right;
        }
    }
</style>
