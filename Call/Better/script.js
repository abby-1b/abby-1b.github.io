
function out(...txt) {
	document.getElementById("out").value += txt.join(" ") + "\n"
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()
recognition.continuous = true
recognition.interimResults = true

recognition.onresult = r => {
	out([...r.results].map(i => i[0].transcript).join(" "))
}

recognition.onerror = e => {
	console.log(`Speech recognition error detected: ${e.error}`)
	console.log(`Additional information: ${e.message}`)
}

function start() {
	console.log("Starting.")
	recognition.start()
}

window.addEventListener("load", () => { start() })

// const r = new window.webkitSpeechRecognition()
// r.onerror = e => {
// 	console.log(`Speech recognition error detected: ${e.error}`)
// 	console.log(`Additional information: ${e.message}`)
// }
// r.onresult = r => {
// 	console.log("Result:", r)
// }
// r.start()
