
function setup() {
    console.log(localStorage.getItem("apps"))
}

function draw() {
    fill(0)
    background()

    stroke(255)
    fill(255)
    _drawKeyboard()
    if (touch.length >= 5) {
        _startOS()
    }
    console.log("EDITOR DRAW!")
}
