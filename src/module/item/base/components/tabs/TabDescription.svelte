<script lang="ts">
    export let item: any;

    $: isEditable = item.isOwner;
    let isEditing = false;

    async function handleNativeSave(event: Event) {
        const proseMirrorElement = event.target as any;
        const content = proseMirrorElement.value;

        try {
            await item.update({ "system.description": content });
        } catch (error) {
            console.error("Error editing description", error);
        }

        isEditing = false;
    }
</script>

<section class="item-tab">
    <div class="description-editor">
        {#if isEditable}
            <div class="editor-controls-row">
                {#if !isEditing}
                    <button type="button" class="prose-edit-trigger" on:click={() => (isEditing = true)}>
                        <i class="fas fa-edit"></i> Edit Description
                    </button>
                {/if}
            </div>
        {/if}

        <div class="editor-viewport-canvas">
            {#if isEditable && isEditing}
                <prose-mirror
                    name="system.description"
                    value={item.system?.description ?? ""}
                    button="true"
                    toggled="false"
                    on:change={handleNativeSave}
                >
                </prose-mirror>
            {:else}
                {#await window.foundry.applications.ux.TextEditor.enrichHTML( item.system?.description ?? "", { async: true }, ) then enrichedHtml}
                    <div class="enriched-text-flow">
                        {@html enrichedHtml}
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
