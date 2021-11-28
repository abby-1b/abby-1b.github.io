
// Logging
var logDepth = 0
function logD() {
	let err = new Error()
    logDepth = err.stack.split("\n").length - 1
}
function log(...i) {
    let err = new Error()
    console.log(" ".repeat(Math.max(err.stack.split("\n").length - 1 - logDepth, 0)), ...i)
}

// Peer
var tPeer = -1 // Peer object
var tCode = -1 // The code

function codeToID(code) {
	return "gow_" + btoa(code)
}
