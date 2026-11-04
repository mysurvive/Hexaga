<script>
    import { setContext } from "svelte";
    import { writable } from "svelte/store";
    import NavTabs from "../../../shared/components/NavTabs.svelte";
    import TabDescription from "./tabs/TabDescription.svelte";
    import TabFoundationalCharacterOptions from "../../character-options/components/tabs/TabFoundational.svelte";
    import TabFoundationalWeapon from "../../equipment/weapon/components/tabs/TabFoundational.svelte";
    import TabFoundationalArmor from "../../equipment/armor/components/tabs/TabFoundational.svelte";
    import TabFoundationalAspectNode from "../../character-options/aspect/components/parts/item-sheet/TabFoundational.svelte";
    import TabConfig from "./tabs/TabConfig.svelte";

    export let item;

    $: name = item.name;
    $: itemLevel = item.system.level?.value ?? undefined;
    $: itemRequirements = item.system.requirements ?? [];
    $: needsDetailsPane = itemLevel || itemRequirements.length > 0;

    const tabStore = writable("description");

    setContext("activeTab", tabStore);

    const tabs = [
        { id: "description", labelPath: "hexaga.item.sheet.tabs.description" },
        { id: "foundational", labelPath: "hexaga.item.sheet.tabs.foundational" },
        { id: "config", labelPath: "hexaga.item.sheet.tabs.config" },
    ];

    async function updateItem(path, event) {
        const target = event.currentTarget;

        try {
            await item.update({ [path]: target.value });
        } catch (error) {
            console.error(`Error updating ${path} on ${item.name}`);
        }
    }
</script>

<header>
    <img src={item.img} alt={item.name} />
    <span class="name">
        <input type="text" value={name} on:change={(e) => updateItem("name", e)} />
    </span>
</header>

<div class="content-area">
    {#if needsDetailsPane}
        <div class="details">
            <div class="details-label">Details</div>
            <div class="details-pane">
                {#if itemLevel}
                    Level: {itemLevel}
                {/if}
                {#if itemRequirements.length > 0}
                    Requirements:
                    <ul>
                        <!-- Needs work when I've ironed out how requirements are going to be listed -->
                        {#each itemRequirements as requirement}
                            <li>{requirement}</li>
                        {/each}
                    </ul>
                {/if}
            </div>
        </div>
    {/if}
    <div class="content-focus">
        <NavTabs {tabs} />
        {#if $tabStore === "description"}
            <TabDescription {item} />
        {:else if $tabStore === "foundational"}
            {#if item.type === "heritage" || item.type === "profession"}
                <TabFoundationalCharacterOptions {item} />
            {:else if item.type === "weapon"}
                <TabFoundationalWeapon {item} />
            {:else if item.type === "armor"}
                <TabFoundationalArmor {item} />
            {:else if item.type === "aspectNode"}
                <TabFoundationalAspectNode {item} />
            {/if}
        {:else if $tabStore === "config"}
            <TabConfig {item} />
        {/if}
    </div>
</div>

<style lang="scss">
    :global(.window-content),
    :global(form),
    :global(.application) {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
    }

    :global(*) {
        box-sizing: border-box;
    }

    header {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        flex: 0 0 auto;
        margin-bottom: 10px;

        span {
            flex-grow: 1;
        }
        img {
            height: 60px;
            margin: 5px 10px;
        }
    }

    .content-area {
        display: flex;
        flex-direction: row;
        flex: 1;
        min-height: 0;

        .details-label {
            justify-self: center;
            margin: 5px;
        }
        .details-pane {
            margin: 10px;
        }
    }

    .details {
        min-width: 130px;
        border: 1px solid #2d2f2d;
        margin-right: 10px;
        margin-bottom: 15px;
        flex: 0 0 auto;
    }

    .content-focus {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
</style>
