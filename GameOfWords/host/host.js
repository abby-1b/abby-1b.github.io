
function genCode() {
	while ([-1, "420", "666", "A55", "BAD"].includes(tCode)
		|| tCode.includes("69"))
		tCode = [0, 1, 2].map(e => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()
	codeContainer.innerText = tCode
	tPeer = new Peer(codeToID(tCode))
	tPeer.on('connection', (conn) => {
		conn.on('data', (data) => {
			console.log(data)
		})
	})
}

let codeContainer = document.getElementById("codeContainer")
codeContainer.onpointerdown = function() {
	navigator.clipboard.writeText(codeContainer.innerText)
}
genCode()
