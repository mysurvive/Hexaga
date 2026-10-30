<script>
    import OptionSelection from "../parts/OptionSelection.svelte";

    export let item;

    $: improvements = item.system.improvements;
    $: assignedAspectUuid = improvements?.aspects || "";

    let linkedAspectName = "No Aspect Tree Linked";
    let linkedAspectImg = "icons/svg/item-bag.svg";

    $: if (assignedAspectUuid) {
        const doc = fromUuidSync(assignedAspectUuid);
        if (doc) {
            linkedAspectName = doc.name;
            linkedAspectImg = doc.img;
        }
    } else {
        linkedAspectName = "No Aspect Tree Linked";
        linkedAspectImg = "icons/svg/item-bag.svg";
    }

    async function handleAspectDrop(event) {
        event.preventDefault();
        try {
            const dropData = JSON.parse(event.dataTransfer.getData("text/plain"));
            if (dropData.type !== "Item") return;

            const droppedItem = await Item.fromDropData(dropData);
            if (!droppedItem || droppedItem.type !== "aspect") {
                ui.notifications.warn("Only Aspect items can be added here.");
                return;
            }

            const rules = item.system.rules;
            rules.push({
                domains: ["all"],
                key: "GrantItem",
                slug: `${item.slug}-aspect`,
                config: { uuid: droppedItem.uuid },
            });

            await item.update({ "system.improvements.aspects": droppedItem.uuid, "system.rules": rules });
        } catch (err) {
            console.error("Failed to parse dropped element structural configuration data:", err);
        }
    }

    async function clearLinkedAspect() {
        await item.update({ "system.improvements.aspects": "" });
    }
</script>

<section class="item-tab">
    <div class="foundational-improvements">
        {#if item.type === "heritage"}
            <OptionSelection
                {item}
                titleKey="attributes"
                localizationPrefix="hexaga"
                path="system.improvements.attributes.selected"
                countPath="system.improvements.attributes.allowed"
                choices={improvements.attributes.choices ?? []}
                selected={improvements.attributes.selected ?? []}
                amount={improvements.attributes.allowed ?? 0}
            />
        {/if}
        {#if item.type === "profession"}
            <OptionSelection
                {item}
                titleKey="skills"
                localizationPrefix="hexaga"
                path="system.improvements.skills.selected"
                countPath="system.improvements.skills.allowed"
                choices={item.system?.improvements?.skills?.choices ?? []}
                selected={item.system?.improvements?.skills?.selected ?? []}
                amount={item.system?.improvements?.skills?.allowed ?? 0}
            />
            <OptionSelection
                {item}
                titleKey="expertise"
                localizationPrefix="hexaga"
                path="system.improvements.expertise.selected"
                countPath="system.improvements.expertise.allowed"
                amount={item.system?.improvements?.expertise?.allowed ?? 0}
            />
        {/if}
    </div>

    <div class="aspect-linkage-panel">
        <div class="section-title">Granted Baseline Talent Tree</div>
        <hr />

        <div
            class="aspect-drop-zone"
            class:has-link={!!assignedAspectUuid}
            on:dragover|preventDefault
            on:drop={handleAspectDrop}
            role="region"
            aria-label="Aspect Template Drop Zone"
        >
            <img class="slot-icon" src={linkedAspectImg} alt={linkedAspectName} />
            <div class="slot-details">
                <span class="slot-title">{linkedAspectName}</span>
                <span class="slot-hint">Drag & drop an Aspect here to link it as a starting tree.</span>
            </div>
            {#if assignedAspectUuid}
                <button
                    type="button"
                    class="clear-link-btn"
                    on:click={clearLinkedAspect}
                    title="Remove attached linkage blueprint configuration"
                >
                    <i class="fas fa-times-circle"></i>
                </button>
            {/if}
        </div>
    </div>
</section>

<style lang="scss">
    .item-tab {
        overflow-y: auto;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .aspect-linkage-panel {
        margin-top: 8px;

        .section-title {
            font-weight: bold;
            font-size: 1.1rem;
            color: #e8eddf;
            text-transform: uppercase;
        }

        hr {
            border: none;
            border-top: 1px solid #333533;
            margin: 6px 0 12px 0;
        }
    }

    .aspect-drop-zone {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background-color: #1e1e1d;
        border: 2px dashed #333533;
        border-radius: 4px;
        position: relative;
        transition:
            border-color 0.2s ease,
            background-color 0.2s ease;

        &.has-link {
            border-style: solid;
            border-color: #f49d37;
            background-color: rgba(244, 157, 55, 0.03);
        }

        .slot-icon {
            width: 32px;
            height: 32px;
            border: 1px solid #333533;
            background-color: #242423;
            border-radius: 4px;
        }

        .slot-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex-grow: 1;

            .slot-title {
                font-weight: bold;
                font-size: 0.9rem;
                color: #e8eddf;
            }

            .slot-hint {
                font-size: 0.75rem;
                color: #8c8c8a;
            }
        }

        .clear-link-btn {
            background: transparent;
            border: none;
            color: #6a6a68;
            cursor: pointer;
            font-size: 1rem;
            padding: 4px;
            transition: color 0.15s ease;

            &:hover {
                color: #ff4a4a;
            }
        }
    }
</style>
