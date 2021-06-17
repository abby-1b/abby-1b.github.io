
let editingText = JSON.parse(localStorage.getItem("apps"))[1].content.split("\n")

let onLine = editingText.length - 1
let onChar = editingText[onLine].length

function setup() {
    console.log(localStorage.getItem("apps"))
    addButton(width - 5, 0, 5, 5, function(b, i) {
        _startOS()
    })
}

function draw() {
    fill(0)
    background()
    
    stroke(255, 0, 0)
    line(width - 5, 0, width, 5)
    
    if (editingText.length == 0) {
        editingText[0] = ""
    }
    if (kbJustPressed.includes("MODE")) {
        _keyboardMode = (_keyboardMode + 1) % 3
    } else if (kbJustPressed.includes("BACK")) {
        if (onChar < 1) {
            let lineContent = editingText[onLine]
            editingText.splice(onLine, 1)
            onChar = editingText[--onLine].length
            editingText[onLine] += lineContent
        } else {
            editingText[onLine] = editingText[onLine].slice(0, onChar - 1) + editingText[onLine].slice(onChar)
            onChar--
        }
    } else if (kbJustPressed.includes("SHFT")) {
        onChar--
    } else if (kbJustPressed.includes("\n")) {
        let lineContent = editingText[onLine].slice(onChar)
        editingText[onLine] = editingText[onLine].slice(0, onChar)
        onLine += 1
        editingText.splice(onLine, 0, lineContent)
        onChar = 0
    } else {
        let addChars = kbJustPressed.filter(e => e.length == 1).join("")
        //editingText[onLine] += addChars
        editingText[onLine] = editingText[onLine].slice(0, onChar) + addChars + editingText[onLine].slice(onChar)
        onChar += addChars.length
    }

    fill(255)
    for (let l = 0; l < editingText.length; l++) {
        text(editingText[l], 1, 2 + l * 5)
    }
    
    if (frameCount % 20 < 10) {
        text('|', onChar * 4 - 1, onLine * 5 + 2)
    }
    
    for (let t = 0; t < touch.length; t++) {
        if (touch[t].y < height - 120) {
            onLine = Math.round(touch[t].y / 5)
            if (onLine >= editingText.length) {
                onLine = editingText.length - 1
            }
            onChar = Math.round(touch[t].x / 5)
            if (onChar > editingText[onLine].length) {
                onChar = editingText[onLine].length
            }
        }
    }

    stroke(255)
    fill(255)
    _drawKeyboard()
}

function beforeUnload() {
    save(1)
    
}

function save(id) {
    editingText = editingText.join("\n")
    let apps = JSON.parse(localStorage.getItem("apps"))
    apps[1].content = editingText
    localStorage.setItem("apps", JSON.stringify(apps))
}
