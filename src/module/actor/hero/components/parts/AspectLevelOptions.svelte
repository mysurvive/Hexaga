<script>
    import { getContext } from "svelte";

    export let actor;
    export let level;

    const aspectStore = getContext("aspectStore");

    const allowedPicks = CONFIG.hexaga.improvements[level].aspects;

    $: aspectPicks = Array.isArray($aspectStore[level]) ? [...$aspectStore[level]] : [];

    $: numAspectPicks = actor.system.improvements.aspects[level]?.length ?? 0;
    $: remainingPicks = allowedPicks - numAspectPicks;

    function getAspectBg(aspect) {
        return aspect.system?.tree?.backgroundImage || "systems/hexaga/assets/default_tree_gb.webp";
    }
</script>

<details class="improvement-item">
    <summary>
        <span>{window.game.i18n.localize(`hexaga.aspects.label`)}</span>
        {#if remainingPicks > 0}
            <span class="pulse-indicator">Improvement Available!</span>
        {/if}
    </summary>
    <div class="content">
        <p>Manage Aspects in the Aspects tab.</p>
        <div class="aspect-showcase">
            {#each aspectPicks as aspect (aspect.id ?? aspect.uuid)}
                {#if aspect.type === "aspect"}
                    <div
                        class="aspect-compact-banner-wrapper"
                        style="background-image: url('{getAspectBg(aspect)}');"
                        title={aspect.name}
                    >
                        <img src={aspect.img} alt={aspect.name} class="aspect-icon" />
                        <span class="aspect-title">{aspect.name}</span>
                    </div>
                {/if}

                {#if aspect.type === "aspectNode"}
                    <button
                        type="button"
                        class="aspect-node-badge"
                        title={aspect.name}
                        on:click={() => {
                            aspect.sheet?.render({ force: true });
                        }}
                    >
                        <div class="node-hex-frame">
                            <div class="medallion-inner-hex-rim">
                                <img src={aspect.img} alt={aspect.name} class="node-hex-image" />
                            </div>
                        </div>
                        <span class="node-badge-title">{aspect.name}</span>
                    </button>
                {/if}
            {/each}
        </div>
    </div>
</details>

<style lang="scss">
    $color-platinum: #cfdbd5;
    $color-alabaster: #e8eddf;
    $color-orange-peel: #f49d37;
    $color-eerie-black: #242423;
    $color-jet: #333533;

    @mixin polygon-hexagon {
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    }

    .aspect-showcase {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 28px;
        width: 100%;
        padding: 12px 0;
        overflow: visible !important;
    }

    .aspect-compact-banner-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        height: 60px;
        padding: 0 16px;
        min-width: 200px;
        max-width: 260px;
        flex-grow: 1;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border: 1px solid $color-jet;
        border-radius: 2px;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.6);
        transition: filter 0.2s ease;

        &:hover {
            filter: brightness(1.15);
        }

        .aspect-icon {
            width: 26px;
            height: 26px;
            border: 1px solid $color-jet;
            background-color: $color-eerie-black;
            flex-shrink: 0;
        }

        .aspect-title {
            color: $color-alabaster;
            font-weight: bold;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 1);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .aspect-node-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        width: 96px;
        min-width: 96px;
        max-width: 96px;
        height: 118px;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0;
        margin: 0;
        overflow: visible !important;
        flex-shrink: 0;
        cursor: pointer;

        &:hover {
            .node-hex-frame {
                background: linear-gradient(135deg, $color-orange-peel, darken($color-orange-peel, 15%));
                filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 8px rgba(244, 157, 55, 0.5));

                .medallion-inner-hex-rim {
                    border-color: rgba($color-orange-peel, 0.2);
                }
            }
            .node-badge-title {
                color: $color-orange-peel;
            }
        }

        .node-hex-frame {
            position: relative;
            width: 64px;
            height: 70px;
            background: linear-gradient(135deg, #474947, $color-jet);
            @include polygon-hexagon;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
            transition: all 0.15s ease;
        }

        .medallion-inner-hex-rim {
            width: 54px;
            height: 60px;
            background-color: $color-eerie-black;
            @include polygon-hexagon;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.9);
        }

        .node-hex-image {
            width: 80%;
            height: 80%;
            object-fit: contain;
            padding: 2px;
            border: none;
            background-color: transparent;
            filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.8));
        }

        .node-badge-title {
            font-size: 0.74rem;
            font-weight: 600;
            color: $color-platinum;
            text-align: center;
            width: 100%;
            line-height: 1.25;
            white-space: normal;
            word-break: break-word;
            display: -webkit-box;
            line-clamp: 2;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow:
                1px 1px 2px rgba(0, 0, 0, 1),
                0 0 4px rgba(0, 0, 0, 0.8);
            transition: color 0.15s ease;
        }
    }

    .pulse-indicator {
        color: $color-orange-peel;
        font-size: 0.9rem;
        margin-left: 8px;
        font-weight: normal;
    }
</style>
