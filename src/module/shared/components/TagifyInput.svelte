<script>
    import Tagify from "@yaireo/tagify";
    import "@yaireo/tagify/dist/tagify.css";

    export let onChange = (values) => {};
    export let allowed;
    export let selections;
    export let externalBlacklist;

    let tagifyInstance;

    function initializeTagify(node, currentAllowed) {
        const initialValue = selections ? selections.map((s) => (typeof s === "object" ? s.value : s)).join(", ") : "";
        node.value = initialValue;

        const activeSelections = selections ? [...selections] : undefined;
        const activeSelectionStrings = activeSelections?.map((s) => (typeof s === "object" ? s.slug : s)) ?? [];

        const baseBlacklist = externalBlacklist || [];
        const filteredBlacklist = baseBlacklist.filter((i) => !activeSelectionStrings.includes(i));

        tagifyInstance = new Tagify(node, {
            maxTags: currentAllowed + (selections?.length ?? 0),
            blacklist: filteredBlacklist,
            addTagOn: ["enter"],
            pattern: null,
            dropdown: {
                enabled: 0,
                closeOnSelect: true,
            },
            tagTextProp: "value",
            userInput: true,
            transformTag: function (tagData) {
                if (tagData.slug) return;

                const rawText = tagData.value;
                tagData.value = rawText;
                tagData.slug = rawText.slugify();
            },
        });

        tagifyInstance.on("change", async (e) => {
            const rawValue = e.detail.value;
            const parsedTags = rawValue ? JSON.parse(rawValue) : [];

            if (parsedTags.length !== (selections?.length ?? 0)) {
                await onChange(parsedTags);
            }
        });

        return {
            update(newAllowed) {
                if (tagifyInstance && newAllowed !== undefined) {
                    tagifyInstance.settings.maxTags = newAllowed + tagifyInstance.value.length;
                }
            },
            destroy() {
                if (tagifyInstance) {
                    tagifyInstance.destroy();
                    tagifyInstance = null;
                }
            },
        };
    }
</script>

<div>
    <input use:initializeTagify={allowed} placeholder="Enter choices here" />
</div>

<style>
    :global(.tagify) {
        --placeholder-color: white;
        --placeholder-color-focus: white;
        --tags-focus-border-color: #f49d37;
    }
    div :global(.tagify) {
        width: 100%;
        flex-wrap: nowrap;
        overflow-x: hidden;
        margin-top: 5px;
    }
    div :global(.tagify__input) {
        white-space: nowrap;
        overflow: hidden;
    }
    div :global(.tagify:not(.tagify--empty) .tagify__input::before) {
        display: none;
    }
</style>
