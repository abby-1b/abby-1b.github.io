//"use strict";

let opTypes = "=+-*/<>"

let varTypes = ["int", "str", "flt", "dbl", "arr", "fn", "var"]
let formattedVarTypes = varTypes.map(e => e + "Type")

let lTypesToCTypes = {
    "int": "int",
    "str": "std::string",
    "flt": "float",
    "dbl": "double",
    "arr": "???",
    "fn":  "???",
    "var": "???"
}

let stats = {
    "print": "_"
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

let genCodeStart = `
#include <iostream>
#include <string>

std::string _(std::string i) { std::cout << i; return i; }
float       _(float i)       { std::cout << i; return i; }

float       _sum(float a      , float b      ) { return a + b; }
std::string _sum(std::string a, float b      ) { return a + std::to_string(b); }
std::string _sum(float a      , std::string b) { return std::to_string(a) + b; }
std::string _sum(std::string a, std::string b) { return a + b; }

float       _mul(float a      , float b      ) { return a * b; }
std::string _mul(std::string a, int b        ) { std::string r = ""; for (int c = 0; c < b; c++) { r += a; } return r; }

int         _eql(float a      , float b      ) { return a == b; }
int         _eql(std::string a, std::string b) { return a == b; }
int         _lss(float a      , float b      ) { return a < b; }
int         _lss(std::string a, std::string b) { return a.length() < b.length(); }
int         _mrr(float a      , float b      ) { return a > b; }
int         _mrr(std::string a, std::string b) { return a.length() > b.length(); }

int main() {
`

let genCodeEnd = `
    std::cout << '\\n';
    return 0;
}
`

let controlFlow = ["if", "while", "for", "scan"]

if (process.argv.length == 2) {
    console.error("usage: compiler [file name]")
    process.exit()
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
    process.exit()
}

function save(code, name) {
    fs.writeFile(name + ".cpp", code, "utf8", _=>{
        exec(`g++ ${name}.cpp ${process.argv.splice(3).join(" ")}`, (err) => {
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
                   control   (ast)
    console.log(util.inspect(ast, false, null, true))
    let code     = generate(ast)
            code = indent(code, 1)
    code = genCodeStart + code + genCodeEnd
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
            if (fullNum == ".") fullNum = "0"
            tokens.push({
                type: "num",
                content: fullNum
            })
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
            while ("qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_".any(c)) {
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
        if (p.type == "paren") {
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
        if (p.type == "paren") {
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
        if (p.type == "paren") {
            p.content = p.content.map(e => variables({content: e}).content)
        } else if (p.type == "block") {
            p = variables(p)
        } else if (p.type == "call") {
            p.arguments = p.arguments.map(e => variables({content: e}).content)
        } else if (p.type == "ctrl") {
            p.arguments = p.arguments.map(e => variables({content: e}).content)
        } else if (formattedVarTypes.includes(p.type)) {
            // Declaration
            if (c >= declaredVars.length) error(`Expected variable name after \`${p.content}\``)
            if (c > declaredVars.length - 2 || declaredVars[c + 1].content != '=') {
                p.content = {
                    type: p.type,
                    name: declaredVars[c].content,
                    content: [ defaultContent[p.type.replace("Type",'')] ]
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
        if (p.type == "paren") {
            p.content = p.content.map(e => operations({content: e}).content)
        } else if (p.type == "block") {
            p = operations(p)
        } else if (p.type == "call") {
            p.arguments = p.arguments.map(e => operations({content: e}).content)
        } else if (p.type == "ctrl") {
            p.arguments = p.arguments.map(e => operations({content: e}).content)
            p.name = p.content
            if (modified[c].type == "block") {
                p.content = modified[c].content
            } else {
                p.content = [ modified[c] ]
            }
            modified.splice(c, 1)
        }
    }
    return ast
}

function generate(node) {
    let code = ""

    if (Array.isArray(node)) {
        return node.map(generate).join(" ")
    }

    switch (node.type) {
        case "Program":
            return node.content.map(generate).map(e => (e[e.length - 1] == "}" ? e : e + ';'))
                .join("\n")
        case "block":
            return "{\n" + node.content.map(generate).map(e => e + ';').join("\n") + "\n}"
        case "call":
            if (node.content == stats["print"] && node.arguments.length > 1) {
                let ret = node.arguments.map(e => `${stats["print"]}(${generate(e)})`)
                return ret.join("; _(\" \"); ")
            }
            return node.content + "("
                + node.arguments.map(generate).join(", ")
                + ")"
        case "ctrl":
            console.log(node.content)
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
                            nam + " < " + args[1],
                            nam + "++"
                        ]
                    } else if (args.length == 3) {
                        args = [
                            args[0],
                            nam + " < " + args[1],
                            nam + " += " + args[2]
                        ]
                    }
                }
                return node.name + " ("
                    + args.join("; ") + ") {\n"
                    + node.content.map(generate).map(e => e + ';').join("\n")
                    + "\n}"
            } else if (node.arguments.length != 1) {
                error(`Didn't expect ${node.arguments.length} arguments for \`${node.name}\``)
            }
            return node.name + " ("
                + node.arguments.map(generate).join(", ") + ") {\n"
                + node.content.map(generate).map(e => e + ';').join("\n")
                + "\n}"
        case "num":
            return node.content
        case "str":
            return 'std::string("' + node.content + '")'
        case "opr":
            //return `(${generate(node.arguments[0])} ${node.name} ${generate(node.arguments[1])})`
            if (operationFunctions[node.name] == undefined) error(`Unknown operation \`${JSON.stringify(node)}\``)
            return `_${operationFunctions[node.name]}(${generate(node.arguments[0])}, ${generate(node.arguments[1])})`
        case "arr": // Needs code here!
            break
        case "paren":
            return `(${node.content.map(generate).join(" ")})`
        case "nam":
            return node.content
        case "declare":
            return `${lTypesToCTypes[node.content.type.replace('Type','')]} ${node.content.name} = ${generate(node.content.content)}`
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
