
let editingText = JSON.parse(localStorage.getItem("apps"))[1].content.split("\n")

let onLine = 0

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
    if (kbJustPressed.includes("\n")) {
        onLine += 1
        editingText.splice(onLine, 0, "")
    } else {
        editingText[onLine] += kbJustPressed.join("")
    }

    fill(255)
    for (let l = 0; l < editingText.length; l++) {
        text(editingText[l], 1, 2 + l * 5)
    }

    stroke(255)
    fill(255)
    _drawKeyboard()
    if (touch.length >= 5) {
        _startOS()
    }
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

