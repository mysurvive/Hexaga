<script>
    export let item;

    const CONFIG = window.CONFIG.hexaga;

    $: system = item.system;
    $: basePool = system.damagePool.base;
    $: additionalDamagePool = system.damagePool.additional;
    $: attackType = system.attackType;
    $: attackSkill = system.attackSkill;

    async function updateItemFromEvent(path, event) {
        const target = event.currentTarget;

        if (!target || (!"value") in target) return;
        try {
            await item.update({ [path]: target.value });
        } catch (error) {
            console.error(`Error updating ${path} on ${item.name}`);
        }
    }

    async function handlePoolChange(event) {
        const target = event.target;
        if (!target) return;

        const indexStr = target.getAttribute("data-index");
        const key = target.getAttribute("data-key");

        if (!key) return;

        const value = target.type === "number" ? Number(target.value) || 0 : target.value;

        try {
            if (indexStr === null) {
                await item.update({ [`system.damagePool.base.${key}`]: value });
            } else {
                const index = parseInt(indexStr, 10);
                const pools = [...additionalDamagePool];
                pools[index] = { ...pools[index], [key]: value };

                await item.update({ "system.damagePool.additional": pools });
            }
        } catch (error) {
            console.error(`Error updating damage pool on ${item.name}`, error);
        }
    }

    async function addPool() {
        const pools = additionalDamagePool;
        const newPools = [...pools, { base: 1, damageType: "bludgeoning" }];

        try {
            await item.update({ "system.damagePool.additional": newPools });
        } catch (error) {
            console.error(`Error updating damage pool on ${item.name}`);
        }
    }

    async function removePool(index) {
        const pools = [...additionalDamagePool];
        pools.splice(index, 1);

        try {
            await item.update({ "system.damagePool.additional": pools });
        } catch (error) {
            console.error(`Error updating damage pool on ${item.name}`);
        }
    }
</script>

<section class="item-tab">
    <div class="flex-row">
        <div class="flex-row">
            <label for="attack-type">{window.game.i18n.localize(`hexaga.weapon.attackType.label`)}: </label>
            <select
                class="margin-5"
                id="attack-type"
                value={attackType}
                on:change={(e) => updateItemFromEvent("system.attackType", e)}
            >
                {#each ["ranged", "melee", "magical"] as type}
                    <option value={type}>{window.game.i18n.localize(`hexaga.weapon.attackType.${type}`)}</option>
                {/each}
            </select>
        </div>
        <div class="flex-row">
            <label for="attack-skill">{window.game.i18n.localize(`hexaga.weapon.attackSkill.label`)}: </label>
            <select
                class="margin-5"
                id="attack-skill"
                value={attackSkill}
                on:change={(e) => updateItemFromEvent("system.attackSkill", e)}
            >
                {#each CONFIG.attackSkills as skill}
                    <option value={skill}>{window.game.i18n.localize(`hexaga.skills.${skill}.label`)}</option>
                {/each}
            </select>
        </div>
    </div>
    <fieldset>
        <legend>{window.game.i18n.localize("hexaga.weapon.damagePool.plural")}</legend>
        <ul on:change={(e) => handlePoolChange(e)}>
            <span>Base damage:</span>
            <div class="pool flex-row">
                <div class="flex-row">
                    <label for="dice">{window.game.i18n.localize("hexaga.dice.plural")}: </label>
                    <input type="number" id="dice" data-key="damagePool" value={basePool.damagePool} />
                </div>
                <div class="flex-row">
                    <label for="damage-type">{window.game.i18n.localize("hexaga.damageTypes.label")}: </label>
                    <select id="damage-type" data-key="damageType" value={basePool.damageType}>
                        {#each CONFIG.damageTypes as damageType}
                            <option value={damageType}
                                >{window.game.i18n.localize(`hexaga.damageTypes.${damageType}`)}</option
                            >
                        {/each}
                    </select>
                </div>
                <div class="flex-row">
                    <label for="flat"> + </label>
                    <input type="number" id="flat" data-key="flatDamage" value={basePool.flatDamage} />
                </div>
            </div>
            <span>Additional damage pools:</span>
            {#each additionalDamagePool as pool, index (pool)}
                <div class="pool flex-row">
                    <div class="flex-row">
                        <label for="dice">{window.game.i18n.localize("hexaga.dice.plural")}: </label>
                        <input
                            type="number"
                            id="dice"
                            data-index={index}
                            data-key="damagePool"
                            value={pool.damagePool}
                        />
                    </div>
                    <div class="flex-row">
                        <label for="damage-type">{window.game.i18n.localize("hexaga.damageTypes.label")}: </label>
                        <select id="damage-type" data-index={index} data-key="damageType" value={pool.damageType}>
                            {#each CONFIG.damageTypes as damageType}
                                <option value={damageType}
                                    >{window.game.i18n.localize(`hexaga.damageTypes.${damageType}`)}</option
                                >
                            {/each}
                        </select>
                    </div>
                    <div class="flex-row">
                        <label for="flat"> + </label>
                        <input
                            type="number"
                            id="flat"
                            data-key="flatDamage"
                            data-index={index}
                            value={pool.flatDamage}
                        />
                    </div>
                    <button
                        type="button"
                        on:click={() => {
                            removePool(index);
                        }}><i class="fa-solid fa-trash-can"></i></button
                    >
                </div>
            {/each}
        </ul>
        <button type="button" on:click={() => addPool()}
            >{window.game.i18n.localize("hexaga.weapon.damagePool.add")}</button
        >
    </fieldset>
</section>

<style lang="scss">
    section {
        overflow-y: auto;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: flex-start;
        gap: 15px;
    }

    .pool.flex-row {
        width: 100%;
        justify-content: flex-start;
        margin-top: 5px;
    }

    .pool div.flex-row {
        width: auto;
        gap: 15px;
    }

    .pool {
        select {
            width: auto;
            min-width: 120px;
        }

        input[type="number"] {
            width: 45px;
            text-align: center;
            flex-grow: 0;
            flex-shrink: 0;
        }

        button {
            width: 30px;
            height: 30px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
        }
    }

    ul {
        padding: 0px 0px 0px 0.5em;
        width: 100%;

        > div {
            padding: 0px 0px 0px 1.5em;
            margin: 10px 0;
        }
    }
</style>
