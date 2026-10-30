export function evaluateAspectProgression(actor: any, preCalculatedItems?: any[]) {
    const characterLevel: number = actor.system?.level ?? 1;

    const itemSourceList = preCalculatedItems || (actor.items ? Array.from(actor.items) : []);
    const totalOwnedAspects = itemSourceList.filter((i: any) => i.type === "aspect");

    const grantedAspectsCount = totalOwnedAspects.filter((i: any) => {
        const origin = i.flags?.hexaga?.grantedBy || i.getFlag?.("hexaga", "grantedBy");
        const isCoreBackground = i.system?.slug === "human" || i.system?.slug === "laborer";
        return !!origin || isCoreBackground;
    }).length;

    const manuallyChosenAspectsCount = totalOwnedAspects.filter((i: any) => {
        const origin = i.flags?.hexaga?.grantedBy || i.getFlag?.("hexaga", "grantedBy");
        const isCoreBackground = i.system?.slug === "human" || i.system?.slug === "laborer";
        return !origin && !isCoreBackground;
    }).length;

    const allowedVariantTreeSlots = 1;
    const availableVariantTreeSlots = Math.max(0, allowedVariantTreeSlots - manuallyChosenAspectsCount);
    const ownedNodes = itemSourceList.filter((i: any) => i.type === "aspectNode");
    const totalSpentNodePoints = ownedNodes.length;
    const totalAllowedNodePoints = 3 + (characterLevel - 1) * 2;
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
