<script>
    import { evaluateAspectProgression } from "../../../../item/character-options/aspect/helpers.ts";

    export let actor;
    export let sheetData;

    $: levels = Array.from({ length: actor.system.level ?? 1 }, (_, index) => index + 1);
    $: levelContext = sheetData.currentLevelContext;
    $: updateTrigger = actor?.apps ? Object.keys(actor.apps).length : 0;
    $: items = actor?.items ? Array.from(actor.items) : [];
    $: aspectTrees = items.filter((i) => i.type === "aspect");
    $: ownedNodes = items.filter((i) => i.type === "aspectNode");
    $: wallet = (() => {
        const _dummy = updateTrigger;
        return evaluateAspectProgression(actor, items);
    })();
    $: getPurchasedNodes = (treeItem) => {
        const aspectSlug = treeItem?.system?.slug;
        if (!aspectSlug) return [];
        return ownedNodes.filter((i) => i.system?.aspectSlug === aspectSlug);
    };

    function getTreeBg(treeItem) {
        return treeItem.system?.tree?.backgroundImage || "systems/hexaga/assets/default_tree_bg.webp";
    }

    function handleOpenAspectSheet(treeItem) {
        if (!treeItem) return;
        treeItem.sheet.render(true, { levelContext: levelContext });
    }

    function handleOpenNodeSheet(nodeItem) {
        if (!nodeItem || !nodeItem.sheet) return;
        nodeItem.sheet.render(true);
    }

    async function handleDeleteAspectTree(treeItem) {
        if (!treeItem) return;

        const originSource = treeItem.getFlag("hexaga", "grantedBy");
        if (originSource) {
            ui.notifications?.warn(`Cannot delete this Aspect tree: It is currently granted by your ${originSource}.`);
            return;
        }

        const confirmDelete = await foundry.applications.api.DialogV2.confirm({
            title: `Abandon Aspect: ${treeItem.name}`,
            content: `<p>Are you sure you want to abandon the <strong>${treeItem.name}</strong> aspect?</p>
                     <p class="warning">This will completely remove the aspect and refund any spent aspect nodes.</p>`,
            defaultYes: false,
        });

        if (!confirmDelete) return;

        const itemsToDelete = [treeItem.id];
        const aspectSlug = treeItem.system?.slug;

        if (aspectSlug) {
            const nestedMilestones = ownedNodes.filter((n) => n.system?.aspectSlug === aspectSlug);
            nestedMilestones.forEach((n) => itemsToDelete.push(n.id));
        }

        try {
            await actor.deleteEmbeddedDocuments("Item", itemsToDelete);
        } catch (error) {
            console.error("Aspect transaction failure:", error);
            ui.notifications?.error("Failed to delete the selected Aspect components.");
        }
    }
</script>

