import { ItemHexData } from "../../base/data.ts";

export class ArmorData extends ItemHexData<ArmorDataSchema> {
    static override defineSchema(): ArmorDataSchema {
        return defineArmorSchema();
    }

    override getRollOptions(prefix: string = this.parent.type) {
        const rollOptions = super.getRollOptions(prefix);

        rollOptions.push(
            ...Object.entries({
                [`equipped`]: this.equipped,
                [`equipped:${this.slug}`]: this.equipped,
                [`equipped:${this.parent.id}`]: this.equipped,
                [`ablation:${this.ablation}`]: true,
            })
                .filter(([_key, entry]) => entry === true)
                .map(([key, _entry]) => `${prefix}:${key}`),
        );

        return rollOptions;
    }

    modifyDurability(durabilityDelta: number) {
        const newDurability = Math.clamp(0, this.durability.max, this.durability.current + durabilityDelta);
        this.updateSource({ durability: { current: newDurability } });
    }
}

const defineArmorSchema = () => {
    return {
        ...ItemHexData.defineSchema(),
        equipped: new fields.BooleanField({ required: true, nullable: false, initial: false }),
        ablation: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        durability: new fields.SchemaField({
            current: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
            max: new fields.NumberField({ required: true, nullable: false, initial: 0 }),
        }),
        requirements: new fields.SchemaField({}),
    };
};

type ArmorDataSchema = ReturnType<typeof defineArmorSchema>;
