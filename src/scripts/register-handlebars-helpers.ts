export function registerHandlebarsHelpers(): void {
    type operatorTypes = "eq" | "noteq" | "gt" | "or" | "and" | "%";

    Handlebars.registerHelper("when", function (this: unknown, op1, operator: operatorTypes, op2, opts) {
        const operators = {
                eq: function (l: unknown, r: unknown) {
                    return l === r;
                },
                noteq: function (l: unknown, r: unknown) {
                    return l !== r;
                },
                gt: function (l: unknown, r: unknown) {
                    return Number(l) > Number(r);
                },
                or: function (l: unknown, r: unknown) {
                    return l || r;
                },
                and: function (l: unknown, r: unknown) {
                    return l && r;
                },
                "%": function (l: number, r: number) {
                    return l % r === 0;
                },
            },
            result = operators[operator](op1, op2);

        if (result) return opts.fn(this);
        else return opts.inverse(this);
    });

    Handlebars.registerHelper("log", (handlebarsItem: unknown) => {
        console.log(handlebarsItem);
    });

    Handlebars.registerHelper("key", function (opts) {
        return opts.data.key ?? opts.data.root.key;
    });
}
