
let encodeSteps = 2
let DEED = false // Do encode else decode

const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question("Encode / Decode ? ", function(ed) {
	DEED = ed.toLowerCase() == 'e'
	setTimeout(askText, 0)
})

function askText() {
	rl.question(" > ", function(text) {
		if (DEED) {
			console.log(encode(text))
		} else {
			console.log(decode(text))
		}
		setTimeout(askText, 0)
	})
}

function encode(text) {
	let methods = ["base64", "hex", "morse"]
	if (text.length > 20) methods[methods.length - 1] = "base64"
	for (let s = 0; s < encodeSteps; s++) {
		let mi = Math.floor(Math.random() * methods.length)
		text = encodeStep(text, methods[mi])
		methods.splice(mi, 1)
		if (methods.length == 0) break
	}
	return text
}

function decode(text, dev) {
	let iters = 0
	while (true) {
		iters++
		// if (iters > encodeSteps + 1) {
		// 	console.log("Failed.")
		// 	return -1
		// }
		// console.log(text)
		text = text.trim()
		if (text.indexOf(" ") == -1) {
			if (dev) console.log("Base64!")
			text = Buffer.from(text, 'base64').toString()
		} else if (text.replace(/[_.\/ \-']/g, "").length == 0) {
			if (dev) console.log("Morse!")
			let morseDecode = {"_____":"0",".____":"1","..___":"2","...__":"3","...._":"4",".....":"5","_....":"6","__...":"7","___..":"8","____.":"9","'-":"A","-'''":"B","-'-'":"C","-''":"D","'":"E","''-'":"F","--'":"G","''''":"H","''":"I","'---":"J","-'-":"K","'-''":"L","--":"M","-'":"N","---":"O","'--'":"P","--'-":"Q","'-'":"R","'''":"S","-":"T","''-":"U","'''-":"V","'--":"W","-''-":"X","-'--":"Y","--''":"Z","._":"a","_...":"b","_._.":"c","_..":"d",".":"e",".._.":"f","__.":"g","....":"h","..":"i",".___":"j","_._":"k","._..":"l","__":"m","_.":"n","___":"o",".__.":"p","__._":"q","._.":"r","...":"s","_":"t",".._":"u","..._":"v",".__":"w","_.._":"x","_.__":"y","__..":"z","/":" ","_.__.":"(","_.__._":")","._...":"&","..._.._":"$","._._._":".","__..__":",","..__..":"?",".____.":"'","_._.__":"!","_.._.":"/","___...":":","_._._.":";","_..._":"=","._._.":"+","_...._":"-","..__._":"_","._.._.":"\"",".__._.":"@"}
			text = text.split(" ")
				.map(e => morseDecode[e])
				.join("")
		} else if (text.replace(/[01 ]/g, "").length == 0) {
			if (dev) console.log("Binary!")
			text = text.split(" ").map(e => String.fromCharCode(parseInt(e, "2"))).join("")
		} else if (text.split(" ").every(e => e.length == 2)) {
			if (dev) console.log("Hex!")
			text = text.split(" ").map(e => String.fromCharCode(parseInt(e, "16"))).join("")
		} else {
			if (dev) console.log("Done!")
			break
		}
	}
	return text
}

function encodeStep(text, method) {
	let res = ""
	switch (method) {
		case "base64":
			res = Buffer.from(text).toString('base64')
			break
		case "hex":
			for (let i = 0; i < text.length; i++) {
				res += text.charCodeAt(i).toString(16).toUpperCase() + " "
			}
			break
		case "morse":
			let morseEncode = {
				"A": "'-", "B": "-'''", "C": "-'-'", "D": "-''", "E": "'", "F": "''-'", "G": "--'", "H": "''''", "I": "''", "J": "'---", "K": "-'-", "L": "'-''", "M": "--", "N": "-'", "O": "---", "P": "'--'", "Q": "--'-", "R": "'-'", "S": "'''", "T": "-", "U": "''-", "V": "'''-", "W": "'--", "X": "-''-", "Y": "-'--", "Z": "--''",
				"a": "._", "b": "_...", "c": "_._.", "d": "_..", "e": ".", "f": ".._.", "g": "__.", "h": "....", "i": "..", "j": ".___", "k": "_._", "l": "._..", "m": "__", "n": "_.", "o": "___", "p": ".__.", "q": "__._", "r": "._.", "s": "...", "t": "_", "u": ".._", "v": "..._", "w": ".__", "x": "_.._", "y": "_.__", "z": "__..",
				"0": "_____", "1": ".____", "2": "..___", "3": "...__", "4": "...._", "5": ".....", "6": "_....", "7": "__...", "8": "___..", "9": "____.", " ": "/", "(": "_.__.", ")": "_.__._", "&": "._...", "$": "..._.._",
				".": "._._._", ",": "__..__", "?": "..__..", "'": ".____.", "!": "_._.__", "/": "_.._.", ":": "___...", ";": "_._._.", "=": "_..._", "+": "._._.", "-": "_...._", "_": "..__._", "\"": "._.._.", "@": ".__._."
			}
			for (let i = 0; i < text.length; i++) {
				if (!(text[i] in morseEncode)) console.log(text[i])
				res += morseEncode[text[i]] + " "
			}
			break
		case "bin":
			for (let i = 0; i < text.length; i++) {
				let lett = text.charCodeAt(i).toString(2)
				while (lett.length < 8) lett = "0" + lett
				res += lett + " "
			}
	}
	return res.trim()
}
