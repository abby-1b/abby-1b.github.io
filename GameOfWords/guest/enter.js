
var codeContainer = document.getElementById("codeContainer")

tPeer = new Peer()
let conn = -1

let keypressListener = function(e) {
	if (e.key == "Enter" && this.value.length == 3) {
		codeContainer.removeEventListener('keypress', keypressListener)
		tCode = this.value
		connectToCode()
	}

	if (e.ctrlKey || e.metaKey || e.altKey) return
	if ("qwrtyuiopsghjklzxvnm".includes(e.key.toLowerCase())
		|| (e.key.length == 1 && codeContainer.value.length >= 3
		&& Math.abs(e.target.selectionEnd - e.target.selectionStart) == 0)) {
		e.preventDefault()
		return
	}

	if ((e.key.charCodeAt(0) >= 97) && (e.key.charCodeAt(0) <= 122)) {
		let start = e.target.selectionStart
		e.target.value = e.target.value.substring(0, start)
			+ String.fromCharCode(e.key.charCodeAt(0) - 32)
			+ e.target.value.substring(e.target.selectionEnd)
		e.target.setSelectionRange(start + 1, start + 1)
		e.preventDefault()
	}
}
codeContainer.addEventListener('keypress', keypressListener)

function connectToCode() {
	conn = tPeer.connect(codeToID(tCode))
	conn.on('open', function() {
		console.log("Good! Next thing now.")
		document.getElementById("codeFrame").classList.add("hidden")
		document.getElementById("nameFrame").classList.remove("hidden")
	})
}


document.getElementById("codeFrame").classList.add("hidden")
document.getElementById("nameFrame").classList.remove("hidden")