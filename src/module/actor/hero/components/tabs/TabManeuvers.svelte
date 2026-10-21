<script lang="ts">
    export let actor;

    $: maneuvers = actor.maneuvers;
    let mmp = 0;
</script>

<section class="hero-tab">
    <div class="mmp-container">
        <span>Multiple Maneuver Penalty: </span>
        {#each [0, -1, -2, -3, -4, -5] as mmpValue}
            <div class="labeled-toggle">
                <input type="radio" id="{mmpValue}-mmp" name="mmp" value={mmpValue} bind:group={mmp} />
                <label for="{mmpValue}-mmp" class="label-button">{mmpValue}</label>
            </div>
        {/each}
    </div>
    <div>
        <div class="title-left">
            Attacks
            <hr />
        </div>
        <div class="flex-column">
            {#each maneuvers as attack}
                <span class="maneuver-item">
                    <span>{attack.weapon.name}</span>
                    <span class="control-buttons">
                        <button
                            type="button"
                            on:click={() => {
                                attack.attack({ mmp: mmp });
                            }}
                        >
                            <i class="fa-solid fa-swords" />
                        </button>
                    </span>
                </span>
            {/each}
        </div>
    </div>
</section>

<style lang="scss">
    .mmp-container {
        margin: 10px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5px;
        .labeled-toggle .label-button {
            width: 25px;
        }
    }

    .maneuver-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin: 5px;
    }

    .flex-column {
        display: flex;
        flex-direction: column;
    }
</style>
