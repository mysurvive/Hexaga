const ATTRIBUTE_STRINGS = new Set(["physique", "deftness", "wit", "acumen", "will", "ego"] as const);
const ATTRIBUTE_GROUPS = new Set(["physical", "mental", "personality"] as const);
const ATTRIBUTE_GROUP_MAPS = {
    physical: {
        label: "hexaga.attributeGroups.physical.label",
        attributes: {
            physique: { skills: ["brawn", "striking", "menace"] },
            deftness: { skills: ["marksmanship", "legerdemain", "stealth"] },
        },
    },
    mental: {
        label: "hexaga.attributeGroups.mental.label",
        attributes: {
            wit: { skills: ["arcane", "knowledge", "tinker"] },
            acumen: { skills: ["sense", "discernment", "nature"] },
        },
    },
    personality: {
        label: "hexaga.attributeGroups.personality.label",
        attributes: {
            will: { skills: ["spirituality", "survival", "empathy"] },
            ego: { skills: ["speech", "command", "occult"] },
        },
    },
};
const SKILL_MAPS = {
    physique: ["brawn", "striking", "menace"],
    deftness: ["marksmanship", "legerdemain", "stealth"],
    wit: ["knowledge", "arcane", "tinker"],
    acumen: ["sense", "discernment", "nature"],
    will: ["spirituality", "survival", "empathy"],
    ego: ["speech", "command", "occult"],
};
const SKILL_STRINGS = new Set([
    "brawn",
    "striking",
    "menace",
    "marksmanship",
    "legerdemain",
    "stealth",
    "knowledge",
    "arcane",
    "tinker",
    "sense",
    "discernment",
    "nature",
    "spirituality",
    "survival",
    "empathy",
    "speech",
    "command",
    "occult",
] as const);

export { ATTRIBUTE_STRINGS, ATTRIBUTE_GROUPS, ATTRIBUTE_GROUP_MAPS, SKILL_STRINGS, SKILL_MAPS };
