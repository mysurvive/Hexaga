export function registerTemplates(): void {
    const templates = [
        "systems/hexaga/templates/chat/testRoll.hbs",
        "systems/hexaga/templates/chat/damageRoll.hbs",
        "systems/hexaga/templates/chat/tempoRoll.hbs",
    ];

    foundry.applications.handlebars.loadTemplates(templates);
}
