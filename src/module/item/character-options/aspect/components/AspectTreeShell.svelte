<script>
    import GMToolbar from "./parts/GMToolbar.svelte";
    import TreeCanvas from "./parts/TreeCanvas.svelte";
    import InspectorPanel from "./parts/InspectorPanel.svelte";
    import { refundAspectNode, purchaseAspectNode } from "../helpers.ts";

    export let item;
    export let isEditable = false;

    let gmOverrideMode = isEditable;

    $: activeEditingEnabled = isEditable && gmOverrideMode;
    $: treeData = item?.system?.tree || { nodes: [], backgroundImage: "" };
    $: actor = item?.parent || null;
    $: actorItems = actor?.items ? Array.from(actor.items) : [];
    $: ownedNodeUuids =
        actorItems.length > 0
            ? actorItems
                  .filter((i) => i.type === "aspectNode" && i.aspectSlug === item?.system?.slug)
                  .map((i) => i.templateUuid)
            : [];
    $: nodes = (treeData.nodes || []).map((node) => ({
        ...node,
        isUnlocked: ownedNodeUuids.includes(node.nodeUUID),
    }));

    let selectedNodeUuid = null;
    $: selectedNode = nodes.find((n) => n.nodeUUID === selectedNodeUuid) || null;

    let draggedNodeUuid = null;
    let activeX = 0;
    let activeY = 0;
    let dragOffset = { x: 0, y: 0 };

    function handleNodeMouseDown(e) {
        const { event, node, rect } = e.detail;
        selectedNodeUuid = node.nodeUUID;
        if (!activeEditingEnabled) return;

        draggedNodeUuid = node.nodeUUID;
        activeX = node.posX;
        activeY = node.posY;
        dragOffset.x = event.clientX - rect.left - node.posX;
        dragOffset.y = event.clientY - rect.top - node.posY;
    }

    function handleCanvasMouseMove(e) {
        const { clientX, clientY, rect } = e.detail;
        activeX = Math.round(clientX - rect.left - dragOffset.x);
        activeY = Math.round(clientY - rect.top - dragOffset.y);
    }

    async function handleCanvasMouseUp() {
        if (!activeEditingEnabled || !draggedNodeUuid) return;
        const updatedNodes = JSON.parse(JSON.stringify(nodes));
        const targetNode = updatedNodes.find((n) => n.nodeUUID === draggedNodeUuid);
        if (targetNode) {
            targetNode.posX = activeX;
            targetNode.posY = activeY;
            await item.update({ "system.tree.nodes": updatedNodes });
        }
        draggedNodeUuid = null;
    }

    async function handleSidebarDrop(e) {
        const { event, rect } = e.detail;
        try {
            const rawData = event.dataTransfer?.getData("text/plain");
            if (!rawData) return;
            const dragData = JSON.parse(rawData);

            if (dragData.type === "Item") {
                const sourceItem = await fromUuid(dragData.uuid);
                if (!sourceItem || sourceItem.type !== "aspectNode") return;
                if (nodes.some((n) => n.nodeUUID === dragData.uuid)) return;

                const newNode = {
                    nodeUUID: dragData.uuid,
                    posX: Math.round(event.clientX - rect.left),
                    posY: Math.round(event.clientY - rect.top),
                    requirements: [],
                };
                await item.update({ "system.tree.nodes": [...nodes, newNode] });
                selectedNodeUuid = dragData.uuid;
            }
        } catch (err) {}
    }

    async function handleManualMove(e) {
        const { axis, val } = e.detail;
        const updatedNodes = JSON.parse(JSON.stringify(nodes));
        const targetNode = updatedNodes.find((n) => n.nodeUUID === selectedNodeUuid);
        if (targetNode) {
            targetNode[axis] = Math.max(0, Math.round(val));
            await item.update({ "system.tree.nodes": updatedNodes });
        }
    }

    async function handleDeleteNode() {
        const updatedNodes = nodes.filter((n) => n.nodeUUID !== selectedNodeUuid);
        for (const node of updatedNodes) {
            node.requirements = node.requirements.filter((r) => r !== selectedNodeUuid);
        }
        selectedNodeUuid = null;
        await item.update({ "system.tree.nodes": updatedNodes });
    }

    async function handleUpdateDocument(e) {
        const { payload } = e.detail;
        await item.update(payload);
    }

    async function handleNodePurchaseRequest(event) {
        const targetCanvasNode = event.detail.node;
        const actorContext = item.parent;

        if (!actorContext) {
            ui.notifications?.warn(
                "Cannot process investments on a master template. Drag this Aspect tree onto a Character Sheet first.",
            );
            return;
        }

        try {
            const success = await purchaseAspectNode(actorContext, item, targetCanvasNode);
            if (success) {
                selectedNodeUuid = selectedNodeUuid;
                item = item;
            }
        } catch (error) {
            console.error("Aspect Purchase Crash:", error);
        }
    }

    async function handleNodeRefundRequest(e) {
        const targetCanvasNode = e.detail.node;
        const actorContext = item.parent;
        if (!actorContext) return;

        try {
            const success = await refundAspectNode(actorContext, item, targetCanvasNode.nodeUUID);
            if (success) {
                selectedNodeUuid = null;
                item = item;
            }
        } catch (error) {
            console.error("Aspect Refund Crash:", error);
        }
    }
</script>

<div class="aspect-tree-wrapper">
    <GMToolbar
        {isEditable}
        {gmOverrideMode}
        on:toggleedit={() => {
            gmOverrideMode = !gmOverrideMode;
            selectedNodeUuid = null;
        }}
    />

    <div class="workspace-layout">
        <TreeCanvas
            {item}
            {nodes}
            backgroundImage={item?.system?.tree?.backgroundImage}
            {activeEditingEnabled}
            {selectedNodeUuid}
            {draggedNodeUuid}
            {activeX}
            {activeY}
            on:nodemousedown={handleNodeMouseDown}
            on:canvasmousemove={handleCanvasMouseMove}
            on:canvasmouseup={handleCanvasMouseUp}
            on:sidebardrop={handleSidebarDrop}
            on:deselect={() => (selectedNodeUuid = null)}
            on:nodeselect={(e) => (selectedNodeUuid = e.detail.node.nodeUUID)}
        />

        <InspectorPanel
            {item}
            {selectedNode}
            {activeEditingEnabled}
            {activeX}
            {activeY}
            isDraggingThisNode={draggedNodeUuid === selectedNodeUuid}
            on:manualmove={handleManualMove}
            on:deletenode={handleDeleteNode}
            on:updatedocument={handleUpdateDocument}
            on:nodepurchase={handleNodePurchaseRequest}
            on:noderefund={handleNodeRefundRequest}
        />
    </div>
</div>

<style>
    .aspect-tree-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 500px;
        background: #1a1a1a;
        color: #e0e0e0;
        font-family: var(--font-primary, sans-serif);
    }
    .workspace-layout {
        display: flex;
        flex: 1;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
