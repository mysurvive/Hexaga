import ActorSheetV2 = foundry.applications.sheets.ActorSheetV2;

const HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export default class HeroSheet extends HandlebarsApplicationMixin(ActorSheetV2)<
    ActorSheetV2.RenderContext,
    ActorSheetV2.Configuration,
    ActorSheetV2.RenderOptions
> {}

export { HeroSheet };
