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
                lt: function (l: unknown, r: unknown) {
                    return Number(l) < Number(r);
                },
                lte: function (l: number, r: number) {
                    return Number(l) <= Number(r);
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

    Handlebars.registerHelper("stringify", function (context) {
        try {
            return JSON.stringify(context, null, 2);
        } catch (error) {
            return `[JSON Stringify Error]: ${error}`;
        }
    });

    Handlebars.registerHelper("includes", function (this: unknown, arrayOrString, value, options) {
        if (!arrayOrString) return options.inverse(this);
        if (arrayOrString.includes(value)) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
}
