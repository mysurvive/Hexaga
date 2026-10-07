import { SetElement } from "../../utils.ts";
import { ATTRIBUTE_GROUPS, ATTRIBUTE_STRINGS, SKILL_MAPS, SKILL_STRINGS } from "./foundation.ts";

type AttributeStrings = SetElement<typeof ATTRIBUTE_STRINGS>;

interface AttributeData {
    rank: number;
    total: number;
    label: string;
    skills: Record<SkillStrings, SkillData>;
    group: AttributeGroupStrings;
}

type Attributes = Record<AttributeStrings, AttributeData>;

type AttributeGroupStrings = SetElement<typeof ATTRIBUTE_GROUPS>;

type SkillStrings = SetElement<typeof SKILL_STRINGS>;

interface SkillData {
    rank: number;
    label: string;
    attribute: AttributeStrings;
    group: AttributeGroupStrings;
}

type Skills = Record<SkillStrings, SkillData>;

type SkillPairData = typeof SKILL_MAPS;

type SkillPairs = {
    [K in keyof SkillPairData]: Record<SkillPairData[K][number], SkillData>;
};

type PhysicalAttributeGroup = {
    label: string;
    attributes: { [K in "physique" | "deftness"]: Attributes[K] & { skills: SkillPairs[K] } };
};
type MentalAttributeGroup = {
    label: string;
    attributes: { [K in "wit" | "acumen"]: Attributes[K] & { skills: SkillPairs[K] } };
};

type PersonalityAttributeGroup = {
    label: string;
    attributes: { [K in "will" | "ego"]: Attributes[K] & { skills: SkillPairs[K] } };
};

type AttributeGroups = {
    physical: PhysicalAttributeGroup;
    mental: MentalAttributeGroup;
    personality: PersonalityAttributeGroup;
};

export type {
    Attributes,
    AttributeData,
    AttributeGroups,
    AttributeGroupStrings,
    AttributeStrings,
    Skills,
    SkillData,
    SkillStrings,
};
