
/*
How hard can it be to make a javascript compressor?
That's what I originally thought when I made `minidy.js`.
I've grown since then (not really) so I've decided to embark
on making this new and improved version that uses some random
Node library to convert any JavaScript code to an AST. With
this I should be able to convert back to JavaScript code, but
this time slightly more compressed and hopefully without comments.
*/

// OPTIM: An optimization can be made.
// POT: Potential bug.

// Optimizations:
// ["single thing"].includes(x)   >   x == "single thing"

let precomputeValues = false

// npm install abstract-syntax-tree
const { parse } = require('abstract-syntax-tree')
const { readFileSync, writeFileSync } = require("fs")
const source = readFileSync("lib.js", "utf8")
// const source = `[0].includes(x)`
const tree = parse(source)

const needSemi = ["ExpressionStatement", "VariableDeclaration"]

const OOP = [ "||", "&&", "^", "&", "!==", "<=", ">=", "==", "!=", "===", "<", ">", ">>>", "<<", ">>", "+", "-", "/", "%", "*", "**", "instanceof", "in" ]

const OPTYPES = ["LogicalExpression", "AssignmentExpression", "BinaryExpression"]

function iterateLines(l) {
	let ret = ""
	if (l.length == 0) return ""
	ret += toText(l[0], false, false, false, true)
	for (let n = 1; n < l.length; n++) {
		if (needSemi.includes(l[n - 1].type)) ret += ';'
		ret += toText(l[n], false, false, false, true)
	}
	return ret
}

var missed = 0

