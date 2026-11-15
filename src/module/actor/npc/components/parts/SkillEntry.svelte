<script>
    import { updateActorFromInput } from "../../../components/helpers.ts";

    export let actor;
    export let slug;
    export let skill;
</script>

<div class="skill">
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <label
        class="skill-label"
        for={slug}
        on:click={() => {
            skill.roll();
        }}>{skill.label}</label
    >
    <input
        type="number"
        id={slug}
        value={skill.rank}
        on:change={(e) => {
            updateActorFromInput(actor, `system.skills.${slug}.rank`, e);
        }}
    />
    -
    {#if !skill.trained}1*
    {:else}{skill.total}{/if}
</div>

<style lang="scss">
    .skill {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        gap: 4px;
        height: 22px;
        background: rgba(211, 211, 211, 0.1);
        padding: 2px 6px;
        border-radius: 3px;

        > .skill-label {
            font-size: 12px;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;

            &:hover {
                text-shadow:
                    0px 0px 4px orange,
                    0px 0px 10px orange,
                    0px 0px 15px orange;
            }
        }
        > input {
            height: 18px;
            width: 26px;
        }
    }
</style>
