//"use strict";

let opTypes = "=+-*/<>"

let varTypes = ["int", "str", "flt", "dbl", "fn", "def"]
let formattedVarTypes = varTypes.map(e => e + "Type")

let lTypesToCTypes = {
    "int": "int",
    "str": "string",
    "flt": "float",
    "dbl": "double",
    "fn":  "???",
    "def": "void"
}

let stats = {
    "print": "print",
    "input": "input"
}

let defaultContent = {
    "int": { type: "num", content: "0" },
    "str": { type: "str", content: "" },
    "flt": { type: "num", content: "0.0" },
    "dbl": { type: "num", content: "0.0" },
    "arr": { type: "???" },
    "fn":  { type: "???" },
    "var": { type: "???" }
}

let operationFunctions = {
    "+":  "sum",
    "-":  "sub",
    "*":  "mul",
    "/":  "div",
    "==": "eql",
    "!=": "nql",
    "<": "lss",
    ">": "mrr",
    "<=": "leq",
    "=<": "leq",
    ">=": "meq",
    "=>": "meq",

    "l": "String::length(%)",
    "tint": "String::toint(%)",
    "lower": "String::lower(%)",
    "upper": "String::upper(%)"
}

let genCodeLib = `
// std::vector<int> v { 10, 20, 30 };

// transform(v.begin(), v.end(), v.begin(), [](int &c){ return c * 2; });

// for (int a : v) {
//     print(a); print(" ");
// }

#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>
#include <vector>

using namespace std;

class String {
    public:
        static int toint(string a) {
            try {
                return stoi(a);
            } catch (...) {
                return 0;
            }
        }
        static string lower(string a) {
            transform(a.begin(), a.end(), a.begin(), [](unsigned char c){ return tolower(c); });
            return a;
        }
        static string upper(string a) {
            transform(a.begin(), a.end(), a.begin(), [](unsigned char c){ return toupper(c); });
            return a;
        }
        static int length(string a) {
            return a.length();
        }
};

class Vector {
};

string print(string i) { cout << i; return i; }
float  print(float i)  { cout << i; return i; }

string input(string i) { cout << i; string _retstr; getline(cin, _retstr); return _retstr; }

float  _sum(float a , float b ) { return a + b; }
string _sum(string a, float b ) { return to_string(b) + a; }
string _sum(float a , string b) { return to_string(a) + b; }
string _sum(string a, string b) { return a + b; }

float  _sub(float a , float b ) { return a - b; }
// string _sub(string a, float b ) { return to_string(b) + a; }
// string _sub(float a , string b) { return to_string(a) + b; }
// string _sub(string a, string b) { return a + b; }

float  _mul(float a , float b ) { return a * b; }
string _mul(string a, int b   ) { string r = ""; for (int c = 0; c < b; c++) { r += a; } return r; }

int _eql(float a , float b ) { return a == b; }
int _eql(string a, string b) { return a == b; }

int _lss(float a , float b ) { return a < b; }
int _lss(string a, string b) { return a.length() < b.length(); }

int _leq(float a , float b ) { return a <= b; }
int _meq(float a , float b ) { return a >= b; }

int _mrr(float a , float b ) { return a > b; }
int _mrr(string a, string b) { return a.length() > b.length(); }

`

let functions = ""
let variableCode = ""

let genCodeStart = `
int main() {
`

let genCodeEnd = `
    std::cout << '\\n';
    return 0;
}
`

let controlFlow = ["if", "while", "for", "scan"]

let lastVariableType = ""

if (process.argv.length == 2) {
    console.error("usage: compiler [file name]")
    process.exit(1)
}

const fs = require("fs")
const util = require("util")
const { exec } = require("child_process")

fs.readFile(process.argv[2], "utf8", (err, data) => {
    save(compile(data), process.argv[2].replace(".l", ""))
})

String.prototype.any = function(c) { return this.includes(c) }

function error(message) {
    console.error(`\x1b[31mERROR at ${arguments.callee.caller.name}: ${message}`)
    process.exit(1)
}

