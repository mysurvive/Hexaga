<script lang="ts">
    export let item: any;

    $: isEditable = item.isOwner;
    let isEditing = false;
</script>

<section class="item-tab">
    <div class="description-editor">
        {#if isEditable}
            <div class="editor-controls-row">
                {#if !isEditing}
                    <button type="button" class="prose-edit-trigger" on:click={() => (isEditing = true)}>
                        <i class="fas fa-edit"></i> Edit Description
                    </button>
                {:else}
                    <button type="button" class="prose-edit-trigger save-btn" on:click={() => (isEditing = false)}>
                        <i class="fas fa-save"></i> Save & Lock
                    </button>
                {/if}
            </div>
        {/if}

        <div class="editor-viewport-canvas">
            {#if isEditable && isEditing}
                <prose-mirror
                    name="system.description"
                    button="false"
                    toggled="true"
                    value={item.system?.description ?? ""}
                >
                </prose-mirror>
            {:else}
                {#await window.foundry.applications.ux.TextEditor.enrichHTML( item.system?.description ?? "", { async: true }, ) then enrichedHtml}
                    <div class="enriched-text-flow">
                        {@html enrichedHtml || `<em>No description provided.</em>`}
                    </div>
                {/await}
            {/if}
        </div>
    </div>
</section>

<style lang="scss">
    .description-editor {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        gap: 6px;

        .editor-controls-row {
            display: flex;
            justify-content: flex-end;
        }

        .prose-edit-trigger {
            background: rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.15);
            padding: 4px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;

            &:hover {
                background: rgba(0, 0, 0, 0.1);
            }

            &.save-btn {
                background: rgba(40, 167, 69, 0.1);
                border-color: rgba(40, 167, 69, 0.3);

                &:hover {
                    background: rgba(40, 167, 69, 0.2);
                }
            }
        }

        .editor-viewport-canvas {
            flex: 1;
            min-height: 200px;

            .enriched-text-flow {
                padding: 6px;
                line-height: 1.5;
            }
        }
    }
</style>
