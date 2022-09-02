
const specialChars = "@^_`{|}~;<=>*+#$%&[\\]:0123456789"
const usedChars = " etoanih@srludymwgcfI,kbpvWTY.!SAH()MNBDC\"O?jL'G/-xEJPRFzKqUVQZX"

function compress(inp: string) {
	inp = inp.trim()
	let simple = ""
	for (let i = 0; i < inp.length; i++) simple += specialChars.includes(inp[i]) ? ("@" + usedChars[specialChars.indexOf(inp[i])]) : inp[i]
	let nums = simple.split("").map(c => usedChars.indexOf(c))
	while (nums.length % 7 != 0) nums.push(0)
	const txt = nums.map(c => (c | 0b1000000).toString(2).slice(1)).join("")
	while (nums.length > 0) nums.pop()
	for (let i = 0; i < txt.length; i += 7) nums.push(parseInt(txt.slice(i, i + 7), 2))
	while (nums[nums.length - 1] == 0) nums.pop()
	return nums.map(n => String.fromCharCode(32 + n)).join("")
}

function decompress(inp: string) {
	const spl = inp.split("")
	while (spl.length % 6 != 0) spl.push(" ")
	const bin = spl.map(c => ((c.charCodeAt(0) - 32) | 0b10000000).toString(2).slice(1)).join("")
	let out = ""
	for (let i = 0; i < bin.length; i += 6) out += usedChars[parseInt(bin.slice(i, i + 6), 2)]
	let fullOut = ""
	for (let i = 0; i < out.length; i++) fullOut += out[i] == "@" ? specialChars[usedChars.indexOf(out[++i])] : out[i]
	while (fullOut[fullOut.length - 1] == ' ') fullOut = fullOut.slice(0, -1)
	return fullOut
}

const str = "Chemistry"
const comp = compress(str)
const decomp = decompress(comp)
console.log(`${str.length} > ${comp.length}`)