<div class="aspect-progression-summary-bar">
    <div class="wallet-metrics">
        <div
            class="summary-metric-pill emphasis-points"
            class:insufficient-points={wallet.nodes[`level${levelContext}`]?.available === 0 ?? true}
        >
            <span class="metric-label">Aspect Points Available For Level {levelContext}:</span>
            <span class="metric-value"
                >{wallet.nodes[`level${levelContext}`]?.available ?? "ERR"}
                <span class="metric-max-label">/ {wallet.nodes[`level${levelContext}`]?.allowed ?? "ERR"}</span></span
            >
        </div>
        <div class="summary-metric-pill emphasis-points" class:insufficient-points={wallet.nodes.available === 0}>
            <span class="metric-label">Total Aspect Points Available:</span>
            <span class="metric-value"
                >{wallet.nodes.total.available}
                <span class="metric-max-label">/ {wallet.nodes.total.allowed}</span></span
            >
        </div>
    </div>
    <div class="level-context-buttons">
        Level:
        {#each levels as level}
            <label class="level-radio-wrapper">
                <input type="radio" name="level-context" value={level} bind:group={sheetData.currentLevelContext} />
                <span>{level}</span>
            </label>
        {/each}
    </div>
</div>

<div class="tab-aspects-grid-layout">
    {#each aspectTrees as tree}
        {@const purchasedNodes = getPurchasedNodes(tree)}
        {@const bgImage = getTreeBg(tree)}

        <div class="aspect-card-frame">
            <div class="aspect-compact-banner-wrapper">
                <button
                    type="button"
                    class="aspect-compact-banner"
                    on:click={() => handleOpenAspectSheet(tree)}
                    style="background-image: url('{bgImage}');"
                    title="Click to open full talent tree"
                >
                    <img src={tree.img} alt={tree.name} class="aspect-icon" />
                    <span class="aspect-title">{tree.name}</span>
                    <i class="fas fa-external-link-alt launch-indicator"></i>
                </button>

                {#if !tree.getFlag("hexaga", "grantedBy")}
                    <button
                        type="button"
                        class="aspect-dismiss-action-btn"
                        on:click|stopPropagation={() => handleDeleteAspectTree(tree)}
                        title="Abandon this aspect"
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                {/if}
            </div>

            <div class="purchased-nodes-list">
                {#each purchasedNodes as node}
                    <button
                        type="button"
                        class="node-leaf-item clickable-leaf"
                        on:click={() => handleOpenNodeSheet(node)}
                        title="Click to view aspect node details"
                    >
                        <i class="fas fa-caret-right leaf-accent"></i>
                        <span>{node.name || node.slug}</span>
                        <i class="fas fa-search-plus leaf-inspect-icon"></i>
                    </button>
                {:else}
                    <div class="node-leaf-item empty">
                        <span>No Aspect Nodes Unlocked</span>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <div class="empty-tree-state">
            <i class="fas fa-network-wired empty-icon"></i>
            <p>No Aspects have been added to this character.</p>
            <p class="subtext">Drop an Aspect onto this sheet to initialize your layout.</p>
        </div>
    {/each}
</div>

<style lang="scss">
    .aspect-progression-summary-bar {
        border-bottom: 1px solid #333533;
        margin-bottom: 8px;

        .wallet-metrics {
            display: flex;
            gap: 12px;
            width: 100%;
            margin-top: 12px;
            margin-bottom: 4px;
            padding-bottom: 8px;
        }

        .level-context-buttons {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;

            input[type="radio"] {
                position: absolute;
                opacity: 0;
                width: 0;
                height: 0;
            }

            span {
                display: inline-flex;
                cursor: pointer;
                position: relative;
                border: 1px solid #f49d37;
                width: 24px;
                height: 24px;
                justify-content: center;
                align-items: center;
                color: #8c8c8a;
            }

            input[type="radio"]:checked + span {
                background-color: #f49d37;
                color: #242423;
                font-weight: 600;
            }
        }
    }

    .summary-metric-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background-color: #1e1e1d;
        border: 1px solid #333533;
        font-size: 0.85rem;
        color: #cfdbd5;
        border-radius: 2px;

        .metric-label {
            color: #8c8c8a;
        }

        .metric-value {
            font-weight: bold;
            color: #e8eddf;
        }

        &.emphasis-points {
            border-color: #f49d37;

            .metric-value {
                color: #f49d37;
            }
            .metric-max-label {
                font-size: 0.75rem;
                color: #8c8c8a;
                font-weight: normal;
            }
        }

        &.insufficient-points {
            border-color: #333533;
            .metric-value {
                color: #6a6a68;
            }
        }
    }

    .tab-aspects-grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        width: 100%;
        overflow-y: auto;
        box-sizing: border-box;
    }

    .aspect-card-frame {
        display: flex;
        flex-direction: column;
        border: 2px solid #333533;
        background-color: #242423;
        height: fit-content;
    }

    .aspect-compact-banner-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        align-items: center;

        &:hover {
            .aspect-dismiss-action-btn {
                opacity: 0.5;
            }
        }
    }

    .aspect-compact-banner {
        border: none;
        flex-grow: 1;
        height: 48px;
        padding: 0 12px;
        padding-right: 48px !important;
        cursor: pointer;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transition:
            border-color 0.2s ease,
            filter 0.2s ease;

        &:hover {
            filter: brightness(1.15);

            .launch-indicator {
                color: #f49d37;
                opacity: 1;
            }
        }

        .aspect-icon {
            width: 22px;
            height: 22px;
            border: 1px solid #333533;
            background-color: #242423;
            flex-shrink: 0;
        }

        .aspect-title {
            color: #e8eddf;
            font-weight: bold;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-shadow:
                1px 1px 2px rgba(0, 0, 0, 1),
                -1px -1px 2px rgba(0, 0, 0, 1),
                1px -1px 2px rgba(0, 0, 0, 1),
                -1px 1px 2px rgba(0, 0, 0, 1);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 75%;
        }

        .launch-indicator {
            position: absolute;
            right: 12px;
            color: #cfdbd5;
            font-size: 0.75rem;
            opacity: 0.4;
            transition: all 0.2s ease;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 1);
        }
    }

    .aspect-dismiss-action-btn {
        position: absolute;
        right: 32px;
        z-index: 5;
        background: transparent;
        border: none;
        color: #ff4a4a;
        font-size: 0.85rem;
        cursor: pointer;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition:
            opacity 0.2s ease,
            color 0.2s ease,
            transform 0.15s ease;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);

        &:hover {
            opacity: 1 !important;
            transform: scale(1.15);
            color: #ff6b6b;
        }

        &:active {
            transform: scale(0.95);
        }
    }

    .purchased-nodes-list {
        display: flex;
        flex-direction: column;
        border-top: 2px solid #333533;
        margin-left: 18px;
        background-color: #1e1e1d;
        border-left: 2px solid #333533;

        .node-leaf-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-bottom: 1px solid #2d2f2d;
            font-size: 0.85rem;
            color: #cfdbd5;
            width: 100%;
            background: transparent;
            border-left: none;
            border-right: none;
            border-top: none;

            &:last-child {
                border-bottom: none;
            }

            .leaf-accent {
                color: #f49d37;
                font-size: 0.7rem;
                flex-shrink: 0;
            }

            &.empty {
                color: #6a6a68;
                font-style: italic;
                font-size: 0.8rem;
                justify-content: flex-start;
            }
        }

        .clickable-leaf {
            cursor: pointer;
            position: relative;
            text-align: left;
            justify-content: flex-start;
            transition:
                background-color 0.2s ease,
                color 0.2s ease;

            &:hover {
                background-color: rgba(255, 255, 255, 0.04);
                color: #e8eddf;

                .leaf-inspect-icon {
                    opacity: 0.6;
                }
            }

            .leaf-inspect-icon {
                position: absolute;
                right: 10px;
                font-size: 0.7rem;
                color: #cfdbd5;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
        }
    }

    .empty-tree-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        text-align: center;
        color: #cfdbd5;
        border: 2px dashed #333533;
        background-color: #242423;

        .empty-icon {
            font-size: 2.5rem;
            color: #333333;
            margin-bottom: 12px;
        }

        .subtext {
            font-size: 0.8rem;
            color: #8c8c8a;
            margin-top: 6px;
        }
    }
</style>
