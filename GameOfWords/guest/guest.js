
let codeContainer = document.getElementById("codeContainer")

codeContainer.addEventListener('keypress', function(e) {
	if (e.key == "Enter") {
		
	}

	if (e.ctrlKey || e.metaKey || e.altKey)
		return
	
	if (e.key.length == 1 && codeContainer.value.length >= 3 && Math.abs(e.target.selectionEnd - e.target.selectionStart) == 0) {
		e.preventDefault()
		return
	}

	if ((e.key.charCodeAt(0) >= 97) && (e.key.charCodeAt(0) <= 122)) {
		let start = e.target.selectionStart
		e.target.value = e.target.value.substring(0, start) + String.fromCharCode(e.key.charCodeAt(0) - 32) + e.target.value.substring(e.target.selectionEnd)
		e.target.setSelectionRange(start + 1, start + 1)
		e.preventDefault()
	}
})
