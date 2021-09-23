
// Mode
let mode = false
let metaCtrlDown = 0

// Graph drawing things
let graphScale = 31 // How much to scale the graph
let graphStep = 5 // Steps to take when drawing graph
let colors = ["#ba2613", "#2cba13", "#1374ba", "#b7ba13", "#13ba88", "#6f13ba"]

let math = {
    bin: (n) => { console.log("BIN!"); return parseInt(n + "", 2) },
    log: (n) => { console.log(n) },
}

// Canvas
let cv = document.getElementById("cv")
let cvc = cv.getContext('2d')

// Eval scope preserving
let returned = ""
function storeVars(target) {
    return new Proxy(target, {
        has(target, prop) { return true },
        get(target, prop) { return (prop in target ? target : (prop in math ? math : Math))[prop] }
    })
}

// Parses math
function parseMath(inp) {
    inp = inp.replace(/√/g, "sqrt")
    inp = inp.replace(/ /g, "")
    while (true) {
        let mul = /((?<=[\d.])[a-zA-Z(]|(?<=[a-zA-Z)])[\d.]|(?<=\))[a-zA-Z(])/g.exec(inp)
        if (!mul) break
        inp = inp.substring(0, mul.index) + "*" + inp.substring(mul.index)
    }
    return inp
}

// Evaluates math
function mathProcess(inp, context) {
    try {
        inp = parseMath(inp)
        return function(){
            returned = eval("with(storeVars(this)){" + inp + "}")
            return this
        }.call(context)
    } catch (e) {
        return e
    }
}

// Evaluates JS code
function process(js, context) {
    try {
        return function(){
            returned = eval("with(storeVars(this)){" + js + "}")
            return this
        }.call(context)
    } catch (e) {
        return context
    }
}

// Guess what this does...
function drawGraph(g, v, context, id) {
    cvc.strokeStyle = colors[id % colors.length]
    cvc.beginPath()
    try {
        let l = 0
        for (let x = -cv.width / 2 - graphStep; x < cv.width / 2 + graphStep; x += graphStep) {
            let y = function(){return eval("with(storeVars(this)){" + g.replace(new RegExp(v, 'g'), x / graphScale) + "}")}.call(context) * graphScale
            cvc.moveTo(x, -y)
            cvc.lineTo((x - graphStep), -l)
            l = y
            cvc.stroke()
        }
    } catch (e) {}
    cvc.closePath()
}

// Updates the textarea
function updateInfo() {
    document.getElementById('if').value = `Tab Menu
    
    Press Tab again to exit
    Press  Up  /  Down  to change graph sizing ±1
    Press Left / Right  to change graph sizing ±5
    
    Press F to format text.`
}

function formatForDocs() {
    let val = document.getElementById('edt').value
    let mappings = {
        "0": "⁰",
        "1": "¹",
        "2": "²",
        "3": "³",
        "4": "⁴",
        "5": "⁵",
        "6": "⁶",
        "7": "⁷",
        "8": "⁸",
        "9": "⁹",
        "+": "⁺",
        "-": "⁻",
        "=": "⁼",
        "(": "⁽",
        ")": "⁾",
        "n": "ⁿ",
        "i": "ⁱ"
    }
    val = val.replace(/\*/g, '×')
    val = val.replace(/\^[-\d.]*/g, (e) => {
        return e.split('').map(g => mappings[g]).join('')
    })
    val = val.split('\n')
        .map(e => '\t'.repeat(e.search(/\S/) / 2) + e.trim())
        .join('\n')
    document.getElementById('edt').value = val
}

