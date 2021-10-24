
function genCode() {
	while ([-1, "420", "666", "A55", "BAD"].includes(tCode)
		|| tCode.includes("69"))
		tCode = [0, 1, 2].map(e => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()
	codeContainer.innerText = tCode
	tPeer = new Peer("gow" + btoa(tCode))
	tPeer.on('connection', function(conn) {
		conn.on('data', function(data){
			console.log(data)
		})
	})
}

let codeContainer = document.getElementById("codeContainer")
codeContainer.onpointerdown = function() {
	navigator.clipboard.writeText(codeContainer.innerText)
}
genCode()
