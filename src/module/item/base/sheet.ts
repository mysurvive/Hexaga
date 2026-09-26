import ItemSheetV2 = foundry.applications.sheets.ItemSheetV2;

const HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export default class HexItemSheet extends HandlebarsApplicationMixin(ItemSheetV2)<
    ItemSheetV2.RenderContext,
    ItemSheetV2.Configuration,
    ItemSheetV2.RenderOptions
> {
    static override DEFAULT_OPTIONS = {
        position: { width: 600, height: 400 },
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
            handler: this.#onSubmit,
        },
    };

    static async #onSubmit(
        this: HexItemSheet,
        _event: Event,
        _form: HTMLFormElement,
        _formData: FormData,
    ): Promise<void> {}
}
