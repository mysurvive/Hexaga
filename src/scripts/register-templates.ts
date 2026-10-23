export function registerTemplates(): void {
    const templates = ["systems/hexaga/templates/chat/testRoll.hbs", "systems/hexaga/templates/chat/damageRoll.hbs"];

    foundry.applications.handlebars.loadTemplates(templates);
}
