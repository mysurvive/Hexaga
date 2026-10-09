<script lang="ts">
    import { ATTRIBUTE_GROUP_MAPS } from "../../../foundation.ts";
    export let actor: ActorHex;

    function _loc(key: string): string {
        return game.i18n.localize(key);
    }

    async function handleRoll(skill: string): Promise<void> {
        await actor.skills[skill].roll();
    }
</script>

<section class="hero-tab" data-group="primary" data-tab="character">
    {#each Object.entries(ATTRIBUTE_GROUP_MAPS) as [attributeGroup, groupData]}
        <div class="attribute-group">
            <div class="attribute-group-label">
                {_loc(groupData.label)}
            </div>

            <div class="attribute-group-body">
                <div class="defenses">
                    <div id="{attributeGroup}-rv">
                        <div class="focus-box-container medium">
                            <div class="focus-label">RV</div>
                            <div class="focus-content">
                                {actor.rv?.[attributeGroup]?.total ?? 0}
                            </div>
                        </div>
                    </div>
                    <div id="{attributeGroup}-resist"></div>
                </div>
                <div class="attribute-area">
                    {#each Object.entries(groupData.attributes) as [attribute, attributeData]}
                        <div class="attribute-content">
                            <div
                                class="focus-box-container large"
                                data-tooltip={actor.system.attributes[attribute]?.breakdown?.join(", ")}
                            >
                                <div class="focus-label">
                                    {_loc(`hexaga.attributes.${attribute}.label`)}
                                </div>
                                <div class="focus-content">
                                    {actor.system.attributes[attribute]?.total}
                                </div>
                            </div>
                            <div class="skill-area">
                                {#each attributeData.skills as skill}
                                    <div class="skill-item" id={skill}>
                                        <span>{_loc(`hexaga.skills.${skill}.label`)}</span>
                                        <div class="focus-box-container small">
                                            <div class="focus-content">{actor.skills[skill]?.rank}</div>
                                        </div>
                                        <div
                                            class="focus-box-container small"
                                            data-tooltip={actor.skills[skill]?.breakdown}
                                        >
                                            <div class="focus-content">
                                                {actor.skills[skill]?.total}{#if actor.skills[skill]?.rank === 0}*{/if}
                                            </div>
                                        </div>
                                        <button class="roll-button" type="button" on:click={() => handleRoll(skill)}
                                            ><i class="fa-solid fa-dice-six"></i>
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {/each}
</section>

<style lang="scss">
    .hero-tab {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 5px;
        margin-top: 5px;

        .attribute-group {
            outline: 2px solid black;
            height: 320px;
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: stretch;

            .attribute-group-label {
                writing-mode: vertical-rl;
                rotate: 180deg;
                font-size: 20pt;
                background-color: rgb(56, 56, 56);
                padding: 0 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                white-space: nowrap;
            }

            .attribute-group-body {
                box-sizing: border-box;
                min-width: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
                padding: 5px;
                overflow: hidden;
                margin-left: 5px;

                .defenses {
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    margin-bottom: 5px;
                    flex-shrink: 0;
                }

                .attribute-area {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-around;
                    flex-grow: 1;
                    min-height: 0;
                    box-sizing: border-box;
                    width: 100%;

                    .attribute-content {
                        display: flex;
                        flex-direction: row;
                        width: 100%;

                        .skill-area {
                            display: flex;
                            flex-direction: column;
                            margin-left: 10px;
                            justify-content: space-around;
                            width: 100%;

                            .skill-item {
                                display: grid;
                                grid-template-columns: 1fr 30px 30px 30px;
                                gap: 6px;
                                align-items: center;
                                white-space: nowrap;
                                width: 100%;

                                button {
                                    border: 0px;
                                    background: none;
                                    i {
                                        font-size: 2rem;
                                    }
                                }

                                button:hover {
                                    i {
                                        animation: spin 2s linear infinite;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
</style>
