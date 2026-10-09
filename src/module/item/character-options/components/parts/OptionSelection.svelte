<script>
    export let item;
    export let titleKey;
    export let localizationPrefix;
    export let path;
    export let choices = [];
    export let selected = [];

    let localSelected = Array.isArray(selected) ? [...selected] : [];

    $: {
        const currentDbArray = Array.isArray(selected) ? selected : [];
        const isOutOfSync =
            currentDbArray.length !== localSelected.length ||
            !currentDbArray.every((val) => localSelected.includes(val));

        if (isOutOfSync) {
            localSelected = [...currentDbArray];
        }
    }

    function _loc(key) {
        return game.i18n.localize(key);
    }

    async function changeSelection(target, event) {
        const isChecked = event.target.checked;

        if (isChecked) {
            if (!localSelected.includes(target)) {
                localSelected = [...localSelected, target];
            }
        } else {
            localSelected = localSelected.filter((attr) => attr !== target);
        }

        try {
            await item.update({ [path]: localSelected });
        } catch (error) {
            console.error("Hexaga | Error updating item selection:", error);
        }
    }
</script>

<div class="foundational-item">
    <div class="title">{_loc(`${localizationPrefix}.${titleKey}.label`)}</div>
    <hr />
    <div class="choices">
        {#each choices as choice}
            <div class="flex align-center">
                <input
                    type="checkbox"
                    id={choice}
                    name={titleKey}
                    value={choice}
                    checked={localSelected.includes(choice)}
                    on:change={(e) => changeSelection(choice, e)}
                />
                <label for={choice}>{_loc(`${localizationPrefix}.${titleKey}.${choice}.label`)}</label>
            </div>
        {/each}
    </div>
</div>
