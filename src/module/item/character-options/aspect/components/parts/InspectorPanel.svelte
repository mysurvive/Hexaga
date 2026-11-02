<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let item;
    export let selectedNode = null;
    export let activeEditingEnabled = false;
    export let activeX = 0;
    export let activeY = 0;
    export let isDraggingThisNode = false;

    $: nodes = item?.system?.tree?.nodes ?? [];
    $: globalHpPerNode = item?.system?.hpPerNode ?? 0;
    $: globalBackgroundImage = item?.system?.tree?.backgroundImage ?? "";
    $: isAttachedToActor = item?.parent !== null;
    $: aspectSlug = item?.system?.slug ?? "";
    $: totalPurchasedNodesCount = isAttachedToActor
        ? nodes.filter((node) =>
              item?.parent?.items?.some(
                  (i) =>
                      i.type === "aspectNode" &&
                      i.system?.aspectSlug === aspectSlug &&
                      i.system?.templateUuid === node.nodeUUID,
              ),
          ).length
        : 0;
    $: compiledTotalHpBonus = totalPurchasedNodesCount * globalHpPerNode;
    $: isAlreadyOwned = isAttachedToActor
        ? (item?.parent?.items?.some(
              (i) =>
                  i.type === "aspectNode" &&
                  i.system?.aspectSlug === aspectSlug &&
                  i.system?.templateUuid === selectedNode?.nodeUUID,
          ) ?? false)
        : false;
    $: actorLevel = isAttachedToActor ? (item?.parent?.system?.details?.level ?? 1) : 1;
    $: levelRequirementMet = actorLevel >= (selectedNode?.requiredLevel || 1);
    $: prerequisitesMet = isAttachedToActor
        ? (selectedNode?.requirements?.every((reqUuid) =>
              item?.parent?.items?.some(
                  (i) =>
                      i.type === "aspectNode" &&
                      i.system?.aspectSlug === aspectSlug &&
                      i.system?.templateUuid === reqUuid,
              ),
          ) ?? true)
        : true;
    $: canBePurchased = isAttachedToActor && !isAlreadyOwned && levelRequirementMet && prerequisitesMet;
    $: if (nodes) {
        resolveAllCanvasNodeNames(nodes);
    }
    $: if (selectedNode) {
        resolveFullNodeItem(selectedNode.nodeUUID);
    } else {
        resolvedNodeItem = null;
    }

    let resolvedNodeItem = null;
    let isLoadingMeta = false;
    let nameCache = {};

    async function resolveFullNodeItem(uuid) {
        isLoadingMeta = true;
        try {
            const doc = await fromUuid(uuid);
            resolvedNodeItem = doc || null;
        } catch (e) {
            resolvedNodeItem = null;
        } finally {
            isLoadingMeta = false;
        }
    }

    async function resolveAllCanvasNodeNames(canvasNodes) {
        let cacheUpdated = false;
        for (const node of canvasNodes) {
            if (node.nodeUUID && !nameCache[node.nodeUUID]) {
                nameCache[node.nodeUUID] = "Loading...";
                try {
                    const doc = await fromUuid(node.nodeUUID);
                    nameCache[node.nodeUUID] = doc ? doc.name : "Unknown Node";
                } catch (e) {
                    nameCache[node.nodeUUID] = "Error Loading";
                }
                cacheUpdated = true;
            }
        }
        if (cacheUpdated) {
            nameCache = { ...nameCache };
        }
    }

    function openNodeSheet() {
        if (resolvedNodeItem?.sheet) {
            resolvedNodeItem.sheet.render(true);
        } else {
            ui.notifications?.warn("Could not open the sheet. Referenced document is missing.");
        }
    }

    function browseCanvasBackground() {
        const FilePickerV2 = foundry.applications.apps.FilePicker.implementation;
        new FilePickerV2({
            type: "image",
            current: globalBackgroundImage,
            callback: (path) => {
                dispatch("updatedocument", { payload: { "system.tree.backgroundImage": path } });
            },
        }).browse();
    }

    async function togglePrerequisite(targetUuid) {
        if (!selectedNode) return;
        let currentReqs = [...(selectedNode.requirements || [])];
        if (currentReqs.includes(targetUuid)) {
            currentReqs = currentReqs.filter((id) => id !== targetUuid);
        } else {
            currentReqs.push(targetUuid);
        }

        const updatedNodes = JSON.parse(JSON.stringify(nodes));
        const targetNode = updatedNodes.find((n) => n.nodeUUID === selectedNode.nodeUUID);
        if (targetNode) {
            targetNode.requirements = currentReqs;
            dispatch("updatedocument", { payload: { "system.tree.nodes": updatedNodes } });
        }
    }

    async function updateNodeProperty(field, value) {
        if (!selectedNode) return;
        const updatedNodes = JSON.parse(JSON.stringify(nodes));
        const targetNode = updatedNodes.find((n) => n.nodeUUID === selectedNode.nodeUUID);
        if (targetNode) {
            targetNode[field] = value;
            dispatch("updatedocument", { payload: { "system.tree.nodes": updatedNodes } });
        }
    }
