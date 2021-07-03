//"use strict";

// /opt/homebrew/Cellar/glfw/3.3.4

let varTypes = ["int", "str", "flt", "dbl", "def"]
let formattedVarTypes = varTypes.map(e => e + "Type")

let keyWords = ["return", "break", "continue"]

let fullTokenNames = {
    "num": "number",
    "opr": "operation",
    "str": "string",
    "declare": "variable declaration",
    "intType": "integer",
    "strType": "string",
    "fltType": "float",
    "dblType": "double",
    "def": "function"
}

let lTypesToCTypes = {
    "int": "int",
    "str": "string",
    "flt": "float",
    "dbl": "double",
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
    "=>": "meq"
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
#include <unistd.h>
#include "./headers/utils.h"
using namespace std;

string print(string i       ) { cout << i; return i; }
float  print(float i        ) { cout << i; return i; }
template <class T>
string print(vector<T> i    ) { string r = Array::toString(i); cout << r; return r; }

string input(string i) { cout << i; string _retstr; getline(cin, _retstr); return _retstr; }

float  _sum(float a , float b ) { return a + b; }
string _sum(string a, float b ) { return to_string(b) + a; }
string _sum(float a , string b) { return to_string(a) + b; }
string _sum(string a, string b) { return a + b; }

float  _sub(float a , float b ) { return a - b; }
// string _sub(string a, float b ) { return a + to_string(b); }
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

void sleep(int milliseconds) { cout << flush; usleep(milliseconds * 1000); }

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
    printUsage()
}

const fs = require("fs")
const util = require("util")
const { exec } = require("child_process")

fs.readFile(process.argv[2], "utf8", (err, data) => {
    if (data == undefined) {
        error(`File \`${process.argv[2]}\` not found.`)
    }
    save(compile(data), process.argv[2])
})

String.prototype.any = function(c) { return this.includes(c) }

function printUsage() {
    console.error("usage: compiler [file name]")
    process.exit(1)
}

function error(message) {
    console.error(`\x1b[31mERROR at ${arguments.callee.caller.name}: ${message}`)
    process.exit(1)
}

process.on('uncaughtException', (err) => {
    console.error(`\x1b[31mThere was an uncaught error!\n `, err)
    process.exit(1)
})

function warn(message) {
    console.log(`\x1b[33m${message}\x1b[0m`)
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
    let tokens   = tokenize(program)
    let ast      = parse   (tokens)
    modify        (ast)
    operations    (ast)
    variables     (ast)
    control       (ast)
    adjacentTokens(ast)
    pathGen       (ast)
    console.log("\n" + util.inspect(ast, false, null, true))
    getVarType(ast, ".content.0.arguments.0.0.arguments.0")
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
        } else if ("=+-*/<>".any(c)) {
            let fullNam = c
            c = program[++currentChar]
            while ("=+-*/<>".any(c)) {
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
    function walk(idx) {
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
        ast.content.push(walk(ast.content.length))
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
            if (modified[c - 2].type.includes("Type")) error(`\`${p.content}\` can't be used as a variable name`)
            if (["paren", "arr"].includes(modified[c].type)) {
                modified[c].content = modified[c].content.map(e => operations({content: e}).content)
            } else {
                modified[c] = operations(modified[c])
            }
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
            if (c >= declaredVars.length) error(`Expected something after \`${p.type.replace("Type","")}\``)
            if (declaredVars[c].type == "call") {
                p.content = {
                    type: p.type,
                    name: declaredVars[c].content,
                    arguments: declaredVars[c].arguments.map(e => variables({content: e}).content)
                }
                checkVarName(p.content.name, "function")
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
            checkVarName(p.content.name)
        } else if (p.type == "nam") {
            if (c >= declaredVars.length) continue
            if (declaredVars[c].type == "sep") error(`Misplaced separator, the comma doesn't do anything here`)
            if (declaredVars[c].type.includes("Type")) error(`No idea what this means. Try swapping \`${p.content}\` and \`${declaredVars[c].type.replace("Type","")}\``)
            if (declaredVars[c].type != "opr") error(`No idea what this means`) //error(`Expected \`operand\`, got \`${declaredVars[c].type}\``)
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
                p.content = control(modified[c]).content
            } else {
                p.content = [ modified[c] ]
            }
            modified.splice(c, 1)
        } else if (p.type == "function") {
            let type = modified[c].type
            if (type == "block") {
                control(modified[c])
                p.content.content = modified[c].content
                modified.splice(c, 1)
            } else if (type == "call") {
                p.content.content = [ modified[c] ]
                modified.splice(c, 1)
            } else {
                // Missing `opr` type
                error(`Unknown branch type \`${type}\``)
            }
        } else if (formattedVarTypes.includes(p.type)) {
            p.type = "nam"
        }
    }
    return ast
}