document.onkeydown = function(e){
    if (!e) return
    if (e.key) {
        // Special keys
        if (e.key == "Tab") {
            e.preventDefault()
            mode = !mode
            document.getElementById('if').style.opacity = mode ? '1' : '0'
            return
        }

        if (mode) {
            let act = false
            console.log(e.key)
            if (e.key == "ArrowUp") {
                act = true; graphScale += 1
            } else if (e.key == "ArrowDown") {
                act = true; graphScale -= 1
            } else if (e.key == "ArrowLeft") {
                act = true; graphScale -= 5
            } else if (e.key == "ArrowRight") {
                act = true; graphScale += 5
            } else if (e.key == 'f') {
                formatForDocs()
            }
            if (act) setTimeout(mathAnalyze, 0)
            e.preventDefault()
        }

        metaCtrlDown |= (e.key == "Meta"    ? 1 : 0)
        metaCtrlDown |= (e.key == "Control" ? 2 : 0)

        if (metaCtrlDown != 0 && e.key == 'z') setTimeout(mathAnalyze, 1)
        if (e.key.includes("Arrow") || e.key == "Shift" || e.key == "Control" || e.key == "Meta" || e.key == "Alt" || e.key == "CapsLock")
            return
    }

    // This timeout makes sure the code runs after the key is processed by the browser.
    setTimeout(mathAnalyze, 0)
}
document.onpaste = document.onkeydown

document.onkeyup = function(e) {
    metaCtrlDown ^= (e.key == "Meta"    ? 1 : 0)
    metaCtrlDown ^= (e.key == "Control" ? 2 : 0)
}

function mathAnalyze() {
    let str = document.getElementById("edt").value
    while (str[str.length - 1] == '\n') str = str.substring(0, str.length - 1)
    str = str.split("\n")
        .map(e => e.replace(/\t/g, "  "))
    let ov = document.getElementById("ov")
    for (let ne = ov.children.length; ne < str.length; ne++) ov.appendChild(document.createElement("div"))
    let ctx = {m: {x: 1, y: 1}}
    
    // Graph resetting
    let graphNum = 0
    let graphEnabled = false
    cv.width = cv.width
    cvc.translate(Math.floor(cv.width / 2) + .5, Math.floor(cv.height / 2) + .5)
    cvc.strokeStyle = "#000"
    cvc.moveTo(cv.width / 2, 0)
    cvc.lineTo(-cv.width / 2, 0)
    cvc.stroke()
    cvc.moveTo(0, cv.height / 2)
    cvc.lineTo(0, -cv.height / 2 - .5)
    cvc.stroke()

    for (let s = 0; s < ov.children.length; s++) {
        if (s >= str.length) { ov.children[s].innerHTML = "&nbsp;"; continue }
        if (str[s].length == 0) { ov.children[s].innerHTML = "&nbsp;"; continue }

        returned = "!!!"
        if (str[s][str[s].length - 1] == '\\' || str[s][str[s].length - 1] == '=') {
            // Math: Implements multiplication without an operator.
            ctx = mathProcess(str[s].slice(0,-1), ctx)
            ov.children[s].innerHTML = "&nbsp;".repeat(str[s].length + 1) + returned
        } else if (str[s][str[s].length - 1] == '~') {
            // Execution: Executes JS code. No questions asked.
            ctx = process(str[s].slice(0, -1), ctx)
            ov.children[s].innerHTML = "&nbsp;".repeat(str[s].length + 1) + returned
        } else if (str[s][str[s].length - 1] == '$') {
            // Graph: Graphs things to a canvas.
            let gstr = parseMath(str[s].slice(0,-1)).split('=')
            if (gstr.length == 1 && gstr[0] == "") graphEnabled = true
            if (gstr[0] == "y") {
                drawGraph(gstr[1], 'x', ctx, graphNum++)
            }
            ov.children[s].innerHTML = "&nbsp;".repeat(str[s].length + 1) + (gstr[0] == '' ? "Graph enabled" : (graphEnabled ? "Graphed" : "Off"))
        } else {
            // Didn't find anything to do.
            ov.children[s].innerHTML = "&nbsp;" // If there's nothing (a normal space is nothing) the line doesn't render.
        }
    }

    // Show/hide graphs
    if (graphEnabled) {
        cv.style.opacity = "1"
        cv.style.backgroundColor = "rgba(255,255,255,0.8)"
    } else {
        cv.style.opacity = "0"
        cv.style.backgroundColor = "rgba(255,255,255,0)"
    }
}

window.onresize = function() {
    cv.width = window.innerWidth / 2
    cv.height = window.innerHeight - 20
}
window.onresize()

// Scrolls the overlay with the editable text
window.addEventListener('scroll', function(){
    document.getElementById("ov").style.top = -document.getElementById("edt").scrollTop + "px"
}, true)

document.onload = document.onkeydown

updateInfo()

