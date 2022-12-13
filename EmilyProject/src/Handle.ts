
const inp: HTMLTextAreaElement = document.querySelector("#in")!
const out: HTMLTextAreaElement = document.querySelector("#out")!

let evt = 0
inp.onkeydown = e => {
	if ((e.key.length == 1 || e.key == "Backspace") && !e.metaKey && !e.ctrlKey && !e.altKey) {
		const e = ++evt
		setTimeout(() => {
			if (evt == e) out.value = convert(inp.value)
		}, 50 + Math.sqrt(inp.value.length))
	}
}

setTimeout(() => out.value = convert(inp.value), 100)
