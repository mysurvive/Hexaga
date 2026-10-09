<script lang="ts">
    import TabCharacter from "./tabs/TabCharacter.svelte";
    import TabItems from "./tabs/TabItems.svelte";
    import TabSpells from "./tabs/TabSpells.svelte";
    import TabAspects from "./tabs/TabAspects.svelte";
    import TabImprovements from "./tabs/TabImprovements.svelte";

    export let actor: any;

    function _loc(key: string): string {
        return game.i18n.localize(key);
    }

    async function updateActorFromInput(path: string, event: Event): Promise<void> {
        const input = event.currentTarget as HTMLInputElement;
        const value = input.value;

        try {
            await actor.update({ [path]: value });
        } catch (error) {
            console.error("Unable to update Actor", error);
        }
    }

    const tabConfig = [
        { id: "character" },
        { id: "items" },
        { id: "spells" },
        { id: "aspects" },
        { id: "improvements" },
    ];

    let activeTab = "character";
</script>

<section>
    <header class="actor-header">
        <img class="character-portrait" src={actor.img} alt="" />
        <div class="character-basics">
            <div>
                <label for="character-name">Name: </label>
                <input
                    type="text"
                    id="character-name"
                    value={actor.name}
                    on:change={(e) => {
                        updateActorFromInput("name", e);
                    }}
                />
            </div>
            <div>
                <label for="character-heritage">Heritage: </label>
                <span id="character-heritage">{actor.system.options?.heritage?.name ?? ""}</span>
            </div>
            <div>
                <label for="character-profession">Profession: </label>
                <span id="character-profession">{actor.system.options?.profession?.name ?? ""}</span>
            </div>
            <div class="character-intrinsic">
                <div>
                    <label for="current-hp">HP: </label>
                    <input
                        type="text"
                        id="current-hp"
                        value={actor.hp.current}
                        on:change={(e) => {
                            actor.modifyHealth(e.currentTarget.value);
                        }}
                    />
                    <span
                        >/
                        {actor.hp.max}</span
                    >
                </div>
                <div>
                    <label for="character-tempo">Tempo: </label>
                    <span id="character-tempo">{actor.intrinsics.tempo}</span>
                </div>
                <div>
                    <label for="character-speed">Speed: </label>
                    <span id="character-speed">{actor.intrinsics.speed}</span>
                </div>
            </div>
        </div>
        <div class="focus-box-container medium" id="character-level">
            <div class="focus-label">Level</div>
            <div class="focus-content">
                {actor.system.level}
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
                on:click={() => (activeTab = tab.id)}
            >
                <label for={tab.id}>{_loc(`hexaga.actor.hero.sheet.tabs.${tab.id}`)}</label>
            </a>
        {/each}
    </nav>

    {#if activeTab === "character"}
        <TabCharacter {actor} />
    {:else if activeTab === "items"}
        <TabItems {actor} />
    {:else if activeTab === "spells"}
        <TabSpells {actor} />
    {:else if activeTab === "aspects"}
        <TabAspects {actor} />
    {:else if activeTab === "improvements"}
        <TabImprovements {actor} />
    {/if}
</section>

<style lang="scss">
    a {
        cursor: default;
    }
    .actor-header {
        display: grid;
        grid-template-columns: repeat(6, 144px);

        .character-portrait {
            height: 100%;
            width: 100%;

            grid-column: 1 / 2;
        }

        .character-basics {
            grid-column: 2 / 6;

            display: flex;
            flex-direction: column;

            label {
                margin-right: 5px;
            }

            div {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin: 5px 0 5px 0;
            }

            .character-intrinsic {
                grid-column: 1 / 6;
                grid-row: 3;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;

                #current-hp {
                    width: 40px;
                }
            }
        }

        #character-level {
            justify-self: center;
        }
    }
</style>
