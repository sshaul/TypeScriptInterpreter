class ExprC
{
    constructor() {}
}

class NumC extends ExprC
{
    constructor(readonly value: number) { super(); }
}

class BoolC extends ExprC
{
    constructor(readonly value: boolean) { super(); }
}

function parse(s: any[]): ExprC
{
    if (s.length == 0)
        return null;
    if (typeof (s[0]) == 'number')
        return new NumC(s[0]);
    if (s[0] == 'true')
        return new BoolC(true);
    if (s[0] == 'false')
        return new BoolC(false);
}

console.log(parse([5]));
