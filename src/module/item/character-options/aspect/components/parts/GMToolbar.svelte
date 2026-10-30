<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let isEditable = false;
    export let gmOverrideMode = true;
</script>

{#if isEditable}
    <div class="gm-control-toolbar">
        <div class="toolbar-status">
            <i class="fas {gmOverrideMode ? 'fa-tools text-warn' : 'fa-eye text-info'}"></i>
            <span
                >Workspace Mode: <strong
                    >{gmOverrideMode ? "Configuration (Edit)" : "Player Preview (Read-Only)"}</strong
                ></span
            >
        </div>
        <button class="toggle-edit-btn" class:active-edit={gmOverrideMode} on:click={() => dispatch("toggleedit")}>
            <i class="fas {gmOverrideMode ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
            {gmOverrideMode ? "Disable Edit Mode" : "Enable Edit Mode"}
        </button>
    </div>
{/if}

<style>
    .gm-control-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #2d2d2d;
        border-bottom: 1px solid #444444;
        padding: 6px 12px;
        font-size: 0.85rem;
        box-sizing: border-box;
    }
    .toolbar-status {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .text-warn {
        color: #ff9f00;
    }
    .text-info {
        color: #00ccff;
    }
    .toggle-edit-btn {
        background: #3c3c3c;
        color: #dcdcdc;
        border: 1px solid #555555;
        padding: 4px 10px;
        cursor: pointer;
        border-radius: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: bold;
        transition: all 0.15s ease;
    }
    .toggle-edit-btn:hover {
        background: #4a4a4a;
        color: #fff;
    }
    .toggle-edit-btn.active-edit {
        background: rgba(255, 159, 0, 0.15);
        color: #ff9f00;
        border-color: #ff9f00;
    }
</style>
