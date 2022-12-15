
// Maps phrases/words to others.
const phraseMap: {[key: string]: string} = {}

// Holds pre-constructed RegExps (as strings) to be executed
const regs: {[key: string]: [string, number]} = {}

// Holds RegExps (as strings) to be executed without further processing
const straightRegs: {[key: string]: string} = {}

fetch("shake.json").then(r => r.text()).then(t => {
	const jsonData = JSON.parse(t) as {[key: string]: string}

	// Phrases
	;((f: string[], t: string[]) => {
		for (let i = 0; i < f.length; i++) if (t[i] != "alas") phraseMap[f[i]] = t[i]
	})(jsonData.phrases1.split("\n"), jsonData.phrases2.split("\n"))

	// Words
	;((f: string[], t: string[]) => {
		for (let i = 0; i < f.length; i++) if (t[i] != "alas") phraseMap[f[i]] = t[i]
	})(jsonData.words1.split("\n"), jsonData.words2.split("\n"))

	// Intrawords
	;((f: string[], t: string[]) => {
		for (let i = 0; i < f.length; i++) regs["(" + f[i] + ")"] = [t[i], 0]
	})(jsonData.intraword1.split("\n"), jsonData.intraword2.split("\n"))

	// Prefixes
	;((f: string[], t: string[]) => {
		for (let i = 0; i < f.length; i++) regs["( |^|[^A-Za-z])(" + f[i] + ")"] = [t[i], 1]
	})(jsonData.prefixes1.split("\n"), jsonData.prefixes2.split("\n"))

	// Suffixes
	;((f: string[], t: string[]) => {
		for (let i = 0; i < f.length; i++) regs["(" + f[i] + ")(?=( |$|[^A-Za-z]))"] = [t[i], 0]
	})(jsonData.suffixes1.split("\n"), jsonData.suffixes2.split("\n"))

	console.log(regs)

	out.value = convert(inp.value)
})

function convert(dat: string): string {
	if (Object.keys(phraseMap).length == 0) return "Conversions not loaded yet!"
	let i = 0

	// Loop through phrase map
	for (const k in phraseMap) {
		if (k.length < 2) continue
		dat = dat.replace(new RegExp("( |^|[^A-Za-z])(" + k + ")( |$|[^A-Za-z])", "gi"), (...e: string[]) => {
			let v = phraseMap[k]
			i++
			const t = e[2].trim()
			const c1 = t[0].toUpperCase() == t[0]
				, c2 = t[1].toUpperCase() == t[1]
			if (c1 && c2) v = v.toUpperCase()
			else if (c1 && !c2) v = v[0].toUpperCase() + v.slice(1)
			return e[1] + (e[2][0] == " " ? " " : "") + v + (e[2][e.length - 1] == " " ? " " : "") + e[3]
		})
	}

	// Loop through regexes
	for (const r in regs) {
		dat = dat.replace(new RegExp(r, "gi"), (...a: string[]) => {
			const v: [string, number] = [regs[r][0], regs[r][1]]
			const e = a.slice(1, -2)
			i++
			const t = e[v[1]].trim()
			const c1 = t[0].toUpperCase() == t[0]
				, c2 = t[1].toUpperCase() == t[1]
			if (c1 && c2) v[0] = v[0].toUpperCase()
			else if (c1 && !c2) v[0] = v[0].toUpperCase() + v[0].slice(1)
			e[v[1]] = (e[v[1]][0] == " " ? " " : "") + v[0] + (e[v[1]][e.length - 1] == " " ? " " : "")
			console.log(e, a)
			return e.join("")
		})
	}

	// Loop through straight regexes
	// for (const r in straightRegs) {
	// 	let v = regs[r]
	// 	dat = dat.replace(new RegExp(r, "gi"), regs[r])
	// }

	console.log("Conversions:", i)
	return dat
}
