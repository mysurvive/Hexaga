import { ItemHexData } from "../../base/data.ts";
import { AspectNodeConnectorData } from "./aspectNodeConnectorData.ts";

export class AspectData extends ItemHexData<AspectSchema> {
    static override defineSchema(): AspectSchema {
        return defineAspectSchema();
    }

    prepareActorData() {
        const actor = this.parent.actor;
        const slug = this.slug ?? this.parent.name.slugify();

        if (!actor) return;

        const aspectSlug = this.slug || this.parent.name.slugify();
        const canvasNodes = this.tree?.nodes || [];
        const rollOptions = actor.system.rollOptions?.all;

        if (!rollOptions) return;
        rollOptions[`aspect:${slug}`] = true;

        for (const canvasNode of canvasNodes) {
            const ownedNodeInstance = actor.items.find((i) => {
                return i.sourceId === canvasNode.nodeUUID;
            });

            if (ownedNodeInstance) {
                const nodeSlug = ownedNodeInstance.system.slug || ownedNodeInstance.name.slugify();
                rollOptions[`aspect:${aspectSlug}:node:${nodeSlug}`] = true;
            }
        }
    }
}

const defineAspectSchema = () => {
    return {
        ...ItemHexData.defineSchema(),
        hpPerNode: new fields.NumberField({ required: true, nullable: false, initial: 3 }),
        level: new fields.SchemaField({
            taken: new fields.NumberField(),
        }),
        tree: new fields.SchemaField({
            nodes: new fields.ArrayField(new fields.EmbeddedDataField(AspectNodeConnectorData), {
                required: true,
                nullable: false,
                initial: [],
            }),
            backgroundImage: new fields.FilePathField({
                categories: ["IMAGE"],
                required: false,
            }),
        }),
    };
};

type AspectSchema = ReturnType<typeof defineAspectSchema>;
