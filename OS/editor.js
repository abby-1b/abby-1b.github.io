let editingID = parseInt(prompt("App ID"))
let editingText = JSON.parse(localStorage.getItem("apps"))[editingID].content.split("\n")

let onLine = editingText.length - 1
let onChar = editingText[onLine].length

let blink = 0
let blinkTime = 30

function setup() {
    console.log(localStorage.getItem("apps"))
}

function draw() {
    fill(0)
    background()
	
    if (editingText.length == 0) {
        editingText[0] = ""
    }
    
    if (kbJustPressed.length > 0) {
		if (kbJustPressed.includes("TABB")) {
			kbJustPressed = kbJustPressed.filter(e => e != "TABB")
			kbJustPressed.push(...[" ", " ", " ", " "])
		}
		
		if (kbJustPressed.includes("MODE")) {
		    _keyboardMode = (_keyboardMode + 1) % 2
		}
		if (kbJustPressed.includes("BACK")) {
		    if (onChar < 1 && onLine > 0) {
		        let lineContent = editingText[onLine]
		        editingText.splice(onLine, 1)
		        onChar = editingText[--onLine].length
		        editingText[onLine] += lineContent
		    } else if (onChar > 0) {
		        editingText[onLine] = editingText[onLine].slice(0, onChar - 1) + editingText[onLine].slice(onChar)
		        onChar--
		    }
		}
		if (kbJustPressed.includes("SHFT")) {
		    onChar--
		    if (onChar < 0 && onLine > 0) {
		    	onLine--
		    	onChar = editingText[onLine].length
		    } else if (onChar < 0 && onLine <= 0) {
		    	onChar = 0
		    }
		}
		if (kbJustPressed.includes("\n")) {
		    let lineContent = editingText[onLine].slice(onChar)
		    editingText[onLine] = editingText[onLine].slice(0, onChar)
		    let indent = editingText[onLine].search(/\S|$/)
		    if ("({[".includes(editingText[onLine][editingText[onLine].length - 1])) {
		    	indent += 2
		    }
		    onLine += 1
		    editingText.splice(onLine, 0, lineContent)
		    onChar = indent
		    editingText[onLine] = " ".repeat(indent)
		} else {
		    let addChars = kbJustPressed.filter(e => e.length == 1).join("")
		    //editingText[onLine] += addChars
		    editingText[onLine] = editingText[onLine].slice(0, onChar) + addChars + editingText[onLine].slice(onChar)
		    onChar += addChars.length
		}
		blink = blinkTime
	}

    fill(255)
    for (let l = 0; l < editingText.length; l++) {
        text(editingText[l], 1, 2 + l * 5)
    }
    
    if (blink > blinkTime / 2) {
        if (blink == blinkTime) {
            fill(100, 100, 255, Math.sin((frameCount % 10) * Math.PI / 20) * 55 + 150)
            fillRect(onChar * 4 - 1, onLine * 5 + 1, 3, 6)
        } else {
            fill(100, 100, 255)
            fillRect(onChar * 4, onLine * 5 + 1, 1, 6)
        }
    }
    blink--
    if (blink < 0) {
        blink = blinkTime - 1
    }
    
    for (let a = 0; a < kbJustPressed.length; a++) {
    	if (kbJustPressed[a] == "ARUP") {
    		if (onLine == 0) continue
    		onLine--
    		if (onChar > editingText[onLine].length) onChar = editingText[onLine].length
    	} else if (kbJustPressed[a] == "ADWN") {
    		if (onLine > editingText.length - 2) {
    			onChar = editingText[onLine].length
    			continue
    		}
    		onLine++
    		if (onChar > editingText[onLine].length) onChar = editingText[onLine].length
    	} else if (kbJustPressed[a] == "ALFT") {
    		if (onChar < 1) {
    			if (onLine > 0) {
    				onLine--
    				onChar = editingText[onLine].length
    			}
    			continue
    		}
    		onChar--
    	} else if (kbJustPressed[a] == "ARGH") {
    		if (onChar > editingText[onLine].length - 1) {
    			if (onLine < editingText.length - 1) {
    				onLine++
    				onChar = 0
    			}
    			continue
    		}
    		onChar++
    	}
    }
    
    for (let t = 0; t < touch.length; t++) {
        if (touch[t].y < height - 120) {
            blink = blinkTime
            onLine = Math.round(touch[t].y / 5) - 5
            if (onLine >= editingText.length) {
                onLine = editingText.length - 1
            } else if (onLine < 0) {
                onLine = 0
            }
            onChar = Math.round(touch[t].x / 4)
            if (onChar > editingText[onLine].length) {
                onChar = editingText[onLine].length
            } else if (onChar < 0) {
                onChar = 0
            }
        }
    }
    
    _drawKeyboard()
}

function beforeUnload() {
    save(editingID)
}

function save(id) {
    editingText = editingText.join("\n")
    let apps = JSON.parse(localStorage.getItem("apps"))
    apps[id].content = editingText
    localStorage.setItem("apps", JSON.stringify(apps))
}