function save(code, name) {
    fs.writeFile(name + ".cpp", code, "utf8", function fileWrite(){
        exec(`g++ -std=c++11 -stdlib=libc++ ${name}.cpp ${process.argv.splice(3).join(" ")}`, function compile(err) {
            if (err) {
                error(err)
            }
        })
    })
}

function compile(program) {
    let tokens   = tokenize  (program)
    let ast      = parse     (tokens)  // This is mutated with modify. Oh no.
    modify    (ast)
    operations(ast)
    variables (ast)
    console.log(util.inspect(ast, false, null, true))
    control   (ast)
    let code     = generate(ast)
    code      = indent(code, 1)
    functions = indent(functions, 0)
    variableCode = indent(variableCode, 0)
    code = genCodeLib + variableCode + functions + genCodeStart + code + genCodeEnd
    return code
}

function tokenize(program) {
    program = program.split("\n")
                     .map(e => e.split("#")[0])
                     .join("\n")
    let tokens = []
    let currentChar = 0
    while (currentChar < program.length) {
        let c = program[currentChar]
        if (" \n".any(c)) {
            // Do nothing :O
        } else if (c == ',') {
            tokens.push({
                type: "sep",
                content: ','
            })
        } else if ("@&".includes(c)) {
            tokens.push({
                type: "mod",
                content: c
            })
        } else if (opTypes.any(c)) {
            let fullNam = c
            c = program[++currentChar]
            while (opTypes.any(c)) {
                fullNam += c
                c = program[++currentChar]
            }
            currentChar--
            tokens.push({
                type: "opr",
                content: fullNam
            })
        } else if ("()[]{}".any(c)) {
            let types = {
                '(': "opar",
                ')': "cpar",
                '[': "oarr",
                ']': "carr",
                '{': "oblk",
                '}': "cblk"
            }
            tokens.push({
                type: types[c],
                content: c
            })
        } else if ("0123456789.".any(c)) {
            let fullNum = c
            c = program[++currentChar]
            while ("0123456789.".any(c)) {
                fullNum += c
                c = program[++currentChar]
            }
            currentChar--
            if (fullNum == ".") {
                tokens.push({
                    type: "opr",
                    content: "."
                })
            } else {
                tokens.push({
                    type: "num",
                    content: fullNum
                })
            }
        } else if (c == '"') {
            let fullString = ""
            c = program[++currentChar]
            while (c != '"') {
                fullString += c
                c = program[++currentChar]
                if (currentChar >= program.length) {
                    error("String not closed!")
                }
                if (program[currentChar - 1] == '\\') {
                    fullString = fullString.slice(0, -1)
                    if (c == 'n') c = "\\n"
                    fullString += c
                    c = program[++currentChar]
                }
            }
            tokens.push({
                type: "str",
                content: fullString
            })
        } else if ("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_".any(c)) {
            let fullNam = c
            c = program[++currentChar]
            while ("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789_".any(c)) {
                fullNam += c
                c = program[++currentChar]
            }
            currentChar--
            if (varTypes.includes(fullNam)) {
                tokens.push({
                    type: fullNam + "Type",
                    content: fullNam
                })
            } else {
                tokens.push({
                    type: "nam",
                    content: fullNam
                })
            }
        } else {
            error(`Character not recognized: \`${c}\``)
        }
        currentChar++
    }
    return tokens
}

