// We need to figure out how to report errors (anywhere I thought needed an error reported I made a comment)
// We need to figure out how to write test cases (I have examples below but can't make a check)
// We need to do handle Binops in interp
// We need to do parsing (doing this will make testing super easy!)
import { expect } from 'chai';


// Defining ExprC
type ExprC = { tag: 'True' }
    | { tag: 'False' }
    | { tag: 'NumC', n: number }
    | { tag: 'IfC', test: ExprC, first: ExprC, second: ExprC }
    | { tag: 'BinopC', op: string, l: ExprC, r: ExprC }
    | { tag: 'IdC', id: string }
    | { tag: 'AppC', fun: ExprC, args: ExprC[] }
    | { tag: 'LamC', args: string[], body: ExprC };

// Defining Value
type Value = { tag: 'NumV', val: number }
    | { tag: 'BoolV', val: boolean }
    | { tag: 'CloV', args: string[], body: ExprC, env: Env };

const operations = {};

// Defining Binding & Env
type Binding = { tag : 'Binding', name: string, val: Value };
type Env = Binding[];


function interp(a: ExprC, env: Binding[]): Value
{
    switch (a.tag)
    {
        case 'True': { return { tag: 'BoolV', val: true }; }
        case 'False': { return { tag: 'BoolV', val: false }; }
        case 'NumC': { const { n } = a; return { tag: 'NumV', val: n }; }
        case 'IdC': { const { id } = a; return lookup(id, env); }
        case 'LamC': { const { args, body } = a; return { tag: 'CloV', args: args, body: body, env: env }; }
        case 'IfC': { const { test, first, second } = a; return handleIf(test, first, second, env); }
        case 'BinopC': { const { op, l, r } = a; return handleBinop(op, l, r, env); }
        case 'AppC': { const { fun, args } = a; return handleAppC(fun, args, env); }
    }
}

function handleIf(test: ExprC, first: ExprC, second: ExprC, env: Env) : Value
{
    var evaluated = interp(test, env);
    switch (evaluated.tag)
    {
        case 'BoolV':
        {
            const { val } = evaluated;
            if (val == true)
                return interp(first, env); 
            else
                return interp(second, env); 
        }
        default: { return null;} //ERROR (replace "return null;" with the error)
    }
}

function handleBinop(op: string, l: ExprC, r: ExprC, env: Env): Value
{

    return null;
}

function handleAppC(fun: ExprC, args: ExprC[], env: Env): Value
{
    var evaluated = interp(fun, env);
    if (evaluated.tag == 'CloV') {
        if (evaluated.args.length == args.length)
        {
            var new_env = createEnv(evaluated.args, args, env);
            new_env.concat(evaluated.env);
            return interp(evaluated.body, new_env);
        }
        else
            return null; //ERROR (replace "return null;" with the error)
    }
    else
        return null; //ERROR (replace "return null;" with the error)
}

function createEnv(s: string[], e: ExprC[], env: Env): Env
{
    if (s.length == 0)
        return [];
    else
    {
        var temp = createEnv(rest(s), rest(e), env);
        temp.unshift({ tag: 'Binding', val: interp(first(e), env), name:first(s)});
        return temp;
    }
}

function lookup(f: string, env: Env): Value
{
    if (env.length == 0)
    {
        return null; //ERROR (replace "return null;" with the error)
    }
    if (first(env).name == f)
        return first(env).val;
    else
        return lookup(f, rest(env));
}

function cons<T>(f: T, arr: T[]): T[] //Don't think I use this function but wrote it if anyone needs it
{
    arr.unshift(f);
    return arr;
}

function first<T>(arr: T[]): T
{
    if (arr.length > 0)
        return arr[0];
    else
        return null; //ERROR (replace "return null;" with the error)
}

function rest<T>(arr: T[]): T[]
{
    if (arr.length > 0)
        return arr.slice(1);
    else
        return null; //ERROR (replace "return null;" with the error)
}

function parse(s: any[]): ExprC
{
    if (s.length == 0)
        return null;
    if (typeof (s[0]) == 'number')
        return {tag : 'NumC', n : s[0]};
    if (s[0] == 'true')
        return { tag: 'True' };
    if (s[0] == 'false')
        return { tag: 'False' };
}

