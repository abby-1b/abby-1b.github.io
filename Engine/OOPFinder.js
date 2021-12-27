
const { parse } = require('abstract-syntax-tree')

let OOP = [
	"===",
	"*",
	"^",
	"-",
	"!=",
	"==",
	">>",
	"**",
	"in",
	">=",
	">",
	"<=",
	"<",
	"||",
	"<<",
	"+",
	"&",
	"&&",
	"%",
	"/",
	">>>",
	"!==",
	"instanceof",
]

function sort(i) {
	let hi = parse("a" + OOP[i] + "b" + OOP[i + 1] + "c").body[0].expression.operator
	if (OOP[i] == hi) {
		// Swap them
		tmp = OOP[i] + ''
		OOP[i] = OOP[i + 1] + ''
		OOP[i + 1] = tmp + ''
		return true
	}
	return false
}

let it = 0
while (true) {
	it++
	let did = false
	for (let a = 0; a < OOP.length - 1; a++) did = did || sort(a)
	if (!did) break
}

console.log(it)
console.log('"' + OOP.reverse().join('", "') + '"')
