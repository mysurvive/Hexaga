export function registerTemplates(): void {
    const templates = ["systems/hexaga/templates/chat/test/testRoll.hbs"];

    foundry.applications.handlebars.loadTemplates(templates);
}
