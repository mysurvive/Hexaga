const DAMAGE_TYPES = ["bludgeoning", "slashing", "piercing", "fire", "electric", "cold", "corrosive"];
const DAMAGE_ICONS = {
    bludgeoning: {
        label: "hexaga.damageTypes.bludgeoning",
        icon: "fa-solid fa-hammer",
        color: "#7c858e",
    },
    slashing: {
        label: "hexaga.damageTypes.slashing",
        icon: "fa-solid fa-sword",
        color: "#7c858e",
    },
    piercing: {
        label: "hexaga.damageTypes.piercing",
        icon: "fa-solid fa-dagger",
        color: "#7c858e",
    },
    fire: {
        label: "hexaga.damageTypes.fire",
        icon: "fa-solid fa-fire-flame-curved",
        color: "#ff5722",
    },
    electric: {
        label: "hexaga.damageTypes.electric",
        icon: "fa-solid fa-bolt",
        color: "#ffeb3b",
    },
    cold: {
        label: "hexaga.damageTypes.cold",
        icon: "fa-sharp-duotone fa-regular fa-snowflake",
        color: "#5579f0",
    },
    corrosive: {
        label: "hexaga.damageTypes.corrosive",
        icon: "fa-solid fa-flask-round-poison",
        color: "#18f347",
    },
};
const ATTACK_SKILLS = ["striking", "marksmanship", "nature", "arcane", "spirituality", "occult"];

export { DAMAGE_TYPES, DAMAGE_ICONS, ATTACK_SKILLS };