</script>

<aside class="inspector-panel">
    <h3>{selectedNode ? "Node Details" : "Aspect Properties"}</h3>
    <div class="inspector-content">
        {#if selectedNode}
            {#if isLoadingMeta}
                <div class="empty-state"><p><i class="fas fa-spinner fa-spin"></i> Resolving data...</p></div>
            {:else if resolvedNodeItem}
                <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
                <div
                    class="node-profile interactive-header"
                    on:click={openNodeSheet}
                    title="Click to open full Node Sheet"
                >
                    <img src={resolvedNodeItem.img} alt={resolvedNodeItem.name} class="inspector-thumb" />
                    <div class="node-meta-text">
                        <span class="node-name">{resolvedNodeItem.name}</span>
                        <span class="open-sheet-link"><i class="fas fa-external-link-alt"></i> Open Sheet</span>
                    </div>
                </div>

                <div class="node-gameplay-details">
                    <div class="detail-row row-inline">
                        <span class="lbl">Required Level:</span>
                        <span class="val level-badge" class:error-text={!levelRequirementMet}
                            >Lv. {selectedNode.requiredLevel || 1}</span
                        >
                    </div>

                    <div class="detail-row">
                        <span class="lbl">Prerequisites:</span>
                        {#if selectedNode.requirements && selectedNode.requirements.length > 0}
                            <div class="prereq-tags">
                                {#each selectedNode.requirements as reqUuid}
                                    <span class="prereq-tag">{nameCache[reqUuid] || "Loading..."}</span>
                                {/each}
                            </div>
                        {:else}
                            <span class="val-none">None (Root Node)</span>
                        {/if}
                    </div>

                    {#if resolvedNodeItem.system?.description}
                        <div class="detail-row">
                            <span class="lbl">Description:</span>
                            <div class="rule-text-block">
                                {@html resolvedNodeItem.system.description}
                            </div>
                        </div>
                    {/if}

                    {#if !activeEditingEnabled}
                        <div class="purchase-action-container">
                            {#if isAlreadyOwned}
                                <button
                                    class="purchase-btn status-owned"
                                    on:click={() => dispatch("noderefund", { node: selectedNode })}
                                >
                                    <span class="btn-text-default"><i class="fas fa-check-circle"></i> Unlocked</span>
                                    <span class="btn-text-hover"><i class="fas fa-undo"></i> Refund Node</span>
                                </button>
                            {:else}
                                <button
                                    class="purchase-btn"
                                    disabled={!canBePurchased}
                                    on:click={() => dispatch("nodepurchase", { node: selectedNode })}
                                >
                                    <i class="fas fa-plus-circle"></i> Unlock Aspect Node
                                </button>

                                {#if !prerequisitesMet}
                                    <span class="validation-error-notice"
                                        ><i class="fas fa-lock"></i> Missing required prerequisite aspect nodes.</span
                                    >
                                {:else if !levelRequirementMet}
                                    <span class="validation-error-notice"
                                        ><i class="fas fa-shield-alt"></i> Character Level too low (Requires Lv. {selectedNode.requiredLevel}).</span
                                    >
                                {/if}
                            {/if}
                        </div>
                    {/if}
                </div>

                {#if activeEditingEnabled}
                    <div class="action-divider"></div>
                    <div class="gm-spatial-group">
                        <h4>Canvas Mapping Settings</h4>

                        <div class="form-group">
                            <label for="level-req-input">Level Requirement</label>
                            <input
                                id="level-req-input"
                                type="number"
                                min="1"
                                value={selectedNode.requiredLevel || 1}
                                on:change={(e) =>
                                    updateNodeProperty("requiredLevel", Math.max(1, Number(e.currentTarget.value)))}
                            />
                        </div>

                        <div class="form-group">
                            <label for="prereq-select">Assign Prerequisites</label>
                            <div class="prereq-selector-list">
                                {#each nodes.filter((n) => n.nodeUUID !== selectedNode.nodeUUID) as rawNode}
                                    <label class="checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={selectedNode.requirements?.includes(rawNode.nodeUUID)}
                                            on:change={() => togglePrerequisite(rawNode.nodeUUID)}
                                        />
                                        <span class="checkbox-label-text"
                                            >{nameCache[rawNode.nodeUUID] || "Loading..."}</span
                                        >
                                    </label>
                                {/each}
                                {#if nodes.length <= 1}
                                    <span class="val-none">No other nodes available on canvas.</span>
                                {/if}
                            </div>
                        </div>

                        <div class="form-group grid-coords">
                            <div class="coord-input">
                                <label for="pos-x-input">X (px)</label>
                                <input
                                    id="pos-x-input"
                                    type="number"
                                    value={isDraggingThisNode ? activeX : selectedNode.posX}
                                    on:change={(e) =>
                                        dispatch("manualmove", { axis: "posX", val: Number(e.currentTarget.value) })}
                                />
                            </div>
                            <div class="coord-input">
                                <label for="pos-y-input">Y (px)</label>
                                <input
                                    id="pos-y-input"
                                    type="number"
                                    value={isDraggingThisNode ? activeY : selectedNode.posY}
                                    on:change={(e) =>
                                        dispatch("manualmove", { axis: "posY", val: Number(e.currentTarget.value) })}
                                />
                            </div>
                        </div>

                        <button class="delete-btn" on:click={() => dispatch("deletenode")}>
                            <i class="fas fa-trash"></i> Delete Node From Tree
                        </button>
                    </div>
                {/if}
            {:else}
                <div class="empty-state err-state">
                    <p><i class="fas fa-exclamation-triangle"></i> Broken Node Reference.</p>
                    {#if activeEditingEnabled}
                        <button class="delete-btn" on:click={() => dispatch("deletenode")}>Remove Broken Link</button>
                    {/if}
                </div>
            {/if}
        {:else if activeEditingEnabled}
            <div class="global-config-pane">
                <div class="form-group">
                    <label for="hp-node-input">Bonus HP Per Active Node</label>
                    <input
                        id="hp-node-input"
                        type="number"
                        min="0"
                        value={globalHpPerNode}
                        on:change={(e) =>
                            dispatch("updatedocument", {
                                payload: { "system.hpPerNode": Number(e.currentTarget.value) },
                            })}
                    />
                </div>

                <div class="form-group">
                    <label for="bg-image-input">Canvas Background Image</label>
                    <div class="file-picker-row">
                        <input
                            id="bg-image-input"
                            type="text"
                            value={globalBackgroundImage}
                            on:change={(e) =>
                                dispatch("updatedocument", {
                                    payload: { "system.tree.backgroundImage": e.currentTarget.value },
                                })}
                        />
                        <button class="picker-btn" title="Browse Files" on:click={browseCanvasBackground}
                            ><i class="fas fa-file-import"></i></button
                        >
                    </div>
                </div>
            </div>
        {:else}
            <div class="player-aspect-summary-pane">
                <h4>Path Progression</h4>

                <div class="stat-display-card">
                    <div class="stat-row">
                        <span class="label">Scale Rate:</span>
                        <span class="value font-highlight">+{globalHpPerNode} Max HP / Node</span>
                    </div>
                    <div class="stat-row">
                        <span class="label">Unlocked Nodes:</span>
                        <span class="value font-subtle">{totalPurchasedNodesCount} / {nodes.length}</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-row total-yield-row">
                        <span class="label">Total HP Bonus:</span>
                        <span class="value hp-total-badge">+{compiledTotalHpBonus} HP</span>
                    </div>
                </div>

                <p class="flavor-notice">
                    Select any individual aspect node on the canvas to inspect its custom mechanical behaviors and
                    rules.
                </p>
            </div>
        {/if}
    </div>
</aside>

<style lang="scss">
    $color-platinum: #cfdbd5;
    $color-alabaster: #e8eddf;
    $color-orange: #f49d37;
    $color-jet: #242423;
    $color-charcoal: #333533;
    $color-crimson: #a23944;

    .inspector-panel {
        width: 260px;
        background: #222;
        border-left: 1px solid #444;
        padding: 12px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow-y: auto;
        h3 {
            margin: 0 0 12px 0;
            padding-bottom: 6px;
            font-size: 1rem;
            border-bottom: 1px solid #444;
            color: #dfdfdf;
        }
    }
    .inspector-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .node-profile {
        display: flex;
        gap: 10px;
        align-items: center;
        background: rgba(0, 0, 0, 0.2);
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #333;
        &.interactive-header {
            cursor: pointer;
            transition:
                background 0.15s,
                border-color 0.15s;
            &:hover {
                background: rgba(255, 159, 0, 0.08);
                border-color: $color-orange;
            }
        }
    }
    .inspector-thumb {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border: 1px solid #555;
        border-radius: 4px;
    }
    .node-meta-text {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        .node-name {
            font-weight: bold;
            font-size: 0.95rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #fff;
        }
        .open-sheet-link {
            font-size: 0.75rem;
            color: $color-orange;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 2px;
        }
    }

    .node-gameplay-details {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(0, 0, 0, 0.15);
        padding: 10px;
        border-radius: 4px;
    }
    .rule-text-block {
        background: rgba(0, 0, 0, 0.3);
        padding: 6px 8px;
        border-radius: 4px;
        border-left: 2px solid $color-orange;
        font-size: 0.85rem;
        line-height: 1.4;
        color: #cbd5e1;
        max-height: 150px;
        overflow-y: auto;
    }

    .gm-spatial-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(255, 159, 0, 0.03);
        border: 1px dashed rgba(255, 159, 0, 0.2);
        padding: 10px;
        border-radius: 4px;
        h4 {
            margin: 0;
            font-size: 0.8rem;
            color: $color-orange;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        label {
            font-size: 0.8rem;
            color: #b5b5b5;
        }
        input {
            background: #111;
            color: #fff;
            border: 1px solid #444;
            padding: 4px 8px;
            border-radius: 3px;
            font-family: monospace;
        }
    }
    .grid-coords {
        flex-direction: row !important;
        gap: 8px;
        .coord-input {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            label {
                font-size: 0.75rem;
                color: #888;
            }
        }
    }

    .prereq-selector-list {
        background: #111;
        border: 1px solid #444;
        border-radius: 3px;
        max-height: 110px;
        overflow-y: auto;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        .checkbox-row {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 3px 4px;
            cursor: pointer;
            border-radius: 2px;
            font-size: 0.8rem;
            &:hover {
                background: rgba(255, 159, 0, 0.06);
            }
            input {
                margin: 0;
                cursor: pointer;
            }
            .checkbox-label-text {
                color: #ccc;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }

    .prereq-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 2px;
        .prereq-tag {
            background: rgba($color-orange, 0.15);
            color: $color-orange;
            border: 1px solid rgba($color-orange, 0.4);
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 0.75rem;
            font-weight: 500;
        }
    }

    .purchase-action-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 8px;
    }

    .purchase-btn {
        width: 100%;
        background: $color-orange;
        color: $color-jet;
        border: 1px solid rgba(0, 0, 0, 0.2);
        padding: 8px;
        font-weight: bold;
        font-size: 0.9rem;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition:
            background 0.15s,
            opacity 0.15s;
        &:hover:not(:disabled) {
            background: lighten($color-orange, 8%);
        }
        &:disabled {
            background: #444;
            color: #888;
            cursor: not-allowed;
            opacity: 0.6;
        }
        &.status-owned {
            background: #10b981;
            color: #fff;
            opacity: 1;

            .btn-text-hover {
                display: none;
            }
            .btn-text-default {
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            &:hover {
                background: #a23944;
                border-color: #ef4444;

                .btn-text-default {
                    display: none;
                }
                .btn-text-hover {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
            }
        }
    }

    .validation-error-notice {
        font-size: 0.75rem;
        color: #ef4444;
        display: flex;
        align-items: center;
        gap: 4px;
        line-height: 1.3;
        font-style: italic;
    }
    .error-text {
        color: #ef4444 !important;
        border-color: #ef4444 !important;
    }

    .action-divider {
        height: 1px;
        background: #444;
        margin: 4px 0;
    }
    .delete-btn {
        background: $color-crimson;
        color: #fff;
        border: 1px solid #903d47;
        padding: 6px;
        cursor: pointer;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: bold;
        font-size: 0.8rem;
        margin-top: 4px;
        &:hover {
            background: #a23944;
        }
    }
    .global-config-pane {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }
    .file-picker-row {
        display: flex;
        gap: 4px;
        input {
            flex: 1;
            min-width: 0;
        }
    }
    .picker-btn {
        background: #333;
        color: $color-orange;
        border: 1px solid #444;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 3px;
        &:hover {
            background: #444;
            color: #fff;
        }
    }
    .detail-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
        .lbl {
            color: #94a3b8;
            font-size: 0.8rem;
            font-weight: 500;
        }
        &.row-inline {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }
    }
    .val-none {
        color: #555;
        font-size: 0.8rem;
        font-style: italic;
        padding: 2px 0;
    }

    .player-aspect-summary-pane {
        display: flex;
        flex-direction: column;
        gap: 12px;
        h4 {
            margin: 0;
            font-size: 0.85rem;
            color: $color-orange;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba($color-charcoal, 0.5);
            padding-bottom: 4px;
        }
    }
    .stat-display-card {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba($color-charcoal, 0.6);
        border-radius: 4px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            .label {
                color: rgba($color-alabaster, 0.6);
            }
            .value {
                font-family: monospace;
                font-weight: 500;
            }
            .font-highlight {
                color: $color-platinum;
            }
            .font-subtle {
                color: rgba($color-platinum, 0.7);
            }
        }
        .stat-divider {
            height: 1px;
            background: rgba($color-charcoal, 0.6);
            margin: 4px 0;
        }
        .total-yield-row {
            font-size: 0.9rem;
            font-weight: bold;
            .label {
                color: $color-alabaster;
            }
        }
    }
    .hp-total-badge {
        background: rgba($color-orange, 0.12);
        color: $color-orange;
        border: 1px solid rgba($color-orange, 0.4);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-family: monospace;
        font-weight: bold;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }
    .level-badge {
        background: #1e1b4b;
        color: #818cf8;
        border: 1px solid #4338ca;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.8rem;
        font-family: monospace;
    }
    .flavor-notice {
        margin: 0;
        color: #666;
        font-style: italic;
        font-size: 0.8rem;
        line-height: 1.3;
    }
    .empty-state {
        color: #777;
        font-size: 0.85rem;
        text-align: center;
        margin: auto 0;
        line-height: 1.4;
        padding: 10px;
        &.err-state {
            color: #ef4444;
        }
    }
</style>
