
const readline = require("readline")
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// })

// rl.question("")
// rl.question("", function(text) {
	
// 	process.exit()
// })

function encode(text, method) {
	let res = ""
	switch (method) {
		case "base64":
			res = Buffer.from(text).toString('base64')
			break
		case "hex":
			for (let i = 0; i < text.length; i++) {
				res += text.charCodeAt(i).toString(16) + " "
			}
			break
		case "morse":
			let morseEncode = {
				"A": "•-", "B": "-•••", "C": "-•-•", "D": "-••", "E": "•", "F": "••-•", "G": "--•", "H": "••••", "I": "••", "J": "•---", "K": "-•-", "L": "•-••", "M": "--", "N": "-•", "O": "---", "P": "•--•", "Q": "--•-", "R": "•-•", "S": "•••", "T": "-", "U": "••-", "V": "•••-", "W": "•--", "X": "-••-", "Y": "-•--", "Z": "--••",
				"a": "._", "b": "_...", "c": "_._.", "d": "_..", "e": ".", "f": ".._.", "g": "__.", "h": "....", "i": "..", "j": ".___", "k": "_._", "l": "._..", "m": "__", "n": "_.", "o": "___", "p": ".__.", "q": "__._", "r": "._.", "s": "...", "t": "_", "u": ".._", "v": "..._", "w": ".__", "x": "_.._", "y": "_.__", "z": "__..",
				"0": "_____", "1": ".____", "2": "..___", "3": "...__", "4": "...._", "5": ".....", "6": "_....", "7": "__...", "8": "___..", "9": "____.", " ": " ", "(": "_.__.", ")": "_.__._", "&": "._...", "$": "..._.._",
				".": "._._._", ",": "__..__", "?": "..__..", "'": ".____.", "!": "_._.__", "/": "_.._.", ":": "___...", ";": "_._._.", "=": "_..._", "+": "._._.", "-": "_...._", "_": "..__._", "\"": "._.._.", "@": ".__._."
			}
			for (let i = 0; i < text.length; i++) {
				if (!(text[i] in morseEncode)) console.log(text[i])
				res += morseEncode[text[i]] + " "
			}
			break
	}
	return res.trim()
}

let text = "Hello, world!"
console.log(encode(text, "base64"))
console.log(encode(text, "hex"))
console.log(encode(text, "morse"))
