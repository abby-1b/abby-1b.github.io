
function loadBook() {
	fetch("./outsiders.txt").then(r => r.text()).then(t => {
		inp.value = t
		out.value = convert(inp.value)
	})
}
