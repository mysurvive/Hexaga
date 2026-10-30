<script>
    export let option;
    export let tKey;
    export let actor;

    const rankCap = CONFIG.hexaga.maxRank.findLast((item) => item.level === 1).cap;

    $: improvements = option?.system?.improvements?.[tKey] ?? null;
    $: selectedChoices = Array.isArray(option?.flags?.hexaga?.selections?.[tKey])
        ? option.flags.hexaga.selections[tKey]
        : [];
    $: allowed = improvements?.allowed ?? 1;
    $: isAtItemCap = selectedChoices.length >= allowed;
    $: allLevelImprovements = actor.system.improvements ?? [];

    function getCountAll(option, imp) {
        let counter = 0;
        const eligibleImprovements = imp.filter(
            (i) => i.source === "heritage" || i.source === "profession" || Number(i.source.split("level")[1]) <= 1,
        );
        for (const improvement of eligibleImprovements) {
            counter += (improvement[tKey] ?? []).reduce(
                (total, current) => (current === option ? total + 1 : total),
                0,
            );
        }
        return counter;
    }

    async function makeChoice(UUID, choice, event) {
        const isChecked = event.target.checked;
        let newSelections = [...selectedChoices];

        if (isChecked) {
            if (!newSelections.includes(choice) && !(selectedChoices.length >= improvements?.allowed)) {
                newSelections.push(choice);
            }
        } else {
            newSelections = newSelections.filter((val) => val !== choice);
        }

        try {
            const item = await fromUuid(UUID);
            if (!item) throw new Error("UUID is not valid");

            await item.setFlag("hexaga", `selections.${tKey}`, newSelections);
        } catch (error) {
            ui.notifications.error(error);
        }
    }
</script>

<div class="options">
    {#each option.system?.improvements?.[tKey]?.selected ?? [] as optionImprovement, index}
        <label
            class="labeled-toggle"
            class:disabled-toggle={(getCountAll(optionImprovement, allLevelImprovements) >= rankCap || isAtItemCap) &&
                !selectedChoices.includes(optionImprovement)}
        >
            <input
                type="checkbox"
                name="{tKey}-options"
                bind:value={improvements}
                checked={selectedChoices.includes(optionImprovement)}
                disabled={(getCountAll(optionImprovement, allLevelImprovements) >= rankCap || isAtItemCap) &&
                    !selectedChoices.includes(optionImprovement)}
                on:change={(e) => makeChoice(option.uuid, optionImprovement, e)}
            />
            <span class="label-button">
                {window.game.i18n.localize(`hexaga.${tKey.toLowerCase()}.${optionImprovement.toLowerCase()}.label`)}
            </span>
        </label>
    {/each}
</div>

<style lang="scss">
    .labeled-toggle input[type="checkbox"] {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .labeled-toggle .label-button {
        height: 25px;
        display: flex;
        padding: 0px 10px;
        border: 2px solid white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        font-size: 12px;
        align-items: center;
        width: 80px;
        justify-content: center;
        text-transform: uppercase;
    }

    .labeled-toggle input[type="checkbox"]:checked + .label-button {
        border-color: gold;
    }

    .labeled-toggle.disabled-toggle {
        opacity: 0.35;

        .label-button {
            cursor: not-allowed;
            border-color: rgba(255, 255, 255, 0.2);
        }
    }

    .options {
        margin-top: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
</style>