//console.log(interp(parse([5]), []));
//console.log(handleIf(parse([3]), parse([7]), parse([1]), []));
//console.log(interp({ tag: 'AppC', fun: { tag: 'LamC', args: ["x", "y"], body: { tag: 'IdC', id: "y" } }, args: [{ tag: 'NumC', n: 5 }, { tag: 'NumC', n: 7 }] }, []));
//console.log(interp({ tag: 'AppC', fun: { tag: 'LamC', args: ["a", "b"], body: { tag: 'IfC', test: { tag: 'IdC', id: "a" }, first: { tag: 'IdC', id: "b" }, second: parse([2]) } }, args: [parse(['true']), parse(['false'])] }, []));


// ------------------------- Parse tests ----------------------- // 
describe('Parse test for number', () => {
    it('should create a numC', () => {
        const result = parse([3]);
        expect(result).to.have.deep.property('tag', 'NumC');
        expect(result).to.have.deep.property('n', 3);
    })
})

describe('Parse test for true value', () => {
    it('should create True', () => {
        const result = parse(['true']);
        expect(result).to.have.deep.property('tag', 'True');
    })
})

describe('Parse test for false value', () => {
    it('should create False', () => {
        const result = parse(['false']);
        expect(result).to.have.deep.property('tag', 'False');
    })
})

// ------------------------- Interp tests -------------------- //
describe('Interp test for true expression', () => {
    it('should create a true boolV', () => {
        const result = interp({tag: 'True'}, []);
        expect(result).to.have.deep.property('tag', 'BoolV');
        expect(result).to.have.deep.property('val', true);
    })
})

describe('Interp test for false expression', () => {
    it('should create a false boolV', () => {
        const result = interp({tag: 'False'}, []);
        expect(result).to.have.deep.property('tag', 'BoolV');
        expect(result).to.have.deep.property('val', false);
    })
})

describe('Interp test for number expression', () => {
    it('should create a numV', () => {
        const result = interp({tag: 'NumC', n: 3}, []);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 3);
    })
})

describe('Interp test for variable reference expression', () => {
    it('should create a numV for the variable', () => {
        const result = interp({tag: 'IdC', id: "x"}, 
            [{tag : 'Binding', name: "x", val: {tag : 'NumV', val: 3}}]);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 3);
    })
})

describe('Interp test for a LamC expression', () => {
    it('should create a cloV', () => {
        const result = interp({tag: 'LamC', args: ["x", "y"],
            body: {tag : 'BinopC', op: "+", l: {tag : 'NumC', n: 3},
                r: {tag: 'NumC', n: 2}}}, []);
        expect(result).to.have.deep.property('tag', 'CloV');
        expect(result).to.have.deep.property('args', ["x", "y"]);
        expect(result).to.have.deep.property('body', 
        {tag : 'BinopC', op: "+", l: {tag : 'NumC', n: 3},
            r: {tag: 'NumC', n: 2}});
    })
})

describe('Interp test for a IfC expression', () => {
    it('should return the correct value depending on the test', () => {
        const result = interp({tag: 'IfC', test: parse(['true']), 
            first: {tag: 'NumC', n: 3}, second: {tag: 'NumC', n: 2}}, []);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 3);
    })
})

describe('Interp test for a Binop expression', () => {
    it('should return the correct value depending on the test', () => {
        const result = interp({tag : 'BinopC', op: "+", 
            l: {tag : 'NumC', n: 3}, r: {tag: 'NumC', n: 2}}, []);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 5);
    })
})

describe('Interp test for an AppC expression', () => {
    it('should return value of the application', () => {
        const result = interp({tag : 'AppC', fun: {tag: 'IdC', id: "fun1"},
            args: [{tag: 'NumC', n: 3}]}, 
            [{tag: 'Binding', name: "fun1", 
                val: {tag: 'CloV', args: ["x"], body: {tag: 'IdC', id: "x"}, env: []}}]);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 3);
    })
})

// ------------------------- If tests ----------------------- // 
describe('handleIf test with a true test expression', () => {
    it('should return the first value', () => {
        const result = handleIf(parse(['true']), parse([1]), parse([0]), []);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 1);
    })
})

describe('handleIf test with a false test expression', () => {
    it('should return the first value', () => {
        const result = handleIf(parse(['false']), parse([1]), parse([0]), []);
        expect(result).to.have.deep.property('tag', 'NumV');
        expect(result).to.have.deep.property('val', 0);
    })
})