function parse(tokens) {
    let ast = {
        type: "Program",
        content: []
    }
    let c = 0
    function walk() {
        let token = tokens[c]
        if (["num", "str", "nam", "opr", ...formattedVarTypes].includes(token.type)) {
            c++
            return token
        }
        if (token.type == "oarr") {
            let node = {type: "arr", content: []}
            c++
            token = walk()
            while (token.type != "carr") {
                if (node.content.length == 0) node.content.push([])
                if (token.type != "sep") {
                    node.content[node.content.length - 1].push(token)
                } else {
                    node.content.push([])
                }
                token = walk()
            }
            return node
        }
        if (token.type == "opar") {
            let node = {type: "paren", content: []}
            c++
            token = walk()
            while (token.type != "cpar") {
                if (node.content.length == 0) node.content.push([])
                if (token.type != "sep") {
                    node.content[node.content.length - 1].push(token)
                } else {
                    node.content.push([])
                }
                token = walk()
            }
            return node
        }
        if (token.type == "oblk") {
            let node = {type: "block", content: []}
            c++
            token = walk()
            while (token.type != "cblk") {
                node.content.push(token)
                token = walk()
            }
            return node
        }
        if (["carr", "cpar", "cblk", "sep"].includes(token.type)) {
            c++
            return {type: token.type}
        }
        if (token.type == "mod") {
            c++
            return {type: token.type, content: token.content}
        }
        error(`Unknown token: ${token.type} \`${token.content}\``)
    }
    while (c < tokens.length) {
        ast.content.push(walk())
    }
    return ast
}

function modify(ast) {
    let modified = ast.content
    let c = 0
    while (c < modified.length) {
        let p = modified[c++]
        if (["paren", "arr"].includes(p.type)) {
            p.content = p.content.map(e => modify({content: e}).content)
        } else if (p.type == "block") {
            p = modify(p)
        } else if (p.type == "ctrl") {
            p.arguments = p.arguments.map(e => modify({content: e}).content)
        } else if (p.type == "nam") {
            if (c >= modified.length) continue
            if (modified[c].type == "paren") {
                p.type = "call"
                for (let a = 0; a < modified[c].content.length; a++) {
                    modified[c].content[a] = modify({content: modified[c].content[a]}).content
                }
                p.arguments = modified[c].content
                if (controlFlow.includes(p.content)) {
                    p.type = "ctrl"
                }
                modified.splice(c, 1)
            }
        }
    }
    return ast
}

function operations(ast) {
    let modified = ast.content
    let c = 0
    while (c < modified.length) {
        let p = modified[c++]
        if (["paren", "arr"].includes(p.type)) {
            p.content = p.content.map(e => operations({content: e}).content)
        } else if (p.type == "block") {
            p = operations(p)
        } else if (p.type == "call") {
            p.arguments = p.arguments.map(e => operations({content: e}).content)
        } else if (p.type == "ctrl") {
            p.arguments = p.arguments.map(e => operations({content: e}).content)
        } else if (p.type == "opr" && p.content == '=') {
            if (c == 1) error(`Unexpected \`=\``)
            if (modified[c - 2].type == "opr") {
                modified[c - 2].content += '='
                modified.splice(c - 1, 1)
            }
        } else if (p.type == "opr" && ["++", "--"].includes(p.content)) {
            if (c == 1) error(`Expected statement before \`${p.content}\``)
            if (modified[c - 2].type != "nam") error(`Unexpected ${modified[c - 2].type} before \`${p.content}\``)
            modified[c - 1].content = p.content[0] + "="
            modified.splice(c, 0, {type: "num", content: '1'})
        } else if (p.type == "opr") {
            if (p.name != undefined) continue
            if (c == 1) error(`Expected statement before \`${JSON.stringify(p)}\``)
            if (c == modified.length) error(`Expected statement after \`${p.content}\``)
            if (["++", "--", "+=", "-=", "*=", "/="].includes(p.content)) continue
            modified.splice(c - 2, 0, {
                type: "opr",
                name: p.content,
                arguments: [
                    modified[c - 2],
                    modified[c]
                ]
            })
            modified.splice(--c, 3)
        }
    }
    return ast
}

