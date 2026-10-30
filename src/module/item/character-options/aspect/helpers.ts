import { ActorHex } from "../../../actor/base/baseActor.ts";

export interface CanvasNodeConnector {
    nodeUUID: string;
    posX: number;
    posY: number;
    requirements: string[];
    requiredLevel: number;
    name?: string;
    img?: string;
}

export interface ProgressionWallet {
    trees: { allocated: number; used: number; available: number };
    nodes: { allocated: number; used: number; available: number };
}

export function evaluateAspectProgression(actor: ActorHex) {
    const characterLevel: number = actor.system?.level ?? 1;
    const registeredSelections = actor.system.improvements.map((i) => i.aspects) || [];
    const totalOwnedAspects = actor.items.filter((i) => i.type === "aspect") || [];
    const grantedAspectsCount = totalOwnedAspects.filter((i) => i.getFlag("hexaga", "grantedBy") !== undefined).length;
    const manuallyChosenAspectsCount = totalOwnedAspects.filter((i) => !i.getFlag("hexaga", "grantedBy")).length;
    const allowedVariantTreeSlots = 1;
    const availableVariantTreeSlots = Math.max(0, allowedVariantTreeSlots - manuallyChosenAspectsCount);
    const totalAllowedNodePoints = 3 + (characterLevel - 1) * 2;
    const ownedNodes = actor.items?.filter((i) => i.type === "aspectNode") || [];
    const totalSpentNodePoints = ownedNodes.length;
    const availableNodePoints = Math.max(0, totalAllowedNodePoints - totalSpentNodePoints);
    return {
        trees: {
            granted: grantedAspectsCount,
            chosen: manuallyChosenAspectsCount,
            allowedVariant: allowedVariantTreeSlots,
            availableSlots: availableVariantTreeSlots,
        },
        nodes: { allowed: totalAllowedNodePoints, spent: totalSpentNodePoints, available: availableNodePoints },
    };
}

export async function purchaseAspectNode(actor: any, aspectTree: any, canvasNode: any): Promise<boolean> {
    if (!actor || !aspectTree || !canvasNode?.nodeUUID) return false;

    const aspectSlug: string = aspectTree.system?.slug;
    const targetTemplateUuid: string = canvasNode.nodeUUID;
    if (!aspectSlug || !targetTemplateUuid) return false;

    const wallet = evaluateAspectProgression(actor);
    if (wallet.nodes.available <= 0) {
        ui.notifications?.error("Insufficient progression points to purchase this node.");
        return false;
    }

    const isAlreadyOwned = actor.items.some(
        (i: any) =>
            i.type === "aspectNode" &&
            i.system?.aspectSlug === aspectSlug &&
            i.system?.templateUuid === targetTemplateUuid,
    );

    if (isAlreadyOwned) {
        ui.notifications?.warn("This aspect node has already been purchased.");
        return false;
    }

    const templateItem = fromUuidSync(targetTemplateUuid) as any;

    const resolvedName =
        templateItem?.name ||
        game.items?.get(targetTemplateUuid)?.name ||
        `Aspect Node (${targetTemplateUuid.split(".").pop()})`;

    const itemDataPayload = {
        name: resolvedName,
        type: "aspectNode",
        img: templateItem?.img || "icons/svg/item-bag.svg",
        system: {
            templateUuid: targetTemplateUuid,
            aspectSlug: aspectSlug,
        },
    };

    try {
        await actor.createEmbeddedDocuments("Item", [itemDataPayload]);
        return true;
    } catch (error) {
        console.error("Node purchase transaction crash:", error);
        return false;
    }
}

export async function refundAspectNode(actor: any, aspectTree: any, nodeTemplateUuid: string): Promise<boolean> {
    if (!actor || !aspectTree || !nodeTemplateUuid) return false;

    const aspectSlug: string = aspectTree.system?.slug;
    if (!aspectSlug) return false;

    const targetItem = actor.items.find(
        (i: any) =>
            i.type === "aspectNode" &&
            i.system?.aspectSlug === aspectSlug &&
            i.system?.templateUuid === nodeTemplateUuid,
    );
    if (!targetItem) {
        ui.notifications?.error("Refund failed: You do not own this aspect node.");
        return false;
    }

    const treeNodes: CanvasNodeConnector[] = aspectTree.system?.tree?.nodes || [];
    const childNodeUuids: string[] = [];

    for (const node of treeNodes) {
        if (node.requirements?.includes(nodeTemplateUuid)) {
            childNodeUuids.push(node.nodeUUID);
        }
    }

    const hasActiveDependents = actor.items.some(
        (i: any) =>
            i.type === "aspectNode" &&
            i.system?.aspectSlug === aspectSlug &&
            childNodeUuids.includes(i.system?.templateUuid),
    );

    if (hasActiveDependents) {
        ui.notifications?.error("Refund failed: Cannot refund while dependent child aspect nodes are unlocked.");
        return false;
    }

    try {
        await actor.deleteEmbeddedDocuments("Item", [targetItem.id]);
        ui.notifications?.info("Successfully refunded aspect node. 1 Aspect Point returned.");
        return true;
    } catch (error) {
        console.error("Node refund transaction crash:", error);
        return false;
    }
}

export function getPurchasedNodesForAspect(actor: any, aspectSlug: string) {
    if (!actor?.items) return [];

    return actor.items.filter((i: any) => i.type === "aspectNode" && i.system?.aspectSlug === aspectSlug);
}
