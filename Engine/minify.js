
// Removes whitespace
// 'none', 'readable', 'full'
const simpleOptimization = 'full'

// Uses `replace` to optimize repeated code
// 'none', 'fast', 'slow'
const repeatOptimization = 'none'

const fs = require('fs')

const html = `
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet"href="styles.css">
    </head>
    <body></body>
    <script defer>$0</script>
</html>
`
    .split("\n")
    .map(e => e.trim())
    .filter(e => e.length != 0)
    .join("")

// Reads two files, puts them together, and minifies them.
let data = fs.readFileSync("lib.js", "utf8")
    + "\n" + fs.readFileSync("m3.js")
let minified = minify(data)
console.log("Size:", (minified.length / data.length) * 100)
minified = html.replace(/\$0/, minified)
console.log("Final length:", (new TextEncoder().encode(minified)).length)
fs.writeFile("compressed.html", minified, "utf8", (e) => {})

function minify(d) {
    if (simpleOptimization == 'none') {
        console.log("No simple optimizations.")
    } else if (simpleOptimization == 'readable') {
        console.log("Readable simple optimizations...")
		d = d.replace(/\/\*(.|\n)*?\*\//g, "")
        d = d
            .split("\n")
            .map(e => e.replace(/\/\/.*/g, ""))
            .filter(e => e.trim().length != 0)
            .join("\n")
    } else if (simpleOptimization == 'full') {
        console.log("Full simple optimizations...")
        let cs = "+-*/{}()=:,<>;|&?[]!%"
        let nls = "*/{(=:,<>;|&?[!"
        let nle = "+-})]"
		d = d.replace(/\/\*(.|\n)*?\*\//g, "")
        d = d
            .split("\n")
            .map(e => e.replace(/\/\/.*/g, ""))
            .map(e => e.trim())
        for (let c = 0; c < cs.length; c++) {
            d = d.map(e => e.replace(new RegExp("\\" + cs[c] + "\\s+", 'g'), cs[c]))
            d = d.map(e => e.replace(new RegExp("\\s+\\" + cs[c], 'g'), cs[c]))
        }
        d = d
            .filter(e => e.length != 0)
            .join("\n")
            .replace(/0\./g, ".")
        for (let c = 0; c < nls.length; c++) {
            d = d.replace(new RegExp("\\" + nls[c] + "\n", 'g'), nls[c])
            d = d.replace(new RegExp("\n\\" + nls[c], 'g'), nls[c])
        }
        for (let c = 0; c < nle.length; c++)
            d = d.replace(new RegExp("\n\\" + nle[c], 'g'), nle[c])
		d = d.trim()
    }

    // Repeats
    // Lowest: 10043 > 9967 > 9664 > 9591 > 9328 > 9098 > 8203
    // 8035 8195 8106 7774 
    if (repeatOptimization == 'none') {
        console.log("No repeat optimizations.")
    } else if (repeatOptimization == 'fast') {
        console.log("Fast repeat optimizations...")
        let li = 1
        let replaceString = []
        let rs = [".addEventListener(", ".then("]
        let crs = ".=(["
        for (let ccr = 0; ccr < crs.length; ccr++) {
            let mi = getMatchIndexes(d, crs[ccr])
            let pm = []
            for (let a = 0; a < mi.length; a++) {
                pm.push(d.substr(mi[a] - 31, 32).match(/[_a-zA-Z0-9]*.$/)[0])
                pm.push(d.substr(mi[a] - 31, 31).match(/[_a-zA-Z0-9]*$/)[0])
            }
            pm = pm.filter(e => (e != crs[ccr] && e.length != 0) && !rs.includes(e))
            pm = uniq(pm.map(e => [e, pm.filter(g => g == e).length]))
            pm = pm.filter(e => (e[0].length - 1) * e[1] > 13 + e[0].length)
            for (let a = 0; a < pm.length; a++)
                rs.push(pm[a][0])
        }
        rs.push(...["return ", "let", "var", "return", "true", "false", "++", "--", "=0;", "==", "){", "&&", "||", "<<", ">>", "new ", "]=", ")=", "=[", "=(", "}else{", "({", "})", "}}", "))", "([", "])", "{(", ")}", "()=>{", "-1", "[]"])
        for (let r = 0; r < rs.length; r++) {
            let rgp = new RegExp(rs[r].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g")
            let matches = d.match(rgp)
            if (matches && matches.length * (rs[r].length - 1) > 13 + rs[r].length) {
                while (d.includes(String.fromCharCode(li)) || replaceString.join("").includes(String.fromCharCode(li)) || "\\\r\n".includes(String.fromCharCode(li))) li++
                d = d.replace(rgp, String.fromCharCode(li))
                replaceString.push(String.fromCharCode(li) + '�' + rs[r])
            }
        } // 10327 > 10298 > 10291
        d = d.replace(/\`/g, "\\`").replace(/\${/g, "\\${")
        replaceString = replaceString.reverse().join("�")
        d = "$=`" + d + "`;`" + replaceString + "`.split`�`.map((e,i,a)=>{i%2==0&&($=$.split(e).join(a[i+1]))})\neval($)"
    } else if (repeatOptimization == 'slow') {
        console.log("Slow repeat optimizations...")
        let li = 1
        let replaceString = []
        let minSizeTotal = (new TextEncoder().encode(d + replaceString.join(""))).length
        let lastStr = d
        for (let rml = 0; true; rml++) {
            let tma = 0 // The max appearences
            let tms = "" // The string referenced above
            for (let len = 2; len < 32; len++) {
                let ss = {}
                for (let a = 0; a < d.length - len; a++) {
                    let sstr = d.substr(a, len)
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
            while (d.includes(String.fromCharCode(li)) || replaceString.join("").includes(String.fromCharCode(li)) || "\\\r\n".includes(String.fromCharCode(li))) li++
            lastStr = d + ""
            d = d.replace(new RegExp(tms.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), String.fromCharCode(li))
            tms = tms
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/\"/g, "\\\"")
            // .replace(/\n/g, "\\n").replace(/\r/g, "\\r")
            replaceString.push(String.fromCharCode(li) + '�' + tms)
            let newSize = (new TextEncoder().encode(d + replaceString.join(""))).length
            console.log("Removing:", newSize)
            if (newSize - 40 >= minSizeTotal) {
                d = lastStr
                break
            }
            minSizeTotal = newSize
        }
        d = d.replace(/\`/g, "\\`").replace(/\${/g, "\\${")
        replaceString = replaceString.reverse().join("�")
        d = "$=`" + d + "`;`" + replaceString + "`.split`�`.map((e,i,a)=>{i%2==0&&($=$.split(e).join(a[i+1]))})\neval($)"
    }
    return d
}

function getMatchIndexes(str, toMatch) {
    var toMatchLength = toMatch.length,
        indexMatches = [], match,
        i = 0

    while ((match = str.indexOf(toMatch, i)) > -1) {
        indexMatches.push(match)
        i = match + toMatchLength
    }

    return indexMatches
}

function uniq(a) {
    var seen = {}
    return a.filter(function(item) { return seen.hasOwnProperty(item) ? false : (seen[item] = true) })
}

function getKeyByValue(object, value) { return Object.keys(object).find(key => object[key] === value) }

// Results:
//    MIN    :          20,728 > 7,267 bytes (full, slow)
//    ZIP    :          20,728 > 4,956 bytes
// MIN + ZIP : 20,728 >  7,267 > 4,661 bytes (full, slow)
// MIN + ZIP : 20,728 >  8,914 > 4,486 bytes (full, fast)
// MIN + ZIP : 20,728 > 12,734 > 4,029 bytes (full, none)

// Conclusion:
//   If using ZIP, use 'full', 'none' compression.
//   If not using ZIP, use 'full', 'slow' compression.