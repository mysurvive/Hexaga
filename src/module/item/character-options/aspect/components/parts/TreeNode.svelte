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
    <div class="node-icon-frame">
        <img src={meta.img} alt={meta.name} class="node-img" draggable="false" />

        {#if nodeStatus === "locked"}
            <div class="lock-indicator-badge-top" title="Prerequisites or Level constraints unfulfilled">
                <i class="fas fa-lock"></i>
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
    $color-platinum: #cfdbd5;
    $color-alabaster: #e8eddf;
    $color-orange: #f49d37;
    $color-jet: #242423;
    $color-charcoal: #333533;
    $color-crimson: #a23944;

    .tree-node {
        position: absolute;
        width: 44px;
        height: 44px;
        cursor: grab;
        transform: translate(-50%, -50%);
        transition:
            box-shadow 0.15s,
            transform 0.1s ease-out;
        z-index: 10;

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
            .node-icon-frame {
                border-color: $color-orange !important;
                box-shadow: 0 2px 8px rgba(244, 157, 55, 0.4) !important;
            }
            .node-img {
                filter: grayscale(0%) contrast(100%) !important;
            }
        }

        &.status-available {
            .node-icon-frame {
                border-color: rgba($color-platinum, 0.4) !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
            }
            .node-img {
                filter: grayscale(100%) brightness(80%) !important;
            }

            &:hover {
                .node-icon-frame {
                    border-color: $color-orange !important;
                    transform: scale(1.06);
                }
                .node-img {
                    filter: grayscale(30%) brightness(95%) !important;
                }
            }
        }

        &.status-locked {
            .node-icon-frame {
                border-color: $color-crimson !important;
                border-style: solid !important;
                box-shadow: none !important;
            }
            .node-img {
                filter: grayscale(100%) opacity(0.35) !important;
            }
        }

        &.is-selected .node-icon-frame {
            border-color: $color-alabaster !important;
            box-shadow: 0 0 10px $color-orange !important;
        }
    }

    .node-icon-frame {
        position: relative;
        width: 100%;
        height: 100%;
        background: $color-jet;
        border: 2px solid rgba($color-charcoal, 0.8);
        border-radius: 4px;
        overflow: visible;
        transition:
            border-color 0.15s,
            transform 0.12s ease-out;
    }

    .node-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        user-select: none;
        -webkit-user-drag: none;
    }

    .lock-indicator-badge-top {
        position: absolute;
        top: -6px;
        right: -6px;
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