function variables(ast) {
    let declaredVars = ast.content
    let c = 0
    while (c < declaredVars.length) {
        let p = declaredVars[c++]
        if (["paren", "arr"].includes(p.type)) {
            p.content = p.content.map(e => variables({content: e}).content)
        } else if (p.type == "block") {
            p = variables(p)
        } else if (p.type == "call") {
            p.arguments = p.arguments.map(e => variables({content: e}).content)
        } else if (p.type == "ctrl") {
            p.arguments = p.arguments.map(e => variables({content: e}).content)
        } else if (formattedVarTypes.includes(p.type)) {
            if (declaredVars[c].type == "call") {
                p.content = {
                    type: p.type,
                    name: declaredVars[c].content,
                    arguments: declaredVars[c].arguments.map(e => variables({content: e}).content)
                }
                p.type = "function"
                declaredVars.splice(c, 1)
                continue
            } else if (declaredVars[c].type == "mod") {
                p.array = true
                declaredVars.splice(c, 1)
            } else if (declaredVars[c].type != "nam") {
                error(`Expected variable name after \`${p.content}\`, got \`${declaredVars[c].type}\``)
            }
            // Declaration
            if (c >= declaredVars.length) error(`Expected variable name after \`${p.content}\``)
            if (c > declaredVars.length - 2 || declaredVars[c + 1].content != '=') {
                p.content = {
                    type: p.type,
                    name: declaredVars[c].content,
                    // content: [ defaultContent[p.type.replace("Type",'')] ]
                }
                p.type = "declare"
                declaredVars.splice(c, 1)
            } else {
                p.content = {
                    type: p.type,
                    name: declaredVars[c].content,
                    content: [ declaredVars[c + 2] ]
                }
                p.type = "declare"
                declaredVars.splice(c, 3)
            }
            if ([...varTypes, ...controlFlow].includes(p.content.name)) error(`\`${p.content.name}\` can't be used as a variable name`)
        } else if (p.type == "nam") {
            if (c >= declaredVars.length) continue
            //if (declaredVars[c].type != "opr") error(`Expected \`opr\`, got \`${declaredVars[c].type}\``)
            if (c >= declaredVars.length - 1) error(`Expected something after \`${declaredVars[c].content}\``)
            p.content = {
                type: declaredVars[c].content,
                name: p.content,
                content: [ declaredVars[c + 1] ],
            }
            p.type = "modify"
            declaredVars.splice(c, 2)
        }
    }
    return ast
}

function control(ast) {
    let modified = ast.content
    let c = 0
    while (c < modified.length) {
        let p = modified[c++]
        if (["paren", "arr"].includes(p.type)) {
            p.content = p.content.map(e => control({content: e}).content)
        } else if (p.type == "block") {
            p = control(p)
        } else if (p.type == "call") {
            p.arguments = p.arguments.map(e => control({content: e}).content)
        } else if (p.type == "declare") { // This could mess things up!
            if (p.content.content) {
                p.content.content = p.content.content.map(e => control({content: e}).content)
            }
        } else if (p.type == "ctrl") {
            p.arguments = p.arguments.map(e => control({content: e}).content)
            p.name = p.content
            if (modified[c].type == "block") {
                p.content = modified[c].content
            } else {
                p.content = [ modified[c] ]
            }
            modified.splice(c, 1)
        } else if (p.type == "function") {
            let type = modified[c].type
            if (type == "block") {
                control(modified[c])
                //modified[c].content = modified[c].content.map(e => control({content: e}).content)
                //console.log(modified[c].content)
                p.content.content = modified[c].content
                modified.splice(c, 1)
            } else if (type == "call") {
                p.content.content = [ modified[c] ]
                modified.splice(c, 1)
            } else {
                error(`Unknown branch type \`${type}\``)
            }
        } else if (formattedVarTypes.includes(p.type)) {
            p.type = "nam"
        }
    }
    return ast
}

function addSemicolon(s) {
    return (s[s.length - 1] == "}" ? s : s + ';')
}

