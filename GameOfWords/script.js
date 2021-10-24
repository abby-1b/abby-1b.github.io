
// Logging
let logDepth = 0
function logD() {
	var err = new Error()
    logDepth = err.stack.split("\n").length - 1
}
function log(...i) {
    let err = new Error()
    console.log(" ".repeat(Math.max(err.stack.split("\n").length - 1 - logDepth, 0)), ...i)
}

// Peer
let tPeer = -1 // Peer object
let tCode = -1 // The code