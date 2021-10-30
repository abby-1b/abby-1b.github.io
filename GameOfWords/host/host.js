
let people = []

function genCode() {
	while ([-1, "420", "666", "A55", "BAD"].includes(tCode)
		|| tCode.includes("69"))
		tCode = [0, 1, 2].map(e => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()
	codeContainer.innerText = tCode
	tPeer = new Peer(codeToID(tCode))
	tPeer.on('connection', (conn) => {
		log("Guest connected.")
		conn.on('data', (data) => {
			if (data.startsWith("name:")) {
				let n = data.split(':')[1]
				if (people.includes(n)) {
					conn.send("name:0:0")
					log(n, "already in use.")
				} else if (n.length > 20) {
					conn.send("name:0:1")
					log(n, "longer than 20 chars.")
				} else if (profane(n)) {
					conn.send("name:0:2")
					log(n, "watch your profanity.")
				} else {
					conn.send("name:1")
					log("Guest named:", n)
					addPerson(n)
				}
			}
		})
	})
}

let codeContainer = document.getElementById("codeContainer")
codeContainer.onpointerdown = function() {
	navigator.clipboard.writeText(codeContainer.innerText)
}
genCode()

function addPerson(name) {
	people.push(name)
	let el = document.createElement("h2")
	el.innerText = name
	el.className = "nameBounce"
	let nameGrid = document.getElementById("nameGrid")
	nameGrid.prepend(el)
}

let profanities = decodeArray('WyJmdWNrIiwic2hpdCIsIjQyMCIsIjQybyIsInBpc3MiLCJwaXMiLCJuaWdnZXIiLCJuaWdlciIsImFuYWwiLCJhcnNlIiwiZmFnIiwiYXNzIiwiY29jayIsImNvayIsImN1bnQiLCJkaWNrIiwiZGlsZG8iLCJlamFjdWxhdGUiLCJjdW0iLCJmb29rIiwiZm9rIiwiaGVsbCIsImhlbCIsImppenoiLCJqaXoiLCJtYXN0ZXJiYXRlIiwibWFzdHVyYmF0ZSIsIm1hc3RlcmI4IiwibWFzdGVyYmIiLCJtYXN0ZXJiIiwibWFzdHVyYjgiLCJtYXN0dXJiYiIsIm1hc3R1cmIiLCJmdWNjIiwiZnVjIiwibmlnYSIsIm5pZ2dhIiwibmlnZ2UiLCJuaWdlIiwib3JnYXNtIiwicG9ybiIsInBlbmlzIiwicG9vcCIsInBvcCIsInB1c3N5IiwicHVzeSIsInJlY3R1bSIsInNleCIsInNoaSsiLCJzaGkiLCJzbHV0IiwidmlhZ3JhIiwid2hvcmUiLCJmdWsiXQ==')

// Checks for profanity in words.
function profane(n) {
	n = decons(n)[0]

	// It's a filter. All of these are bad. Don't read them. Please.
	// I'll even encode them, just so I don't have to commit these things.
	for (let p = 0; p < profanities.length; p++) {
		if (n.includes(profanities[p])) return true
	}
	return false
}

function decons(s) {
	let original = s + ""
	s = s.toLowerCase()
	s = s.replace(/0/g, 'o')
	s = s.replace(/1/g, 'i')
	s = s.replace(/5/g, 's')
	s = s.replace(/6/g, 'b')
	s = s.replace(/7/g, 't')
	s = s.replace(/8/g, 'b')
	s = s.replace(/;/g, 'i')
	let half = s + ""
	s = s.replace(/[^a-zA-Z0-9]/g, '')
	let repeats = s + ""
	s = s.split('').filter((e, i, a) => {
		return (i == a.length - 1) || e != a[i + 1]
	}).join('')
	return [repeats, [original, half, repeats, s]]
}

function decodeArray(str) {
	return JSON.parse(atob(str))
}

// If you eventually want to re-do the array, then here you go.
function encodeArray(arr) {
	arr = btoa(JSON.stringify(
		Array.from(new Set(arr.map(e => decons(e)[1].join(',')).join(',').split(',')))
			.filter(e => e.length > 2)
	))
	return arr
}

// Menu
let menuButton = document.getElementById('menuButton')
menuButton.addEventListener('click', (e) => {
	
})
