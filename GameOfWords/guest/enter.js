
let codeContainer = document.getElementById("codeContainer")
let nameContainer = document.getElementById("nameContainer")

tPeer = new Peer()
let conn = -1

let keypressListener = function(e) {
	if (this == codeContainer) {
		if (e.key == "Enter" && this.value.length == 3) {
			this.removeEventListener('keypress', keypressListener)
			tCode = this.value
			connectToCode()
		}

		if (e.ctrlKey || e.metaKey || e.altKey) return
		if ("qwrtyuiopsghjklzxvnm".includes(e.key.toLowerCase())
			|| (e.key.length == 1 && this.value.length >= 3
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
	} else if (this == nameContainer) {
		if (e.key == "Enter") {
			this.removeEventListener('keypress', keypressListener)
			tPeer.on('connection', (conn) => {
				conn.on('data', (data) => {
					console.log("Received:", data)
				})
			})
			conn.send("name:" + this.value)
		}
	}
}
codeContainer.addEventListener('keypress', keypressListener)

function connectToCode() {
	conn = tPeer.connect(codeToID(tCode))
	log("Connecting to host...")
	conn.on('open', function() {
		log("Connected to host.")
		document.getElementById("codeFrame").classList.add("hidden")
		document.getElementById("nameFrame").classList.remove("hidden")
		nameContainer.addEventListener('keypress', keypressListener)
	})
	conn.on('data', (data) => {
		console.log("Received:", data)
		if (data.startsWith("name:")) {
			if (data.split(':')[1] == '0') {
				console.log("Name not available!")
			} else {
				console.log("Name registered!")
			}
		}
	})
}