function adjacentTokens(ast) {
    let check = ast.content
    let c = 0;
    while (c < check.length) {
        let p = check[c++]
        if (["paren", "arr"].includes(p.type)) {
            if (p.type == "paren" && p.content.length > 1) error(`Misplaced separator, the comma doesn't do anything here`)
            p.content.map(e => adjacentTokens({content: e}).content)
        } else if (p.type == "block") {
            adjacentTokens(p)
        } else if (p.type == "call") {
            p.arguments.map(e => adjacentTokens({content: e}).content)
        } else if (p.type == "declare") {
            if (p.content.content)
                adjacentTokens({content: p.content.content})
        } else if (p.type == "modify") {
            adjacentTokens({content: p.content.content})
        } else if (p.type == "ctrl") {
            p.arguments.map(e => adjacentTokens({type: "paren", content: e}).content)
            adjacentTokens(p)
        } else if (p.type == "opr") {
            adjacentTokens({type: "opr", content: p.arguments})
        } else if (p.type == "function") {
            adjacentTokens({type: "function", content: p.content.content})
        }
        
        if (c <= check.length - 1) {
            let goodTypes = [
                "declare",
                "call",
                "modify",
                "ctrl"
            ]
            let doErr = false
            if (["opr", "function", "block", "Program"].includes(ast.type)) {
                continue
            } else {
                if (!goodTypes.includes(p.type)) doErr = true
                if (!goodTypes.includes(check[c].type)) doErr = true
            }
            if (!doErr) {
                if (goodTypes.includes(p.type)) continue
                if (goodTypes.includes(check[c].type)) continue
                if (p.type == check[c].type) error(`Two ${fullTokenNames[p.type]}s can't be next to each other here.`)
            }
            error(`Found \`${fullTokenNames[p.type]}\` next to \`${fullTokenNames[check[c].type]}\`. Try moving one of them somewhere else.`)
        }
    }
    return ast
}

function pathGen(ast, path="") {
    for (let b in ast) {
        if (typeof ast[b] != "string") {
            if (!Array.isArray(ast[b])) ast[b].path = path + "." + b
            pathGen(ast[b], path + "." + b)
        }
    }
    return ast
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
                
                return generate(node.arguments[1])
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
            if (keyWords.includes(node.content)) {
                //warn(`\`${node.content}\` was left as \`nam\` type.`)
            }
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
        case "sep":
            error(`Why is this comma here?`)
        default:
            error(`Node not recognized: \`${node.type}\``)
    }
    return code
}

function checkVarName(n, t="variable") {
    if ([...varTypes, ...controlFlow, ...Object.keys(stats), ...keyWords].includes(n)) {
        error(`\`${n}\` can't be used as a ${t} name`)
    }
}

function addSemicolon(s) {
    return (s[s.length - 1] == "}" ? s : s + ';')
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

function getPath(ast, path) {
    path = path.split(".")
    path = path.slice(1)
    path = path.map(e => `["${e}"]`).join("")
    return eval("ast" + path, ast)
}

function getVar(ast, path, nam) {
    path = path.split(".")
    let last = path.pop()
    let isNum = !isNaN(parseFloat(last))
    last = isNum ? parseInt(last) : last
    while (path.length > 0) {
        if (last < 0 || !isNum) {
            last = path.pop()
            isNum = !isNaN(parseFloat(last))
        } else {
            let node = getPath(ast, path.join(".") + "." + last)
            if (node.type == "declare") {
                return node
            }
            last--
        }
    }
    return undefined
}

function getVarType(ast, path) {
    let node = getVar(ast, path, getPath(ast, path).content)
    if (node == undefined) return undefined
    return node.type
}
