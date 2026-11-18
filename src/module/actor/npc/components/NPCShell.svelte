<script>
    import { updateActorFromInput } from "../../components/helpers.ts";
    import LeftPanel from "./parts/LeftPanel.svelte";
    import TabItems from "../../components/tabs/TabItems.svelte";
    import TabCharacter from "./tabs/TabCharacter.svelte";
    import TabSpells from "../../components/tabs/TabSpells.svelte";
    import TabEffects from "../../components/tabs/tabEffects.svelte";
    export let actor;
    export let sheetData;

    $: activeTab = sheetData.activeTab;
    $: editing = sheetData.editing;

    const tabConfig = [{ id: "character" }, { id: "items" }, { id: "spells" }, { id: "effects" }];

    function toggleEditing() {
        editing = !editing;
    }
</script>

<section class="flex-row">
    <LeftPanel {actor} {editing} />
    <div class="flex-column">
        <header class="actor-header">
            <img class="character-portrait" src={actor.img} alt="hero portrait" />
            <div class="character-basics">
                <div class="flex-row gap">
                    <input
                        type="text"
                        id="character-name"
                        value={actor.name}
                        on:change={(e) => {
                            updateActorFromInput(actor, "name", e);
                        }}
                    />
                    <button class="edit-button" type="button" on:click={(e) => toggleEditing()}>
                        <i class={editing ? "fa-solid fa-lock-open" : "fa-solid fa-lock"} />
                    </button>
                </div>
            </div>
        </header>
        <nav class="sheet-tabs tabs">
            {#each tabConfig as tab}
                <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                <a
                    class="sheet-tab-button"
                    id={tab.id}
                    class:active={activeTab === tab.id}
                    on:click={() => {
                        activeTab = tab.id;
                        sheetData.activeTab = activeTab;
                    }}
                >
                    <label for={tab.id}>{window.game.i18n.localize(`hexaga.actor.sheet.tabs.${tab.id}`)}</label>
                </a>
            {/each}
        </nav>

        {#if activeTab === "character"}
            <TabCharacter {actor} {editing} />
        {:else if activeTab === "items"}
            <TabItems {actor} />
        {:else if activeTab === "spells"}
            <TabSpells {actor} />
        {:else if activeTab === "effects"}
            <TabEffects {actor} />
        {/if}
    </div>
</section>

<style lang="scss">
    a {
        cursor: default;
    }
    .flex-row {
        display: flex;
        flex-direction: row;
    }
    .gap {
        gap: 8px;
    }
    .actor-header {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        height: 150px;

        .character-portrait {
            height: 150px;
            min-height: 150px;
            max-width: 150px;
            width: 150px;
            grid-column: 1 / 2;
        }

        .character-basics {
            grid-column: 2 / 7;

            display: flex;
            flex-direction: column;

            #character-name {
                height: 50px;
                font-size: 36px;
            }

            div {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin: 5px 0 5px 0;
            }
        }
    }
</style>