function generate(node, parentType="") {
    let code = ""

    if (Array.isArray(node)) {
        return node.map(generate).join(" ")
    }

    switch (node.type) {
        case "Program":
            return node.content.map(e => generate(e, "Program")).map(addSemicolon)
                .join("\n")
        case "block":
            return "{\n" + node.content.map(generate).map(addSemicolon).join("\n") + "\n}"
        case "call":
            if (node.content == stats["print"] && node.arguments.length > 1) {
                let ret = node.arguments.map(e => `${stats["print"]}(${generate(e)})`)
                return ret.join(`; ${stats["print"]}(\" \"); `)
            }
            return node.content + "("
                + node.arguments.map(generate).join(", ")
                + ")"
        case "function": // Not implemented!
            let args = node.content.arguments.map(generate).join(", ")
            let code = node.content.content.map(generate).map(addSemicolon)
            let type = node.content.type.replace("Type", '')
            if (type != "def")
                code[code.length - 1] = `return ${code[code.length - 1]}`
            functions += `${lTypesToCTypes[type]} ${node.content.name}(${args}) {\n`
                + code.join('\n')
                + "\n}\n"
            return `// function \`${node.content.name}\``
        case "ctrl":
            if (node.name == "for") {
                let args = node.arguments.map(generate)
                if (args.length == 1) {
                    error(`Expected at least two arguments for \`for\``)
                } else {
                    let nam = node.arguments[0][0]
                    if (nam.type == "nam") nam = nam.content
                    if (nam.type == "modify") nam = nam.content.name
                    if (nam.type == "declare") nam = nam.content.name
                    if (args.length == 2) {
                        args = [
                            args[0],
                            args[1],
                            nam + "++"
                        ]
                    } else if (args.length == 3) {
                        args = [
                            args[0],
                            args[1],
                            nam + " += " + args[2]
                        ]
                    }
                }
                return node.name + " ("
                    + args.join("; ") + ") {\n"
                    + node.content.map(generate).map(addSemicolon).join("\n")
                    + "\n}"
            } else if (node.arguments.length != 1) {
                error(`Didn't expect ${node.arguments.length} arguments for \`${node.name}\``)
            }
            console.log(node)
            if (node.content == undefined) {
                error("For some reason the if statement didn't get a block? Idk.")
            }
            return node.name + " ("
                + node.arguments.map(generate).join(", ") + ") {\n"
                + node.content.map(generate).map(addSemicolon).join("\n")
                + "\n}"
        case "num":
            return node.content
        case "str":
            return 'string("' + node.content + '")'
        case "opr":
            if (node.name == '.') {
                //return `${generate(node.arguments[0])}.${operationFunctions[generate(node.arguments[1])]}()`
                return operationFunctions[generate(node.arguments[1])].replace("%", generate(node.arguments[0]))
            } else {
                if (operationFunctions[node.name] == undefined) error(`Unknown operation \`${JSON.stringify(node)}\``)
                return `_${operationFunctions[node.name]}(${generate(node.arguments[0])}, ${generate(node.arguments[1])})`
            }
        case "arr": // Needs code here!
            let inferredType = node.content[0][0].type
            if (inferredType == "str" && lastVariableType != "str") {
                error(`Can't assign variable type \`str\` to type \`${lastVariableType}\``)
            } else if (inferredType == "num" && lastVariableType == "str") {
                error(`Can't assign variable type \`num\` to type \`str\``)
            }
            let castType = ""
            if (lastVariableType == "int") {
                castType = "(int)"
            }
            return `vector<${lTypesToCTypes[lastVariableType]}>{` + node.content.map(e => castType + generate(e)).join(", ") + "} "
        case "paren":
            return `(${node.content.map(generate).join(" ")})`
        case "nam":
            return node.content
        case "declare":
            lastVariableType = node.content.type.replace('Type','')
            let varType = lTypesToCTypes[lastVariableType]
            if (node.array) {
                varType = `vector<${varType}>`
            }
            let ret
            if (node.content.content == undefined) {
                ret = `${varType} ${node.content.name}`
            } else {
                ret = `${varType} ${node.content.name} = ${generate(node.content.content)}`
            }
            if (parentType == "Program") {
                variableCode += ret + ';\n'
                return `// variable \`${node.content.name}\``
            } else {
                return ret
            }
        case "modify":
            return `${node.content.name} ${node.content.type} ${generate(node.content.content)}`
        default:
            error(`Node not recognized: \`${node.type}\``)
    }
    return code
}

function indent(code, i) {
    code = code.split("\n")
    for (let a = 0; a < code.length; a++) {
        if (")]}".includes(code[a][code[a].length - 1])) i--
        code[a] = "    ".repeat(i) + code[a]
        if ("([{".includes(code[a][code[a].length - 1])) i++
    }
    return code.join("\n")
}
