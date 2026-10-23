import { ItemHexData } from "../../base/data.ts";

export class WeaponData extends ItemHexData<WeaponDataSchema> {
    static override defineSchema(): WeaponDataSchema {
        return defineWeaponSchema();
    }

    override getRollOptions(prefix: string = this.parent.type) {
        const rollOptions = super.getRollOptions(prefix);

        const fullDamagePool = [this.damagePool.base, ...this.damagePool.additional];

        const totalDmp = fullDamagePool.reduce((total, current) => {
            return (total += current.damagePool);
        }, 0);

        rollOptions.push(...fullDamagePool.map((d) => `${prefix}:damage:${d.damageType}`));

        rollOptions.push(
            ...Object.entries({
                [`equipped`]: this.equipped,
                [`equipped:id:${this.parent.id}`]: this.equipped,
                [`damage:dice:${totalDmp}`]: true,
            })
                .filter(([_key, entry]) => entry === true)
                .map(([_key, entry]) => `${prefix}:${entry}`),
        );
        return rollOptions;
    }
}

const defineWeaponSchema = () => {
    return {
        ...ItemHexData.defineSchema(),
        attackType: new fields.StringField({
            required: true,
            nullable: false,
            initial: "melee",
            options: ["ranged", "melee", "magical"],
        }),
        damagePool: new fields.SchemaField({
            base: new fields.SchemaField({
                damagePool: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
                damageType: new fields.StringField({
                    required: true,
                    nullable: false,
                    initial: "bludgeoning",
                    choices: CONFIG.hexaga.damageTypes,
                }),
                flatDamage: new fields.NumberField(),
            }),
            additional: new fields.ArrayField(
                new fields.SchemaField({
                    damagePool: new fields.NumberField({ required: true, nullable: false, initial: 1 }),
                    damageType: new fields.StringField({
                        required: true,
                        nullable: false,
                        initial: "bludgeoning",
                        choices: CONFIG.hexaga.damageTypes,
                    }),
                    flatDamage: new fields.NumberField(),
                }),
            ),
        }),
        attackSkill: new fields.StringField({
            required: true,
            nullable: false,
            initial: "striking",
            choices: CONFIG.hexaga.attackSkills,
        }),
        equipped: new fields.BooleanField({ required: true, nullable: false, initial: false }),
    };
};

type WeaponDataSchema = ReturnType<typeof defineWeaponSchema>;
