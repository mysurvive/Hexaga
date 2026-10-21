<script>
    export let actor;
    export let modifiers;
    export let item;
    export let skill;

    export let onConfirm;

    let disabledSlugs = new Set();

    function toggleModifier(slug) {
        if (disabledSlugs.has(slug)) disabledSlugs.delete(slug);
        else disabledSlugs.add(slug);
        disabledSlugs = disabledSlugs;
    }

    function confirmRoll() {
        const activeModifiers = modifiers.filter((m) => !disabledSlugs.has(m.slug));

        onConfirm({
            roller: actor,
            item,
            skill,
            modifiers: activeModifiers,
        });
    }
</script>

<div class="dialog-wrapper">
    <fieldset class="modifiers-list">
        <legend>Modifiers</legend>
        {#each modifiers as mod}
            <label class="modifier-row">
                <input
                    type="checkbox"
                    checked={!disabledSlugs.has(mod.slug)}
                    on:change={() => toggleModifier(mod.slug)}
                />
                {mod.label} ({mod.modifier})
            </label>
        {/each}
    </fieldset>

    <footer class="dialog-footer">
        <button class="roll-button" type="button" on:click={confirmRoll}>Roll</button>
    </footer>
</div>

<style lang="scss">
    .dialog-wrapper {
        display: flex;
        flex-direction: column;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
    }

    .modifiers-list {
        flex: 1 1 auto;
        overflow-y: auto;
        margin-bottom: 0.5rem;
        padding: 0.5rem;

        .modifier-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
            cursor: pointer;
        }
    }

    .dialog-footer {
        flex: 0 0 auto;
        width: 100%;
        padding-top: 0.25rem;
    }

    .roll-button {
        width: 100%;
        padding: 0.5rem;
        font-weight: bold;
        cursor: pointer;
    }
</style>
