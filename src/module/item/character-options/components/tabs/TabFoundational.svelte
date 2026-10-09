<script>
    import OptionSelection from "../parts/OptionSelection.svelte";

    export let item;

    $: improvements = item.system.improvements;
</script>

<section class="item-tab">
    <div class="foundational-improvements">
        {#if item.type === "heritage"}
            <OptionSelection
                {item}
                titleKey="attributes"
                localizationPrefix="hexaga"
                path="system.improvements.attributes.selected"
                choices={improvements.attributes.choices}
                selected={improvements.attributes.selected}
            />
        {/if}
        {#if item.type === "profession"}
            <OptionSelection
                {item}
                titleKey="skills"
                localizationPrefix="hexaga"
                path="system.improvements.skills.selected"
                choices={improvements.skills.choices}
                selected={improvements.skills.selected}
            />
        {/if}
    </div>
</section>
