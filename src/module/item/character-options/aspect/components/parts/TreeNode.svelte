<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let node;
    export let item;
    export let isSelected = false;
    export let isDragging = false;
    export let activeEditingEnabled = false;
    export let activeX = 0;
    export let activeY = 0;
    export let reactiveItems;

    let meta = { name: "Loading...", img: "icons/svg/mystery-man.svg" };

    $: actor = item?.actor ?? null;
    $: isAttachedToActor = actor !== null;
    $: aspectSlug = item?.system?.slug ?? "";
    $: isOwned = isAttachedToActor
        ? reactiveItems.some(
              (i) =>
                  i.type === "aspectNode" &&
                  i.system?.aspectSlug === aspectSlug &&
                  i.system?.templateUuid === node.nodeUUID,
          )
        : false;
    $: prereqsMet =
        node.requirements && node.requirements.length > 0
            ? node.requirements.every((reqUuid) =>
                  reactiveItems.some(
                      (i) =>
                          i.type === "aspectNode" &&
                          i.system?.aspectSlug === aspectSlug &&
                          i.system?.templateUuid === reqUuid,
                  ),
              )
            : true;
    $: currentLevel = actor?.system?.level ?? 1;
    $: levelMet = currentLevel >= (node.requiredLevel || 1);
    $: nodeStatus = isOwned ? "purchased" : prereqsMet && levelMet ? "available" : "locked";
    $: if (node.nodeUUID) resolveNodeMetadata(node.nodeUUID);

    async function resolveNodeMetadata(uuid) {
        try {
            const doc = await fromUuid(uuid);
            if (doc) meta = { name: doc.name, img: doc.img };
            else meta = { name: "Unknown Document", img: "icons/svg/hazard.svg" };
        } catch (e) {
            meta = { name: "Error Loading", img: "icons/svg/chest.svg" };
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    class="tree-node status-{nodeStatus}"
    class:is-selected={isSelected}
    class:is-dragging={isDragging}
    class:read-only-grab={!activeEditingEnabled}
    style="
    left: {isDragging ? activeX : node.posX}px; 
    top: {isDragging ? activeY : node.posY}px;
  "
    on:mousedown={(e) => dispatch("nodemousedown", { event: e, node })}
    role="button"
    tabindex="0"
    title="{meta.name} ({nodeStatus.toUpperCase()})"
>
    <div class="node-hex-frame">
        <div class="medallion-inner-hex-rim">
            <img src={meta.img} alt={meta.name} class="node-img" draggable="false" />
        </div>
    </div>

    <!-- ADD THE TEXT LABEL HERE -->
    <span class="tree-node-title">{meta.name}</span>

    {#if nodeStatus === "locked"}
        <div class="lock-indicator-badge-top" title="Prerequisites or Level constraints unfulfilled">
            <i class="fas fa-lock"></i>
        </div>
    {/if}
</div>

<style lang="scss">
    // Modern Sass standard module declaration
    @use "sass:color";

    $color-platinum: #cfdbd5;
    $color-alabaster: #e8eddf;
    $color-orange: #f49d37;
    $color-jet: #242423;
    $color-charcoal: #333533;
    $color-crimson: #a23944;

    @mixin polygon-hexagon {
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    }

    .tree-node {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: 80px;
        height: 85px;
        cursor: grab;
        transform: translate(-50%, -30%);
        transition:
            transform 0.1s ease-out,
            filter 0.15s ease,
            opacity 0.15s;
        z-index: 10;
        overflow: visible;

        &:active,
        &.is-dragging {
            cursor: grabbing;
        }

        &.read-only-grab {
            cursor: pointer;
        }

        &.is-dragging {
            opacity: 0.9;
            z-index: 100;
        }

        &.status-purchased {
            filter: drop-shadow(0 2px 6px rgba(244, 157, 55, 0.4));
            .node-hex-frame {
                background: $color-orange;
            }
            .node-img {
                filter: grayscale(0%) contrast(100%) !important;
            }

            .tree-node-title {
                background-color: $color-orange;
                color: $color-jet;
                &::before,
                &::after {
                    border-color: transparent color.scale($color-orange, $lightness: -15%) transparent transparent;
                }
            }
        }

        &.status-available {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
            .node-hex-frame {
                background: rgba($color-platinum, 0.4);
            }
            .node-img {
                filter: grayscale(100%) brightness(80%) !important;
            }

            .tree-node-title {
                background-color: $color-charcoal;
                color: $color-alabaster;
                &::before,
                &::after {
                    border-color: transparent color.scale($color-charcoal, $lightness: -15%) transparent transparent;
                }
            }

            &:hover {
                transform: translate(-50%, -30%) scale(1.06);
                .node-hex-frame {
                    background: $color-orange;
                }
                .node-img {
                    filter: grayscale(30%) brightness(95%) !important;
                }

                .tree-node-title {
                    background-color: $color-orange;
                    color: $color-jet;
                    &::before,
                    &::after {
                        border-color: transparent color.scale($color-orange, $lightness: -15%) transparent transparent;
                    }
                }
            }
        }

        &.status-locked {
            .node-hex-frame {
                background: $color-crimson;
            }
            .node-img {
                filter: grayscale(100%) opacity(0.35) !important;
            }

            .tree-node-title {
                background-color: color.scale($color-crimson, $lightness: -15%);
                color: rgba($color-platinum, 0.4);
                &::before,
                &::after {
                    border-color: transparent color.scale($color-crimson, $lightness: -30%) transparent transparent;
                }
            }
        }

        &.is-selected {
            filter: drop-shadow(0 0 10px $color-orange);
            .node-hex-frame {
                background: $color-alabaster !important;
            }

            .tree-node-title {
                background-color: $color-alabaster !important;
                color: $color-jet !important;
                font-weight: bold;
                &::before,
                &::after {
                    border-color: transparent color.scale($color-platinum, $lightness: -15%) transparent transparent;
                }
            }
        }
    }

    .node-hex-frame {
        width: 44px;
        height: 51px;
        @include polygon-hexagon;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s;
        flex-shrink: 0;
        z-index: 1;
    }

    .medallion-inner-hex-rim {
        width: 90%;
        height: 90%;
        background-color: $color-jet;
        @include polygon-hexagon;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .node-img {
        width: 80%;
        height: 80%;
        object-fit: contain;
        display: block;
        user-select: none;
        -webkit-user-drag: none;
    }

    .tree-node-title {
        position: relative;
        width: 72px;
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        text-align: center;
        margin-top: -8px;
        padding: 3px 2px;
        line-height: 1.1;
        white-space: normal;
        word-break: break-word;
        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
        z-index: 3;
        transition: all 0.15s ease;

        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;

        &::before {
            content: "";
            position: absolute;
            left: -8px;
            top: 2px;
            height: 100%;
            width: 8px;
            background-color: inherit;
            clip-path: polygon(100% 0, 0 50%, 100% 100%);
            filter: brightness(0.85);
        }

        &::after {
            content: "";
            position: absolute;
            right: -8px;
            top: 2px;
            height: 100%;
            width: 8px;
            background-color: inherit;
            clip-path: polygon(0 0, 100% 50%, 0 100%);
            filter: brightness(0.85);
        }
    }

    .lock-indicator-badge-top {
        position: absolute;
        top: -6px;
        left: 12px;
        background: $color-jet;
        color: $color-alabaster;
        border: 1px solid $color-crimson;
        font-size: 0.65rem;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 12;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }
</style>