function toText(tree, noArrowFuncShorten, malformedArrowFunc, aInParen, lineAlone) {
	// console.log(tree)
	let ret = ""
	switch (tree.type) {
		case "Program": {
			ret += iterateLines(tree.body)
		} break

		// Control flow
		case "ReturnStatement": {
			if (!tree.argument) ret += "return"
			else {
				let rt = toText(tree.argument)
				ret += "return" + (["(", "{", "["].includes(rt[0]) ? "" : " ") + rt
			}
		} break
		case "ContinueStatement": {
			ret += "continue"
		} break
		case "BreakStatement": {
			// POT: labels not implemented
			ret += "break"
		} break

		case "IfStatement": {
			let rt = toText(tree.consequent)
			ret += "if(" + toText(tree.test, false, false, true) + ")" + rt
			if (rt[rt.length - 1] != "}") ret += ';'
			if (tree.alternate) {
				rt = toText(tree.alternate)
				if (["(", "{", "["].includes(rt[0])) ret += "else"
				else ret += "else "
				ret += rt
				if (rt[rt.length - 1] != "}") ret += ';'
			}
		} break

		case "ForStatement": {
			let rt = toText(tree.body)
			ret += "for(" + toText(tree.init, false, false, true) + ";" + toText(tree.test, false, false, true) + ";" + toText(tree.update, false, false, true) + ")" + rt
			if (rt[rt.length - 1] != "}") ret += ';'
		} break
		case "ForInStatement": {
			let rt = toText(tree.body)
			ret += "for(" + toText(tree.left) + " in " + toText(tree.right) + ")" + rt
			if (rt[rt.length - 1] != "}") ret += ';'
		} break

		case "WhileStatement": {
			let rt = toText(tree.body)
			ret += "while(" + toText(tree.test, false, false, true) + ")" + rt
			if (rt[rt.length - 1] != "}") ret += ';'
		} break

		case "TryStatement": {
			ret += "try" + toText(tree.block)
			if (tree.handler) ret += toText(tree.handler)
			if (tree.finalizer) ret += toText(tree.finalizer)
		} break
		case "CatchClause": {
			ret += "catch(" + toText(tree.param) + ")" + toText(tree.body)
		} break

		case "ThrowStatement": {
			ret += "throw " + toText(tree.argument)
		} break

		// Conditionals
		case "ConditionalExpression": {
			ret += "(" + toText(tree.test) + "?" + toText(tree.consequent, false, false, true) + ":" + toText(tree.alternate, false, false, true) + ")"
		} break
		case "ExpressionStatement": {
			ret += toText(tree.expression, noArrowFuncShorten, malformedArrowFunc, aInParen, lineAlone)
		} break
		case "BlockStatement": {
			ret += "{" + iterateLines(tree.body) + "}"
		} break

		// Classes
		case "ClassDeclaration": {
			ret += "class " + toText(tree.id) + (tree.superClass ? " extends " + toText(tree.superClass) : "") + toText(tree.body)
		} break
		case "ClassBody": {
			ret += "{" + tree.body.map(e => toText(e)).join("\n") + "}"
		} break
		case "MethodDefinition": {
			if (tree.computed) console.log("WHAT??? A COMPUTED METHOD????", tree)
			
			if (tree.static) ret += "static "
			ret += toText(tree.key)
			ret += toText(tree.value, true)
		} break

		// Functions
		case "FunctionDeclaration": {
			ret += (tree.async ? "async " : "")
				+ "function " + toText(tree.id) + "(" + tree.params.map(e => toText(e)) + ")"
				+ toText(tree.body)
		} break
		case "FunctionExpression":
		case "ArrowFunctionExpression": {
			if (malformedArrowFunc && !aInParen) ret += '('
			if (tree.params.length == 1 && !noArrowFuncShorten) ret += (tree.async ? "async " : "") + toText(tree.params[0])
			else ret += (tree.async ? "async(" : "(") + tree.params.map(e => toText(e)) + ")"
			ret += (noArrowFuncShorten ? "" : "=>") + toText(tree.body)
			if (malformedArrowFunc && !aInParen) ret += ')'
		} break

		// Literals
		case "Identifier": {
			ret += tree.name
		} break
		case "Literal": {
			if (typeof tree.value == "string")
				ret += '"' + tree.value.replace(/\n/g, "\\n").replace(/"/g, '\\"') + '"'
			else if (typeof tree.value == "number") {
				let exp = tree.value.toExponential().replace("+", "")
				if (exp.length < (tree.value + '').length) {
					ret += exp
				} else {
					ret += tree.value
				}
			} else if (typeof tree.value == "boolean")
				ret += (tree.value ? "!0" : "!1")
			else if (tree.value instanceof RegExp)
				ret += tree.value.toString()
			else
				console.log("ERROR: type not found.")
		} break
		case "ArrayExpression": {
			ret += "[" + tree.elements.map(e => toText(e, false, false, true)).join(",\n") + "]"
		} break
		case "RestElement":
		case "SpreadElement": {
			ret += "..." + toText(tree.argument)
		} break
		case "ObjectExpression": {
			ret += "{" + tree.properties.map(e => toText(e)) + "}"
		} break
		case "Property": {
			if (tree.computed || tree.method || tree.shorthand) console.log("PROPERTY WITH WEIRD BOOLS!", TREE)
			if (tree.kind != "init") console.log("WHAT??? PROPERTY NOT INIT", tree)
			ret += toText(tree.key) + ":" + toText(tree.value)
		} break
		case "Super": {
			ret += "super"
		} break
		case "ThisExpression": {
			ret += "this"
		} break

		// Template Strings
		case "TemplateLiteral": {
			ret += '`'
			let tTmp = ""
			let n = 0
			while (true) {
				tTmp += toText(tree.quasis[n])
				if (n == tree.expressions.length) break
				tTmp += "${" + toText(tree.expressions[n++]) + "}"
				if (n == tree.expressions.length) break
			}
			ret += tTmp.replace(/\`/g, "\\`")
			ret += '`'
		} break
		case "TemplateElement": {
			ret += tree.value.cooked
		} break

		// Operators
		case "AssignmentExpression":
		case "LogicalExpression":
		case "BinaryExpression": {
			let lIP = false
			let rIP = false
			let lIx = OOP.indexOf(tree.left.operator)
			let rIx = OOP.indexOf(tree.right.operator)
			let tIx = OOP.indexOf(tree.operator)
			if (OPTYPES.includes(tree.left.type) && !OPTYPES.includes(tree.right.type)) {
				if (lIx >= tIx) lIP = true
			} else if (OPTYPES.includes(tree.right.type) && !OPTYPES.includes(tree.left.type)) {
				if (rIx >= tIx) rIP = true
			} else if (OPTYPES.includes(tree.left.type) && OPTYPES.includes(tree.right.type)) {
				// console.log(tree)
				if (rIx >= tIx) rIP = true
				if (lIx >= tIx) lIP = true
			}
			if (["in", "instanceof"].includes(tree.operator)) tree.operator = " " + tree.operator + " "
			let tmp = toText(tree.left, false, true, lIP) + tree.operator + toText(tree.right, false, true, rIP)

			if ((!(tree.type == "AssignmentExpression" && lineAlone))
				&& OPTYPES.includes(tree.type)
				&& !aInParen) tmp = "(" + tmp + ")"

			if (precomputeValues) {
				if (tree.left.type == "Literal" && tree.right.type == "Literal") {
					let prec = toText({type: "Literal", value: eval(toText(tree.left, false, true) + tree.operator + toText(tree.right, false, true))})
					if (prec.length < tmp.length) {
						tmp = prec
						console.log(tree.left, tree.operator, tree.right, ret)
					}
				}
			}

			ret += tmp
		} break
		case "UnaryExpression": {
			if (["delete", "typeof"].includes(tree.operator)) {
				ret += tree.operator + " " + toText(tree.argument)
				break
			}
		}
		case "UpdateExpression": {
			if (tree.prefix) ret += tree.operator + toText(tree.argument)
			else ret += toText(tree.argument) + tree.operator
		} break

		// Calls
		case "CallExpression": {
			if (tree.callee.property
				&& tree.callee.property.name === "includes"
				&& tree.callee.object.type == "ArrayExpression"
				&& tree.callee.object.elements.length == 1) {
				ret += "(" + toText(tree.arguments[0]) + "===" + toText(tree.callee.object.elements[0]) + ")"
			} else {
				ret += toText(tree.callee, false, true) + "(" + tree.arguments.map(e => toText(e, false, false, true)) + ")"
			}
		} break
		case "MemberExpression": {
			if (tree.computed) ret += toText(tree.object) + "[" + toText(tree.property) + "]"
			else ret += toText(tree.object) + "." + toText(tree.property)
		} break

		// Variables
		case "VariableDeclaration": {
			ret += tree.kind + " " + tree.declarations.map(e => toText(e, false, false, true))
		} break
		case "VariableDeclarator": {
			ret += tree.id.name + (tree.init ? "=" + toText(tree.init, false, false, aInParen) : "")
		} break

		// New
		case "NewExpression": {
			ret += "new " + toText(tree.callee) + "(" + tree.arguments.map(e => toText(e)) + ")"
		} break

		// Nothing, return a dummy string
		default: {
			console.log(tree)
			missed++
			ret += "..."
		} break
	}
	return ret
}

console.log(tree.body[0].expression)
let finalCode = toText(tree)
if (missed > 0) {
	console.log("Missed:", missed)
} else {
	// console.log(finalCode)
	writeFileSync("lib.min.js", finalCode, "utf8")
	console.log("Length:", finalCode.length)
}

// 28314
// 28296
// 28288
