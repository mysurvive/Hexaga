<script>
    import { updateActorFromInput } from "../../../components/helpers.ts";

    export let actor;
    export let slug;
    export let attribute;
</script>

<div class="attribute">
    <label class="attribute-label" for={slug}>{window.game.i18n.localize(`hexaga.attributes.${slug}.label`)}</label>
    <input
        type="number"
        id={slug}
        value={attribute.rank}
        on:change={(e) => {
            updateActorFromInput(actor, `system.attributes.${slug}.rank`, e);
        }}
    />
    -
    {attribute.rank + attribute.mod}
</div>

<style lang="scss">
    .attribute {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        gap: 4px;
        height: 22px;
        background: rgba(211, 211, 211, 0.1);
        padding: 2px 6px;
        border-radius: 3px;

        > .attribute-label {
            font-size: 12px;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
        }
        > input {
            height: 18px;
            width: 26px;
        }
    }
</style>
