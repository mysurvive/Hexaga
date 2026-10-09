<script>
    import { getContext } from "svelte";

    export let tabs;
    let activeTab = getContext("activeTab");
</script>

<nav class="sheet-tabs tabs">
    {#each tabs as tab}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <a
            class="sheet-tab-button"
            id={tab.id}
            class:active={$activeTab === tab.id}
            on:click={() => ($activeTab = tab.id)}
        >
            <label for={tab.id}>{window._loc(`${tab.labelPath}`)}</label>
        </a>
    {/each}
</nav>
