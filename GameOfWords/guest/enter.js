
let codeContainer = document.getElementById("codeContainer")
let nameContainer = document.getElementById("nameContainer")

tPeer = new Peer()
let conn = -1

let keypressListener = function(e) {
	if (e.key == "Enter")
		this.removeEventListener('keypress', keypressListener)
	if (this == codeContainer) {
		if (e.key == "Enter" && this.value.length == 3) {
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
				let errCode = data.split(':')[2]
				if (errCode == '0') {
					console.log("Already in use.")
				} else if (errCode == '1') {
					console.log("Too long.")
				} else if (errCode == '2') {
					console.log(["We don't do that here.", "Not so fast!", "Yeah, no.", "That's not allowed.", "We don't do that here!!!"][Math.floor(Math.random() * 5)])
				}
				nameContainer.addEventListener('keypress', keypressListener)
			} else {
				console.log("Name registered!")
			}
		}
	})
}
