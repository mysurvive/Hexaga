<script>
    export let item;
    $: improvements = item.system.improvements;
    $: {
        if (improvements?.attributes?.selected) {
            selected = [...improvements.attributes.selected];
        }
    }
    let selected;

    function _loc(key) {
        return game.i18n.localize(key);
    }

    async function changeSelection(target, event) {
        const isChecked = event.target.checked;

        if (isChecked) {
            if (!selected.includes(target)) {
                selected = [...selected, target];
            }
        } else {
            selected = selected.filter((attr) => attr !== target);
        }

        try {
            await item.update({ "system.improvements.attributes.selected": selected });
        } catch (error) {
            console.error("Error updating item", error);
        }
    }
</script>

<section class="item-tab">
    <div class="foundational-improvements">
        {#if improvements.attributes}
            <div class="foundational-item">
                <div class="title">{_loc("hexaga.attributes.label")}</div>
                <hr />
                <div class="choices">
                    {#each improvements.attributes.choices as choice}
                        <div class="flex align-center">
                            <input
                                type="checkbox"
                                id={choice}
                                name="attributes"
                                value={choice}
                                checked={selected.includes(choice)}
                                on:change={(e) => changeSelection(choice, e)}
                            />
                            <label for={choice}>{_loc(`hexaga.attributes.${choice}.label`)}</label>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</section>
