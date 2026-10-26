<script>
    import CheckboxOptions from "./CheckboxOptions.svelte";
    import TagifyInput from "../../../../shared/components/TagifyInput.svelte";
    export let option;
    export let titleKey;
    export let optionType;
    export let actor;

    // Heritage and Profession bonuses are granted at level 1 only
    const rankCap = CONFIG.hexaga.maxRank.findLast((item) => item.level === 1).cap;
    $: improvements = option?.system?.improvements ?? null;
    $: selectedChoices = Array.isArray(option?.flags?.hexaga?.selections) ? option.flags.hexaga.selections : [];

    function _loc(key) {
        return game.i18n.localize(key);
    }

    async function removeOption(option) {
        await actor.deleteEmbeddedDocuments("Item", [option.id]);
    }
</script>

<div>
    {#if optionType}
        <div class="title-left">
            <span>{_loc(`TYPES.Item.${optionType}`)}</span>
            <hr />
        </div>
    {/if}
    {#if option && improvements}
        <details class="improvement-item">
            <summary>
                <span class="label-box">
                    <span>{option.name}</span>
                </span>
                <button
                    type="button"
                    on:click={() => {
                        option.sheet.render({ force: true });
                    }}><i class="fa-solid fa-pen-to-square"></i></button
                >
                <button
                    type="button"
                    on:click={() => {
                        removeOption(option);
                    }}><i class="fa-solid fa-trash"></i></button
                >
            </summary>
            <div class="content">
                {#await window.foundry.applications.ux.TextEditor.enrichHTML( option.system.description, { async: true }, ) then enrichedHtml}
                    {@html enrichedHtml}
                {/await}
                {#each titleKey as tKey}
                    {#if tKey === "expertise"}
                        <span class="title-left">{window.game.i18n.localize(`hexaga.${tKey}.label`)}</span>
                        <span>Choose {improvements[tKey].allowed} expertise options:</span>
                        <TagifyInput
                            allowed={option.system.improvements.expertise.allowed -
                                (option.flags?.hexaga?.selections?.expertise.length ?? 0)}
                            selections={option.flags?.hexaga?.selections?.expertise || []}
                            externalBlacklist={actor.expertise.map((s) => (typeof s === "object" ? s.slug : s))}
                            onChange={async (values) => await option.setFlag("hexaga", "selections.expertise", values)}
                        />
                    {:else}
                        <span class="title-left">{window.game.i18n.localize(`hexaga.${tKey}.label`)}</span>
                        <span>Select {improvements[tKey].allowed} from the following:</span>

                        <CheckboxOptions {option} {tKey} {actor} />
                    {/if}
                {/each}
            </div>
        </details>
    {:else}
        <div class="improvement-item empty item-drop" data-drop-type={optionType}>
            Drag a {_loc(`TYPES.Item.${optionType}`)} here!
        </div>
    {/if}
</div>

<style lang="scss">
    .title-left {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
    }
    .improvement-item {
        border: 1px solid white;
        padding: 10px;
        max-width: 100%;
    }

    .content {
        margin-top: 20px;
    }

    .improvement-item summary {
        display: flex;
        font-weight: bold;
        cursor: pointer;
        list-style: none;
        height: 20px;
        align-items: center;
        justify-content: space-between;

        button {
            height: 30px;
            width: 30px;
        }

        .label-box {
            width: 100%;
            display: flex;
            justify-content: space-between;
            margin-right: 10px;
        }
    }
</style>
