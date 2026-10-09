<script lang="ts">
    export let actor: ActorHex;

    $: heritage = actor.system.options.heritage ?? null;
    $: profession = actor.system.options.profession ?? null;

    function _loc(key: string): string {
        return game.i18n.localize(key);
    }

    async function makeChoice(UUID: string, choice: string | string[]): Promise<void> {
        try {
            const item = await fromUuid(UUID);
            if (!item) throw new Error("UUID is not valid");
            await item.setFlag("hexaga", "selections", choice);
        } catch (error) {
            ui.notifications.error(error);
        }
    }
</script>

<section class="hero-tab" data-group="primary" data-tab="improvements">
    <div>
        <div class="title-left">
            <span>Heritage</span>
            <hr />
        </div>
        {#if heritage}
            <details class="improvement-item">
                <summary
                    ><span>{heritage.name}</span>
                    {#if !heritage.flags?.hexaga?.selections}<span>Improvement Available!</span>{/if}</summary
                >
                <div class="content">
                    {#await window.foundry.applications.ux.TextEditor.enrichHTML( heritage.system.description, { async: true }, )}
                        <span class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading...</span>
                    {:then enrichedHtml}
                        {@html enrichedHtml}
                    {/await}
                    <div class="options">
                        {#each heritage.system?.improvements?.attributes?.selected ?? [] as attributeImprovement}
                            <label class="labeled-toggle">
                                <input
                                    type="radio"
                                    name="heritage-attributes"
                                    value={attributeImprovement}
                                    on:click={() => makeChoice(heritage.uuid, attributeImprovement)}
                                    checked={heritage.flags?.hexaga?.selections === attributeImprovement}
                                />
                                <span class="label-button"
                                    >{_loc(`hexaga.attributes.${attributeImprovement}.label`)}</span
                                >
                            </label>
                        {/each}
                    </div>
                </div>
            </details>
        {:else}
            <div class="improvement-item empty item-drop" data-drop-type="heritage">Drag a Heritage here!</div>
        {/if}
    </div>

    <div>
        <div class="title-left">
            <span>Profession</span>
            <hr />
        </div>
        {#if profession}
            <details class="improvement-item">
                <summary
                    ><span>{profession.name}</span>
                    {#if !profession.flags?.hexaga?.selections}<span>Improvement Available!</span>{/if}</summary
                >
                <div class="content">
                    {#await window.foundry.applications.ux.TextEditor.enrichHTML( profession.system.description, { async: true }, )}
                        <span class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading...</span>
                    {:then enrichedHtml}
                        {@html enrichedHtml}
                    {/await}
                    <div class="options">
                        {#each profession.system?.improvements?.attributes?.selected ?? [] as skillImprovement}
                            <label class="labeled-toggle">
                                <input
                                    type="radio"
                                    name="profession-skills"
                                    value={skillImprovement}
                                    on:click={() => makeChoice(profession.uuid, skillImprovement)}
                                    checked={heritage.flags?.hexaga?.selections === skillImprovement}
                                />
                                <span class="label-button">{_loc(`hexaga.attributes.${skillImprovement}.label`)}</span>
                            </label>
                        {/each}
                    </div>
                </div>
            </details>
        {:else}
            <div class="improvement-item empty item-drop" data-drop-type="profession">Drag a Profession here!</div>
        {/if}
    </div>
</section>

<style lang="scss">
    .hero-tab {
        > div {
            display: flex;
            flex-direction: column;
            margin-top: 20px;
        }
        .improvement-item {
            border: 1px solid white;
            padding: 10px;
            max-width: 100%;

            & .empty {
                height: 30px;
                font-weight: bold;
                align-content: center;
            }

            .options {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
            }
        }

        .improvement-item summary {
            display: flex;
            font-weight: bold;
            cursor: pointer;
            list-style: none;
            height: 20px;
            align-content: center;
            justify-content: space-between;
        }

        .labeled-toggle input[type="radio"] {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        .labeled-toggle .label-button {
            height: 25px;
            display: flex;
            padding: 0px 10px;
            border: 2px solid white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
            font-size: 12px;
            align-items: center;
            width: 80px;
            justify-content: center;
            text-transform: uppercase;
        }

        .labeled-toggle input[type="radio"]:checked + .label-button {
            border-color: gold;
        }
    }
</style>
