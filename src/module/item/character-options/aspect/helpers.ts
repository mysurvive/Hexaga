import { ActorHex } from "../../../actor/base/baseActor.ts";

// move this onto the class
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
    trees: {
        granted: number;
        chosen: number;
        allowedVariant: number;
        availableSlots: number;
    };
    nodes: {
        total: {
            allowed: number;
            spent: number;
            available: number;
        };
        [level: string]:
            | {
                  chosen: string[];
                  allowed: number;
                  available: number;
              }
            | { allowed: number; spent: number; available: number };
    };
}

export function evaluateAspectProgression(actor: ActorHex, levelContext: number): ProgressionWallet {
    const characterLevel: number = actor.system.level ?? 1;
    const totalOwnedAspects = actor.items.filter((i) => i.type === "aspect") || [];
    const grantedAspectsCount = totalOwnedAspects.filter((i) => i.getFlag("hexaga", "grantedBy") !== undefined).length;
    const manuallyChosenAspectsCount = totalOwnedAspects.filter((i) => !i.getFlag("hexaga", "grantedBy")).length;
    const allowedVariantTreeSlots = 1;
    const availableVariantTreeSlots = Math.max(0, allowedVariantTreeSlots - manuallyChosenAspectsCount);
    const totalAllowedNodePoints = 3 + (characterLevel - 1) * 2;
    const ownedNodes = actor.items?.filter((i) => i.type === "aspectNode") || [];
    const totalSpentNodePoints = ownedNodes.length;
    const availableNodePoints = Math.max(0, totalAllowedNodePoints - totalSpentNodePoints);
    const progressionByLevel = getAspectLevelProgressionContext(actor, levelContext);
    return {
        trees: {
            granted: grantedAspectsCount,
            chosen: manuallyChosenAspectsCount,
            allowedVariant: allowedVariantTreeSlots,
            availableSlots: availableVariantTreeSlots,
        },
        nodes: {
            total: { allowed: totalAllowedNodePoints, spent: totalSpentNodePoints, available: availableNodePoints },
            ...progressionByLevel,
        },
    };
}

export function getAspectLevelProgressionContext(actor: ActorHex, level: number) {
    const improvements = actor.system.improvements;
    const levelData = improvements.aspects[level] ?? undefined;
    const levelAllowed = CONFIG.hexaga.improvements[level]?.aspects ?? 0;
    const levelNumTaken = levelData?.length ?? 0;
    const levelAvailable = levelAllowed - levelNumTaken;

    return { [level]: { chosen: levelData, allowed: levelAllowed, available: levelAvailable } };
}

export async function purchaseAspectNode(
    actor: any,
    aspectTree: any,
    canvasNode: any,
    level: number,
): Promise<boolean> {
    if (!actor || !aspectTree || !canvasNode?.nodeUUID) return false;

    const aspectSlug: string = aspectTree.system?.slug;
    const targetTemplateUuid: string = canvasNode.nodeUUID;
    if (!aspectSlug || !targetTemplateUuid) return false;

    const wallet = evaluateAspectProgression(actor, level);
    if (wallet.nodes.total.available <= 0 || wallet.nodes[level.toString()].available <= 0) {
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

    const itemDataPayload = templateItem.toObject();
    itemDataPayload.system.aspectSlug = aspectSlug;
    itemDataPayload.system.templateUuid = targetTemplateUuid;
    itemDataPayload.system.level.taken = level;

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
