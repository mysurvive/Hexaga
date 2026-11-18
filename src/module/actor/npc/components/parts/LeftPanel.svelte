<script>
    import { updateActorFromInput } from "../../../components/helpers.ts";
    export let actor;
    export let editing;

    $: hitpoints = actor.hp;
</script>

<div class="left-panel">
    <img src="systems/hexaga/assets/hexaga_logo.webp" alt="Hexaga logo" />

    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        class="flex-row clickable"
        on:click={(e) => {
            editing ? null : actor.intrinsics.tempo.roll();
        }}
    >
        <i class="fa-solid fa-person-running med" />
        <span class="label-normal uppercase">Tempo</span>
        {#if editing}
            <input
                type="number"
                value={actor.intrinsics.tempo.total}
                on:change={(e) => {
                    updateActorFromInput(actor, "system.intrinsic.tempo.total", e);
                }}
            />
        {:else}
            <span>
                {actor.intrinsics.tempo.total}
            </span>
        {/if}
    </div>

    <div class="movement-container">
        <span class="label-thin center border uppercase">Movement</span>
        <div class="flex-row">
            <i class="fa-solid fa-sneaker-running" />
            <span class="label-normal uppercase">Run </span>
        </div>
        <div class="flex-row">
            <i class="fa-solid fa-plane" />
            <span class="label-normal uppercase">Fly </span>
            <span class="label-normal">0</span>
        </div>
    </div>

    <div class="hitpoint-container">
        <span class="label-thin center border uppercase"> Hitpoints </span>
        <div class="values">
            <div>
                <label for="current-hp" class="label-thin center uppercase"> Current </label>
                <div class="value-container">
                    <input
                        type="text"
                        id="current-hp"
                        value={hitpoints.current}
                        on:change={async (e) => {
                            const input = e.currentTarget;
                            await actor.modifyHealth(input.value);
                            input.value = actor.hp.current;
                        }}
                    />
                </div>
            </div>
            <div>
                <label for="max-hp" class="label-thin center uppercase"> Maximum </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="max-hp"
                            value={actor.hp.max}
                            on:change={async (e) => {
                                await updateActorFromInput(actor, "system.intrinsic.hp.max", e);
                            }}
                        />
                    {:else}
                        <span class="value">{actor.system.intrinsic.hp.max} </span>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <div class="ablation-container">
        <span class="label-thin center border uppercase">Ablation</span>
        <div class="values">
            <div>
                <label for="armor-ablation" class="label-thin center uppercase"> Armor </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="armor-ablation"
                            value={actor.system.ablation.armor.base}
                            on:change={async (e) => {
                                await updateActorFromInput(actor, "system.ablation.armor.base", e);
                            }}
                        />
                    {:else}
                        <span class="value">{actor.wornArmor.ablation.base} </span>
                    {/if}
                </div>
            </div>
            <div>
                <label for="shield-ablation" class="label-thin center uppercase"> Shield </label>
                <div class="value-container">
                    <input type="number" id="shield-ablation" on:change={async (e) => {}} />
                </div>
            </div>
        </div>

        <span class="label-thin center border uppercase">Durability</span>
        <div class="values">
            <div>
                <span class="label-thin center border uppercase"> Armor </span>
                <div class="values sub">
                    <div>
                        <label for="armor-durability-current" class="label-thin center uppercase"> Current </label>
                        <div class="value-container">
                            <input type="number" id="armor-durability-current" on:change={async (e) => {}} />
                        </div>
                    </div>
                    <div>
                        <label for="armor-durability-max" class="label-thin center uppercase"> Max </label>
                        <div class="value-container">
                            <input type="number" id="armor-durability-max" on:change={async (e) => {}} />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <span class="label-thin center border uppercase"> Shield </span>
                <div class="values sub">
                    <div>
                        <label for="shield-durability-current" class="label-thin center uppercase"> Current </label>
                        <div class="value-container">
                            <input type="number" id="shield-durability-current" on:change={async (e) => {}} />
                        </div>
                    </div>
                    <div>
                        <label for="shield-durability-max" class="label-thin center uppercase"> Max </label>
                        <div class="value-container">
                            <input type="number" id="shield-durability-max" on:change={async (e) => {}} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="rv-container">
        <span class="label-thin center border uppercase"> RV </span>
        <div class="values">
            <div>
                <label for="physical-rv" class="label-thin center uppercase"> Physical </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="physical-rv"
                            on:change={async (e) => {
                                updateActorFromInput(actor, "system.rv.physical.base", e);
                            }}
                            value={actor.system.rv.physical.base}
                        />
                    {:else}
                        <span class="value">{actor.rv.physical.total}</span>
                    {/if}
                </div>
            </div>
            <div>
                <label for="mental-rv" class="label-thin center uppercase"> Mental </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="mental-rv"
                            on:change={async (e) => {
                                updateActorFromInput(actor, "system.rv.mental.base", e);
                            }}
                            value={actor.system.rv.mental.base}
                        />
                    {:else}
                        <span class="value">{actor.rv.mental.total}</span>
                    {/if}
                </div>
            </div>
            <div>
                <label for="personality-rv" class="label-thin center uppercase"> Personality </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="personality-rv"
                            on:change={async (e) => {
                                updateActorFromInput(actor, "system.rv.personality.base", e);
                            }}
                            value={actor.system.rv.personality.base}
                        />
                    {:else}
                        <span class="value">{actor.rv.personality.total}</span>
                    {/if}
                </div>
            </div>
        </div>
        <span class="label-thin center border uppercase"> Resist </span>
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->

        <div class="values">
            <div
                class={editing ? "" : "clickable"}
                on:click={editing ? null : actor.resist.physical.roll({ label: "Resist: Physical" })}
            >
                <label for="physical-resist" class="label-thin center uppercase"> Physical </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="physical-resist"
                            on:change={async (e) => {
                                updateActorFromInput(actor, "system.resist.physical.base", e);
                            }}
                            value={actor.system.resist.physical.base}
                        />
                    {:else}
                        <span class="value">{actor.resist.physical.total}</span>
                    {/if}
                </div>
            </div>
            <div class={editing ? "" : "clickable"} on:click={editing ? null : actor.resist.mental.roll()}>
                <label for="mental-resist" class="label-thin center uppercase"> Mental </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="mental-resist"
                            on:change={async (e) => {
                                updateActorFromInput(actor, "system.resist.mental.base", e);
                            }}
                            value={actor.system.resist.mental.base}
                        />
                    {:else}
                        <span class="value">{actor.resist.mental.total}</span>
                    {/if}
                </div>
            </div>
            <div class={editing ? "" : "clickable"} on:click={editing ? null : actor.resist.physical.roll()}>
                <label for="personality-resist" class="label-thin center uppercase"> Personality </label>
                <div class="value-container">
                    {#if editing}
                        <input
                            type="number"
                            id="personality-resist"
                            on:change={async (e) => {
                                updateActorFromInput(actor, "system.resist.personality.base", e);
                            }}
                            value={actor.system.resist.personality.base}
                        />
                    {:else}
                        <span class="value">{actor.resist.personality.total}</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">
    .left-panel {
        min-width: 230px;
        max-width: 230px;
        padding-right: 16px;
        display: flex;
        flex-direction: column;
        row-gap: 10px;

        overflow-y: auto;

        img {
            margin-bottom: 20px;
        }
    }

    .movement-container {
        div {
            margin: 4px;
        }
    }

    .values {
        display: flex;
        flex-direction: row;
        border-left: 1px solid white;
        border-bottom: 1px solid white;
        border-right: 1px solid white;

        > div {
            flex: 1 1 50%;
            min-width: 0;
        }

        .sub {
            border: none;

            input {
                font-size: 1em;
            }
        }

        > :not(:first-child) {
            border-left: 1px solid white;
        }

        .value-container {
            padding: 0px 10px 10px 10px;
            justify-self: center;
        }

        input,
        .value {
            background: none;
            justify-items: center;
            font-size: 2em;
        }

        input {
            width: 100%;
            min-width: 0;
        }
    }

    i.med {
        font-size: 18px;
    }

    .label-normal {
        font-size: 14px;
        padding: 4px;
    }

    .label-thin {
        font-size: 10px;
        padding: 4px;

        &.center {
            display: flex;
            justify-content: center;
        }

        &.border {
            border: 1px solid white;
        }
    }

    .uppercase {
        text-transform: uppercase;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
