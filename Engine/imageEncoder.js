
// I would've continued this, but it's way less efficient compared to PNG compression.
// Maybe worth it in the future (to encode images in text format), but as of right now it's useless.

const fs  = require('fs')
try {
    var PNG = require('pngjs').PNG
} catch (e) {
    console.log("Please install pngjs using: npm install pngjs --save")
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
        for (let y = 0; y < this.height; y++) {
            let idx = (this.width * y + x) << 2
            let c = `${this.data[idx]},${this.data[idx + 1]},${this.data[idx + 2]},${this.data[idx + 3]}`
            bs += toBin(colors[c])
        }
    }
    bs = bs.match(/.{1,8}/g)
    while (bs[bs.length - 1].length < 8) bs[bs.length - 1] += "0"
    bs = Buffer.from(bs.map(e => String.fromCharCode(parseInt(e, 2))).join("")).toString("base64")
    console.log(bs)
})
