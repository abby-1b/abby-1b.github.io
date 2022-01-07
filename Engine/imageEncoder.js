
// This works wonders on 1-bit images (like bitmap fonts), which apparently
// PNG doesn't compress very well, so I'll be using this to hard-code the font
// into `lib.js` for now.

const fs  = require('fs')
try {
    var PNG = require('pngjs').PNG
} catch (e) {
    console.log("Please install pngjs: npm install pngjs --save")
}

fs.createReadStream(process.argv[process.argv.length - 1]).pipe(new PNG()).on('parsed', function() {
    let colors = []
    for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
            let idx = (this.width * y + x) << 2
            let c = `${this.data[idx]},${this.data[idx + 1]},${this.data[idx + 2]},${this.data[idx + 3]}`
            if (!colors.includes(c)) colors.push(c)
        }
    }
    let bpp = (colors.length - 1).toString(2).length
    const toBin = (n) => {
        let r = n.toString(2)
        return "0".repeat(bpp - r.length) + r
    }
    let bs = ""
    // console.log(colors)
    colors = Object.assign({}, ...colors.map((x) => ({[x]: colors.indexOf(x)})))
    for (let x = 0; x < this.width; x++) {
		if (x % 5 == 4) continue
        for (let y = 0; y < this.height; y++) {
            let idx = (this.width * y + x) << 2
            let c = `${this.data[idx]},${this.data[idx + 1]},${this.data[idx + 2]},${this.data[idx + 3]}`
            bs += toBin(colors[c])
        }
    }
    bs = bs.match(/.{1,6}/g)
    while (bs[bs.length - 1].length < 6) bs[bs.length - 1] += "0"
	// console.log(bs)
	console.log("W/H:   ", this.width, this.height)
    bs = bs.map(e => String.fromCharCode(parseInt(e, 2) + 32)).join("")
	// let min = minifyOutput(bs)
	// if (min.length < bs.length)
	// 	bs = min
	// else
		// bs = "`" + bs + "`"
	bs = `\`${this.width.toString(16)}|${this.height.toString(16)}|${bs}\``
	// bs = minifyOutput(bs)
	bs = bs.replace(/\\/g, "\\\\")
    console.log(bs.length, bs)
})

function minifyOutput(txt) {
	let li = 99
	let replaceString = []
	let minSizeTotal = (new TextEncoder().encode(txt + replaceString.join(""))).length
	let lastStr = txt
	for (let rml = 0; true; rml++) {
		let tma = 0 // The max appearences
		let tms = "" // The string referenced above
		for (let len = 2; len < 32; len++) {
			let ss = {}
			for (let a = 0; a < txt.length - len; a++) {
				let sstr = txt.substr(a, len)
				if (sstr in ss) {
					ss[sstr]++
				} else {
					ss[sstr] = 1
				}
			}
			let maxAppearences = Math.max(...Object.values(ss))
			let ky = getKeyByValue(ss, maxAppearences)
			maxAppearences = ((len - 1) * maxAppearences) - (13 + len)
			if (maxAppearences > tma) {
				tms = ky
				tma = maxAppearences
			}
		}
		if (tms == "") break
		while (txt.includes(String.fromCharCode(li)) || replaceString.join("").includes(String.fromCharCode(li)) || "\\\r\n".includes(String.fromCharCode(li))) li++
		lastStr = txt + ""
		txt = txt.replace(new RegExp(tms.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), String.fromCharCode(li))
		tms = tms
			.replace(/\n/g, "\\n")
			.replace(/\r/g, "\\r")
			.replace(/\"/g, "\\\"")
		// .replace(/\n/g, "\\n").replace(/\r/g, "\\r")
		replaceString.push(String.fromCharCode(li) + 'a' + tms)
		let newSize = (new TextEncoder().encode(txt + replaceString.join(""))).length
		console.log("Removing:", newSize)
		if (newSize - 40 >= minSizeTotal) {
			txt = lastStr
			break
		}
		minSizeTotal = newSize
	}
	txt = txt.replace(/\`/g, "\\`").replace(/\${/g, "\\${")
	replaceString = replaceString.reverse().join("a")
	txt = "$=`" + txt + "`;`" + replaceString + "`.split`a`.map((e,i,a)=>{i%2==0&&($=$.split(e).join(a[i+1]))})"
	return txt
}

function getKeyByValue(object, value) { return Object.keys(object).find(key => object[key] === value) }
