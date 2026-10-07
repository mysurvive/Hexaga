import { ActorSheetHex } from "../base/baseSheet.ts";
import { DeepPartial } from "fvtt-types/utils";
import { SkillStrings } from "../types.ts";

import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

export class HeroSheet extends ActorSheetHex {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            position: {
                height: 900,
                width: 900,
            },
            actions: {
                rollSkill: HeroSheet.rollSkill,
            },
        },
        { insertKeys: true, overwrite: true },
    );

    static override PARTS = {
        sheet: { template: "systems/hexaga/templates/actors/hero/sheet/sheet.hbs", id: "sheet" },
        character: { template: "systems/hexaga/templates/actors/hero/sheet/tabs/character.hbs" },
        items: {
            template: "systems/hexaga/templates/actors/hero/sheet/tabs/items.hbs",
            classes: ["items"],
            scrollable: [""],
        },
        improvements: {
            template: "systems/hexaga/templates/actors/hero/sheet/tabs/improvements.hbs",
            scrollable: [""],
        },
    };

    static override TABS = {
        primary: {
            tabs: [{ id: "character" }, { id: "items" }, { id: "aspects" }, { id: "spells" }, { id: "improvements" }],
            labelPrefix: "hexaga.actor.hero.sheet.tabs",
            initial: "character",
        },
    };

    prepareAttributeGroups() {
        const attributes = this.actor.system.attributes;
        const skills = this.actor.skills;

        for (const skill in skills) {
            if (!skills[skill as SkillStrings]) throw new Error(`Undefined skill ${skill}`);
        }
        const attributeGroups = {
            physical: {
                label: "hexaga.attributeGroups.physical.label",
                attributes: {
                    physique: {
                        ...attributes.physique,
                        group: "physical",
                        skills: { brawn: skills.brawn, striking: skills.striking, menace: skills.menace },
                    },
                    deftness: {
                        ...attributes.deftness,
                        group: "physical",
                        skills: {
                            marksmanship: skills.marksmanship,
                            legerdemain: skills.legerdemain,
                            stealth: skills.stealth,
                        },
                    },
                },
            },
            mental: {
                label: "hexaga.attributeGroups.mental.label",
                attributes: {
                    wit: {
                        ...attributes.wit,
                        group: "mental",
                        skills: { arcane: skills.arcane, knowledge: skills.knowledge, tinker: skills.tinker },
                    },
                    acumen: {
                        ...attributes.acumen,
                        group: "mental",
                        skills: { sense: skills.sense, discernment: skills.discernment, nature: skills.nature },
                    },
                },
            },
            personality: {
                label: "hexaga.attributeGroups.personality.label",
                attributes: {
                    will: {
                        ...attributes.will,
                        group: "personality",
                        skills: {
                            spirituality: skills.spirituality,
                            survival: skills.survival,
                            empathy: skills.empathy,
                        },
                    },
                    ego: {
                        ...attributes.ego,
                        group: "personality",
                        skills: { speech: skills.speech, command: skills.command, occult: skills.occult },
                    },
                },
            },
        };

        return attributeGroups;
    }

    protected override async _prepareContext(
        options: DeepPartial<ActorSheetV2.RenderOptions> & { isFirstRender: boolean },
    ): Promise<ActorSheetV2.RenderContext> {
        const context = await super._prepareContext(options);
        const tabsContext = this._prepareTabs("primary");
        const mergedContext = fu.mergeObject(context, {
            actor: this.actor,
            tabs: tabsContext,
            attributeGroups: this.prepareAttributeGroups(),
        });
        return mergedContext;
    }

    static async rollSkill(this: HeroSheet, _event: PointerEvent, target: Element): Promise<void> {
        const skill = target.getAttribute("data-skill");
        if (skill) {
            this.actor.skills[skill].roll();
        }
    }
}
