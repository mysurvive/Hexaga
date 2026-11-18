<script>
    import SkillEntry from "../parts/SkillEntry.svelte";
    import AttributeEntry from "../parts/AttributeEntry.svelte";
    import TagifyInput from "../../../../shared/components/TagifyInput.svelte";
    export let actor;
    export let editing;
</script>

<section class="character-tab">
    <div class="flex-row">
        <fieldset class="attribute-field grid-row">
            <legend>Attributes</legend>
            {#each Object.entries(actor.system.attributes).sort(([a], [b]) => a.localeCompare(b)) as [slug, attribute]}
                <AttributeEntry {actor} {slug} {attribute} {editing} />
            {/each}
        </fieldset>
        <fieldset class="expertise-field">
            <legend>Expertise</legend>
            <TagifyInput
                allowed={undefined}
                selections={actor.system.expertise}
                externalBlacklist={actor.system.expertise.map((s) => (typeof s === "object" ? s.slug : s))}
                onChange={async (values) => {
                    const update = { ["system.expertise"]: values };
                    await actor.update(update);
                }}
            />
        </fieldset>
    </div>
    <fieldset class="grid-row">
        <legend>Skills</legend>
        {#each Object.entries(actor.skills).sort(([a], [b]) => a.localeCompare(b)) as [slug, skill]}
            <SkillEntry {actor} {slug} {skill} {editing} />
        {/each}
    </fieldset>
</section>

<style lang="scss">
    .grid-row {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        column-gap: 20px;
        row-gap: 4px;
    }

    fieldset {
        margin-top: 20px;
        max-width: 100%;
    }

    .attribute-field.grid-row {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        gap: 4px;

        fieldset {
            flex: 1 1 0%;
            min-width: 0;

            :global(.tagify) {
                display: flex;
                flex-wrap: wrap;
                min-height: 32px;
                overflow: hidden;
            }

            :global(.tagify__input) {
                align-content: center;
                padding: 0px 4px;
                font-size: 12px;
            }

            :global(.tagify__input:empty:not(:focus)) {
                min-width: 0;
                width: 0;
                align-content: center;
            }

            :global(.tagify__tag) {
                font-size: 12px;
            }
        }
    }
</style>
