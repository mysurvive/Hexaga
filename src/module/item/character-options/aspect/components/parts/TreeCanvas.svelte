<script>
    import { createEventDispatcher } from "svelte";
    import TreeNode from "./TreeNode.svelte";
    const dispatch = createEventDispatcher();

    export let item = null;
    export let nodes = [];
    export let backgroundImage = "";
    export let activeEditingEnabled = false;
    export let selectedNodeUuid = null;
    export let draggedNodeUuid = null;
    export let activeX = 0;
    export let activeY = 0;

    let canvasElement;

    $: actor = item?.parent ?? null;
    $: aspectSlug = item?.system?.slug ?? "";
    $: reactiveItems = actor ? Array.from(actor.items) : [];
    $: ownedNodeUuids = new Set(
        reactiveItems
            .filter((i) => i.type === "aspectNode" && i.system?.aspectSlug === aspectSlug)
            .map((i) => i.system?.templateUuid),
    );
    $: isConnectionPathUnlocked = (sourceNodeUuid, targetNodeUuid) => {
        if (!actor) return false;
        return ownedNodeUuids.has(sourceNodeUuid) && ownedNodeUuids.has(targetNodeUuid);
    };

    function onMouseMove(e) {
        if (!activeEditingEnabled || !draggedNodeUuid) return;
        const rect = canvasElement.getBoundingClientRect();
        dispatch("canvasmousemove", { clientX: e.clientX, clientY: e.clientY, rect });
    }

    function getNodeCoords(node, targetUuid, currentDragUuid, tempX, tempY) {
        if (node.nodeUUID === targetUuid) {
            return {
                x: currentDragUuid === targetUuid ? tempX : node.posX,
                y: currentDragUuid === targetUuid ? tempY : node.posY,
            };
        }
        const found = nodes.find((n) => n.nodeUUID === targetUuid);
        if (!found) return { x: 0, y: 0 };
        return {
            x: currentDragUuid === targetUuid ? tempX : found.posX,
            y: currentDragUuid === targetUuid ? tempY : found.posY,
        };
    }

    function handleNodeInteraction(event, node) {
        dispatch("nodeselect", { node });

        if (activeEditingEnabled) {
            dispatch("nodemousedown", {
                event,
                node,
                rect: canvasElement.getBoundingClientRect(),
            });
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div
    bind:this={canvasElement}
    class="tree-canvas"
    class:view-only={!activeEditingEnabled}
    style="background-image: url('{backgroundImage || 'ui/parchment.jpg'}');"
    on:mousemove={onMouseMove}
    on:mouseup={() => dispatch("canvasmouseup")}
    on:mouseleave={() => dispatch("canvasmouseup")}
    on:dragover|preventDefault
    on:drop={(e) => dispatch("sidebardrop", { event: e, rect: canvasElement.getBoundingClientRect() })}
    on:click|self={() => dispatch("deselect")}
    role="application"
    aria-label="Talent Tree Canvas Workspace"
>
    <svg class="tree-connections-svg">
        <defs>
            <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        {#each nodes as node}
            {#if node.requirements && node.requirements.length > 0}
                {#each node.requirements as reqUuid}
                    {@const source = getNodeCoords(node, reqUuid, draggedNodeUuid, activeX, activeY)}
                    {@const target = getNodeCoords(node, node.nodeUUID, draggedNodeUuid, activeX, activeY)}
                    {@const isHighlighted = selectedNodeUuid === node.nodeUUID || selectedNodeUuid === reqUuid}
                    {@const isUnlocked = isConnectionPathUnlocked(reqUuid, node.nodeUUID)}

                    <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        class="connection-line"
                        class:line-highlighted={isHighlighted}
                        class:line-unlocked={isUnlocked}
                        filter={isHighlighted ? "url(#gold-glow)" : ""}
                    />
                {/each}
            {/if}
        {/each}
    </svg>

    {#each nodes as node (node.nodeUUID)}
        <TreeNode
            {node}
            {item}
            {reactiveItems}
            {activeEditingEnabled}
            isSelected={selectedNodeUuid === node.nodeUUID}
            isDragging={draggedNodeUuid === node.nodeUUID}
            {activeX}
            {activeY}
            on:nodemousedown={(e) => handleNodeInteraction(e.detail.event, e.detail.node)}
        />
    {/each}
</div>

<style lang="scss">
    .tree-canvas {
        position: relative;
        flex: 1;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        overflow: auto;
        background-color: #0b0b0b;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
    }

    .tree-connections-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;

        .connection-line {
            stroke: #5c4722;
            stroke-width: 3px;
            stroke-linecap: round;
            stroke-dasharray: 0;
            transition:
                stroke 0.15s,
                stroke-width 0.15s;

            &.line-highlighted {
                stroke: #ff9f00;
                stroke-width: 4px;
            }
            &.line-unlocked {
                stroke: #f49d37;
                stroke-width: 3.5px;
                box-shadow: 0 0 8px rgba(244, 157, 55, 0.5);
            }
        }
    }
</style>
