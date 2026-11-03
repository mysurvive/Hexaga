<script>
    import TagifyInput from "../../../../shared/components/TagifyInput.svelte";

    export let actor;
    export let level;
    export let optionType;

    const grantedLevelImprovements = CONFIG.hexaga.improvements[level];
    const rankCap = CONFIG.hexaga.maxRank.findLast((item) => item.level <= level).cap;

    $: witSources = Object.entries(actor.system.improvements.attributes)
        .map(([key, value]) => {
            if (key === "profession" || key === "heritage") {
                return value;
            }
            if (!isNaN(Number(key)) && Number(key) <= level) {
                return value;
            }
            return undefined;
        })
        .filter((e) => e !== undefined)
        .flat();

    $: witBonus =
        witSources.reduce((total, current) => {
            return current === "wit" ? total + 1 : total;
        }, 0) ?? 0;

    $: allowedImprovements =
        optionType === "skills" ? grantedLevelImprovements.skills + witBonus : grantedLevelImprovements[optionType];

    $: allLevelImprovements = actor.system.improvements;
    $: improvementsPicked =
        optionType === "skills"
            ? (allLevelImprovements.skills[level]?.length ?? 0) + (allLevelImprovements.expertise[level]?.length ?? 0)
            : (allLevelImprovements.attributes[level]?.length ?? 0);
    $: remainingPicks = allowedImprovements - improvementsPicked;

    function getCount(option, improvements) {
        return (
            allLevelImprovements[optionType][level]?.reduce(
                (total, current) => (current === option ? total + 1 : total),
                0,
            ) ?? 0
        );
    }

    function getCountAll(option, improvements) {
        let counter = 0;
        for (const improvement of Object.entries(allLevelImprovements[optionType])) {
            counter += (improvement[1] ?? []).reduce((total, current) => (current === option ? total + 1 : total), 0);
        }
        return counter;
    }

    function atLevelCap(type) {
        return remainingPicks <= 0;
    }

    async function increaseChoice(option) {
        const improvement = (allLevelImprovements[optionType][level] ??= allLevelImprovements[optionType][level] = []);
        improvement.push(option);

        const updates = {
            [`system.improvements.${optionType}.${level}`]: improvement,
        };

        await actor.update(updates);
    }

    async function decreaseChoice(option) {
        const improvement = allLevelImprovements[optionType][level];
        const stringIndex = improvement.indexOf(option);
        if (stringIndex > -1) {
            improvement.splice(stringIndex, 1);
        }

        const updates = { [`system.improvements.${optionType}.${level}`]: improvement };

        await actor.update(updates);
    }
</script>

<details class="improvement-item">
    <summary>
        <span>{window.game.i18n.localize(`hexaga.${optionType}.label`)}</span>{#if remainingPicks > 0}
            <span class="pulse-indicator">Improvement Available!</span>{/if}
    </summary>
    <div class="content">
        <span>
            {#if optionType === "attributes"}
                Select {allowedImprovements} from the following:
            {:else if optionType === "skills"}
                Select {allowedImprovements} from skills or expertise ({witBonus} from Wit):
            {/if}
        </span>
        <div class="choice-block">
            {#each Object.entries(actor.system[optionType]) as [option, data]}
                <div class="flex-row">
                    <div class="counter">
                        <div class={optionType === "skills" ? "count small" : "count"} id="{option}-count">
                            {getCount(option)}
                        </div>
                        <label for="{option}-count"
                            >{window.game.i18n.localize(`hexaga.${optionType}.${option}.label`)}</label
                        >
                    </div>
                    <div class={optionType === "skills" ? "button-group small" : "button-group"}>
                        <button
                            disabled={getCountAll(option, allLevelImprovements) >= rankCap || atLevelCap(optionType)}
                            on:click={() => {
                                increaseChoice(option);
                            }}>+</button
                        >
                        <button
                            disabled={getCount(option) <= 0}
                            on:click={() => {
                                decreaseChoice(option);
                            }}>-</button
                        >
                    </div>
                </div>
            {/each}
        </div>
        {#if optionType === "skills"}
            <div class="label">Expertise</div>
            <TagifyInput
                allowed={remainingPicks}
                selections={allLevelImprovements.expertise[level]}
                externalBlacklist={actor.expertise.map((s) => (typeof s === "object" ? s.slug : s))}
                onChange={async (values) => {
                    const update = { [`system.improvements.expertise.${level}`]: values };
                    await actor.update(update);
                }}
            />
        {/if}
    </div>
</details>

<style lang="scss">
    $color-platinum: #cfdbd5;
    $color-alabaster: #e8eddf;
    $color-orange-peel: #f49d37;
    $color-eerie-black: #242423;
    $color-jet: #333533;

    .label {
        margin-top: 20px;
        font-weight: bold;
        font-size: 18px;
    }
    .choice-block {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        row-gap: 10px;
        align-items: left;
        margin-top: 10px;
    }

    .counter {
        justify-items: center;
        margin-right: 12px;
        label {
            justify-self: center;
        }
        .count {
            font-size: 40px;
            &.small {
                font-size: 20px;
            }
        }
    }

    .content {
        margin-top: 20px;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .button-group {
        button {
            height: 30px;
            width: 30px;
        }
        &.small {
            button {
                height: 20px;
                width: 20px;
                min-height: 0;
            }
        }
    }

    .improvement-item {
        border: 1px solid white;
        padding: 10px;
        max-width: 100%;
    }

    .improvement-item summary {
        display: flex;
        font-weight: bold;
        cursor: pointer;
        list-style: none;
        height: 20px;
        align-content: center;
        justify-content: space-between;
    }

    .pulse-indicator {
        color: $color-orange-peel;
        font-size: 0.9rem;
        margin-left: 8px;
        font-weight: normal;
    }
</style>
