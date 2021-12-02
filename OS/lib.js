let _homeWidth = 15

let _canvas = document.getElementById("canvas")
let _normalCtx = _canvas.getContext("2d")
_normalCtx.imageSmoothingEnabled = false

let _ctx = _normalCtx

let _fill = [255, 255, 255, 255]
let _stroke = [150, 150, 150, 255]

let touch = []

let width = 0
let height = 0

let frameCount = 0

let _drawInterval = null

let _currentUnloadFunction = ()=>{}
let _currentCodeName = ""

/// ERRORS
let _errors = []

function _error(t, err) {
	clearInterval(_drawInterval)
	if (err == undefined) { err = (function(){try{throw Error('')}catch(err){return err}})() }
	err = err.stack.split("\n")
	let errStr = ""
	if (t != "") { errStr += t + "\n" }
	else { errStr += err[0].split(": ").slice(1).join(": ") + "\n" }
	if (err.join("").includes("eval at")) {
		errStr += "  Line: " + err.filter(e => e.includes("eval at"))[0].split(":").slice(-2).join(" : ").replace(")", "")
	} else {
		errStr += "(Unknown error)\n" + err
		//errStr += "  Line: " + err.filter(e => e.includes("eval at"))[0].split(":").slice(-2).join(" : ").replace(")", "")
	}
	_errors.push(errStr)
	_startos()
}

/// CHANGE CANVAS

function drawOn(spr) {
    _ctx = spr.ctx
}

function drawEnd() {
    _ctx = _normalCtx
}

/// CANVAS FUNCTIONS

// Sets the stroke color
function stroke(r, g=-1, b=-1, a=-1) {
    if (r == undefined) { _error("'stroke' needs at least one argument!") }
    if (g == -1) {
        _stroke = [r, r, r, 255]
    } else if (b == -1) {
        _stroke = [r, r, r, g]
    } else if (a == -1) {
        _stroke = [r, g, b, 255]
    } else {
        _stroke = [r, g, b, a]
    }
}

// Sets the fill color
function fill(r, g=-1, b=-1, a=-1) {
    if (r == undefined) { _error("'fill' needs at least one argument!") }
    if (g == -1) {
        _fill = [r, r, r, 255]
    } else if (b == -1) {
        _fill = [r, r, r, g]
    } else if (a == -1) {
        _fill = [r, g, b, 255]
    } else {
        _fill = [r, g, b, a]
    }
}

// Draws a line
function line(x0, y0, x1, y1) {
    if (arguments.length < 4) { _error("'line' not given enough arguments!"); return; }
    let dx = Math.abs(x1 - x0),
        dy = Math.abs(y1 - y0),
        sx = (x0 < x1) ? 1 : -1,
        sy = (y0 < y1) ? 1 : -1,
        err = dx - dy
    
    _ctx.fillStyle = `rgb(${_stroke[0]},${_stroke[1]},${_stroke[2]})`
    _ctx.globalAlpha = _stroke[3] / 255.0
    while (true) {
        _ctx.fillRect(Math.round(x0), Math.round(y0), 1, 1)
        if (Math.abs(x0 - x1) < 1 && Math.abs(y0 - y1) < 1) { break }
        let e2 = 2 * err
        if (e2 > -dy) {
            err -= dy
            x0 += sx
        }
        if (e2 < dx) {
            err += dx
            y0 += sy
        }
    }
}

// Draws a single pixel
function point(x, y) {
    if (arguments.length < 2) { _error("'point' not given enough arguments!"); return;  }
    _ctx.fillStyle = `rgb(${_stroke[0]},${_stroke[1]},${_stroke[2]})`
    _ctx.globalAlpha = _stroke[3] / 255.0
    _ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
}

// Draws the outline of a rectangle
function rect(x, y, w, h) {
	if (arguments.length < 4) { _error("'rect' not given enough arguments!") }
    _ctx.strokeStyle = `rgb(${_stroke[0]},${_stroke[1]},${_stroke[2]})`
    _ctx.beginPath()
    _ctx.globalAlpha = _stroke[3] / 255.0
    _ctx.rect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))
    _ctx.stroke()
}

// Draws a filled rectangle, without an outline
function fillRect(x, y, w, h) {
	if (arguments.length < 4) { _error("'fillRect' not given enough arguments!") }
    _ctx.fillStyle = `rgb(${_fill[0]},${_fill[1]},${_fill[2]})`
    _ctx.globalAlpha = _fill[3] / 255.0
    _ctx.fillRect(Math.round(x), Math.round(y), w, h)
}

// Fills the screen with the fill color
function background() {
    _ctx.fillStyle = `rgb(${_fill[0]},${_fill[1]},${_fill[2]})`
    _ctx.globalAlpha = _fill[3] / 255.0
    _ctx.fillRect(0, 0, width, height)
}

// Draws a circle outline
function circle(xc, yc, r) {
	if (arguments.length < 3) { _error("'circle' not given enough arguments!") }
    xc = Math.round(xc)
    yc = Math.round(yc)
    r = Math.round(r)
    _ctx.fillStyle = `rgb(${_stroke[0]},${_stroke[1]},${_stroke[2]})`
    _ctx.globalAlpha = _stroke[3] / 255.0
    let y = 0, cd = 0
    _ctx.fillRect(xc - r, yc, 1, 1)
    _ctx.fillRect(xc + r, yc, 1, 1)
    _ctx.fillRect(xc, yc - r, 1, 1)
    _ctx.fillRect(xc, yc + r, 1, 1)
    while (r > y) {
        cd -= (--r) - (++y)
        if (cd < 0) cd += r++
        _ctx.fillRect(xc - y, yc - r, 1, 1)
        _ctx.fillRect(xc - r, yc - y, 1, 1)
        _ctx.fillRect(xc - r, yc + y, 1, 1)
        _ctx.fillRect(xc - y, yc + r, 1, 1)
        _ctx.fillRect(xc + y, yc - r, 1, 1)
        _ctx.fillRect(xc + r, yc - y, 1, 1)
        _ctx.fillRect(xc + r, yc + y, 1, 1)
        _ctx.fillRect(xc + y, yc + r, 1, 1)
    }
}

// Draws a filled circle
function fillCircle(xc, yc, r) {
	if (arguments.length < 3) { _error("'fillCircle' not given enough arguments!") }
    xc = Math.round(xc)
    yc = Math.round(yc)
    r = r << 0
    _ctx.fillStyle = `rgb(${_fill[0]},${_fill[1]},${_fill[2]})`
    _ctx.globalAlpha = _fill[3] / 255.0
    var x = r, y = 0, cd = 0
    _ctx.fillRect(xc - x, yc, r<<1, 1)
    while (x > y) {
        cd -= (--x) - (++y)
        if (cd < 0) cd += x++
        _ctx.fillRect(xc - y, yc - x, y<<1, 1)
        _ctx.fillRect(xc - x, yc - y, x<<1, 1)
        _ctx.fillRect(xc - x, yc + y, x<<1, 1)
        _ctx.fillRect(xc - y, yc + x, y<<1, 1)
    }
}

// Draws a sprite to the screen
function sprite(spr, x, y, s=1) {
	if (arguments.length < 3) { _error("'sprite' not given enough arguments!") }
    x = Math.round(x)
    y = Math.round(y)
    if (s == 1) {
        _ctx.drawImage(spr.canvas, x, y)
    } else {
        _ctx.drawImage(spr.canvas, x, y, spr.width * s, spr.height * s)
    }
}

/// SPRITES

class Sprite {
    // Declares the sprite
    constructor(w, h) {
        this.width = w
        this.height = h
        this.imageData = new ImageData(w, h)

        // Chrome
        //this.canvas = new OffscreenCanvas(this.width, this.height)

        // Safari
        this.canvas = document.createElement('canvas')
        this.canvas.width  = this.width
        this.canvas.height = this.height

        this.ctx = this.canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false

        this.color = "rgb(0,0,0)"
    }

    // Puts imageData into the sprite
    compile() {
        this.ctx.putImageData(this.imageData, 0, 0)
    }
    
    // Sets all the colors in the sprite to a specified color, ignoring alpha
    setAllColor(col) {
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height)
        let _imageDataLen = this.imageData.data.length
        for (let a = 0; a < _imageDataLen; a += 4) {
            this.imageData.data[a    ] = col[0]
            this.imageData.data[a + 1] = col[1]
            this.imageData.data[a + 2] = col[2]
        }
        this.compile()
        this.color = `rgb(${col[0]},${col[1]},${col[2]})`
    }

    // Returns a new sprite of a seciton of the old one
    get(x, y, w, h) {
        // untested
    }
}

/// FONT
let _fontData =  "5]W_<CUN^G^D\\OOMZ79ONMDG_MUM]O_DVQ\\D\\/Z2MOMZM_J5O2YG]X20R8[XO(:PGXY(_X_(*1B42\"Y\"*4B1:3R6O]5 JH' 70XX22M 2 >8SP 0 2[S00021 /@IE]V*QB< '"
  , _fontMapping="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789()!?/\\[]#^*-+=|\"'<>.,&:;`~%@{}_"
  , _gl = a => {
    let s  = new Sprite(3, 4)
      , _s = e =>(_fontData.charCodeAt(e)-32).toString(2).padStart(6,"0")
    let bin = _s(a * 2) + _s(a * 2 + 1)
    for (let b in bin) {
        if (bin[b] == '1') {
            s.imageData.data[b * 4 + 3] = 255
        }
    }
    s.compile()
    return s
}
let _font = [...Array(67).keys()].map(e => _gl(e))
  , _unknownLetterIdx = _fontMapping.indexOf('?')

// Draws text to the screen
function text(t, x, y) {
	if (arguments.length < 3) { _error("'text' not given enough arguments!") }
    t += ''
    _ctx.globalAlpha = _fill[3] / 255.0
    t = t.replace(/\n/g, "\\n").toUpperCase()
    let _compiledFill = `rgb(${_fill[0]},${_fill[1]},${_fill[2]})`
    for (let a in t) {
        if (t[a] == ' ') continue
        let _idx = _fontMapping.indexOf(t[a])
        if (_idx == -1) { _idx = _unknownLetterIdx }
        if (_font[_idx].color != _compiledFill) {
            _font[_idx].setAllColor(_fill)
        }
        sprite(_font[_idx], x + a * 4, y)
    }
}

/// TOUCH

class Touch {
    constructor(x, y, id) {
        this.x = x
        this.y = y
        this.lx = x
        this.ly = y
        this.id = id
        this._frameMoved = false
    }
    toString() { return `[X: ${Math.round(this.x)}, Y: ${Math.round(this.y)}]` }
}

// Sets touchDown
_canvas.ontouchstart = function(e) {
    e.preventDefault()
    /*// e.touches.length
    if (e.type == "touchstart") {
        
    } else {
        
    }*/
    if (e.type == "touchstart") {
        for (let a = 0; a < e.changedTouches.length; a++) {
            touch.push(new Touch(e.changedTouches[a].clientX / _pixelSize - 0.5, e.changedTouches[a].clientY / _pixelSize - 0.5, e.changedTouches[a].identifier))
        }
    } else {
        for (let a = 0; a < e.changedTouches.length; a++) {
            touch = touch.filter(b => b.id != e.changedTouches[a].identifier)
        }
    }
    //document.getElementsByTagName("h1")[0].innerText =
}
_canvas.ontouchend = _canvas.ontouchstart

_canvas.ontouchmove = function(e) {
    e.preventDefault()
    for (let a = 0; a < e.changedTouches.length; a++) {
        for (let b = 0; b < touch.length; b++) {
            if (touch[b].id == e.changedTouches[a].identifier && !touch[b]._frameMoved) {
                touch[b].lx = touch[b].x
                touch[b].ly = touch[b].y
                touch[b].x = e.changedTouches[a].clientX / _pixelSize - 0.5
                touch[b].y = e.changedTouches[a].clientY / _pixelSize - 0.5
                touch[b]._frameMoved = true
                // break (untested)
            }
        }
    }
}

/// MOUSE EMULATION

// Sets touch.down
_canvas.onmousedown = function(e) {
    e.preventDefault()
    if (e.type == "mousedown") {
        touch.push(new Touch(e.clientX / _pixelSize - 0.5, e.clientY / _pixelSize - 0.5, -1))
    } else {
        touch = []
    }
}
_canvas.onmouseup = _canvas.onmousedown

_canvas.onmousemove = function(e) {
    e.preventDefault()
    if (touch.length == 1) {
        if (touch[0]._frameMoved) {
            touch[0].x = e.clientX / _pixelSize - 0.5
            touch[0].y = e.clientY / _pixelSize - 0.5
            return
        }
        touch[0].lx = touch[0].x
        touch[0].ly = touch[0].y
        touch[0].x = e.clientX / _pixelSize - 0.5
        touch[0].y = e.clientY / _pixelSize - 0.5
        touch[0]._frameMoved = true
    }
}

/// CONTROL

let _buttons = []

// Adds a button with a callback
function addButton(x, y, w, h, c) {
	if (arguments.length < 5) { _error("'addButton' not given enough arguments!") }
    for (let a = 0; a < _buttons.length; a++) {
        if (_buttons[a] == null) {
            _buttons[a] = [x, y, w, h, c, false]
            return a
        }
    }
    _buttons.push([x, y, w, h, c, false])
    return _buttons.length - 1
}

function removeButton(id) {
    _buttons[id] = null
}

// Checks all the buttons every frame
function _checkButtons() {
    for (let b = 0; b < _buttons.length; b++) {
        if (_buttons[b] == null) continue
        let dsp = false
        for (let a = 0; a < touch.length; a++) {
            if (touch[a].x >= _buttons[b][0] && touch[a].x <= (_buttons[b][0] + _buttons[b][2]) 
             && touch[a].y >= _buttons[b][1] && touch[a].y <= (_buttons[b][1] + _buttons[b][3])) {
                dsp = true
                if (_buttons[b][5]) continue
                _buttons[b][5] = true
            } else if (_buttons[b][5]) {
                _buttons[b][5] = false
            }
        }
        if ((!dsp) && _buttons[b][5]) {
            _buttons[b][5] = false
            _buttons[b][4](0, b)
        }
    }
}

/// OS INTERFACE FUNCTIONS

let _keyboardKeys = [[
    "-+*/;(){}\"",
    "qwertyuiop",
    "asdfghjkl ",
    "zxcvbnm   ",
    "       \n\n\n"
], [
    "-+*/;(){}\"",
    "1234567890",
    "[]&:#%^*+= ",
    ".,?!'<>   ",
    "       \n\n\n"
]]
let _kbExtraButtons = [
    [0, 3, 1.5, "SHFT"],
    [8.5, 3, 1.5, "BACK"],
    [2, 4, 5, " "],
    [0, 4, 2, "MODE"]
]
let _keyboardMode = 0

let kbButtons = []
let kbJustPressed = []
let _kbHardwarePressed = []
let _kbHardwareUnpressed = []

function _drawKeyboard() {
	if (haskeyboard()) {
		kbJustPressed = _kbHardwarePressed
		kbButtons.push(...kbJustPressed)
		kbButtons = kbButtons.filter(e => !_kbHardwareUnpressed.includes(e))
		_kbHardwarePressed = []
		_kbHardwareUnpressed = []
		//console.log(kbButtons)
		return false
	}
    let allPressed = []
    let kh = 120
    let bh = kh / 5
    let bw = width / 10
    
    fill(0)
    fillRect(0, height - kh, width, kh)
    stroke(255)
    fill(255)
    
    for (let a = (_keyboardMode == 2 ? 4 : 0); a < 5; a++) {
        rect(0, a * bh + (height - kh) - 1, width - 1, 0)
        let ck = _keyboardKeys[_keyboardMode][a]
        let xo = 0
        if (a == 2) xo = 0.5
        else if (a == 3) xo = 1.5
        for (let b = 0; b < ck.length; b++) {
            let cx = (b + xo) * (width / ck.length)
            let cy = a * bh + (height - kh)
            let dds = ck[b] != ' '
            if (ck[b] != ck[b - 1]) {
                rect(cx, cy, 0, bh - 1)
                if (dds) text(ck[b], cx + (width / ck.length) * 0.5 - 1, cy + kh / 10 - 2)
            }
            if (dds) {
		        for (let t = 0; t < touch.length; t++) {
		            if (touch[t].y >= cy && touch[t].y <= cy + bh
		             && touch[t].x >= cx && touch[t].x <= cx + (width / ck.length)) {
		     	        allPressed.push(ck[b])
		     	        break
		            }
		        }
	        }
            if (ck[b] != ck[b + 1]) {
                rect((b + xo + 1) * (width / ck.length), a * bh + (height - kh), 0, bh - 1)
            }
        }
    }
    rect(2 * bw, 4 * bh + height - kh, 0, bh)
    fill(255, 0, 0, 100)
    for (let b = 0; b < _kbExtraButtons.length; b++) {
        let cb = _kbExtraButtons[b]
        for (let t = 0; t < touch.length; t++) {
            if (touch[t].y >= cb[1] * bh + (height - kh) && touch[t].y <= (cb[1] + 1) * bh + (height - kh)
		     && touch[t].x >= cb[0] * bw && touch[t].x <= (cb[0] + cb[2]) * bw) {
		     	allPressed.push(cb[3])
		     	break
		    }
        }
    }
    
    kbJustPressed = allPressed.filter(e => !kbButtons.includes(e))
    kbButtons = allPressed
    
    return true
}

/// HARDWARE KEYBOARD

let _keyMap = {
	"Enter":      "\n",
	"Backspace":  "BACK",
	"ArrowLeft":  "ALFT",
	"ArrowRight": "ARGH",
	"ArrowUp":    "ARUP",
	"ArrowDown":  "ADWN",
	"Tab":        "TABB",
	"Control":    "CTRL",
	"Escape":     "ESCP"
}

document.onkeydown = function __onkeydown(e) {
	console.log(e.key)
	_kbHardwarePressed.push(__mapKey(e.key))
	e.preventDefault()
}

document.onkeyup = function __onkeyup(e) {
	_kbHardwareUnpressed.push(__mapKey(e.key))
	e.preventDefault()
}

function __mapKey(k) {
	if (k in _keyMap) {
		return _keyMap[k]
	}
	return k.toLowerCase()
}


// Document functions
document.addEventListener('contextmenu', e => e.preventDefault())
_canvas.addEventListener('touchmove'  , e => e.preventDefault())

// Main loop
function _runScript(c, name) {
    _currentUnloadFunction()
    _currentCodeName = name
    if (_drawInterval != null) {
        clearInterval(_drawInterval)
    }

    setTimeout(function __outerTimeout() {
        let _fns = eval(c + "\nlet __r__=[()=>{},()=>{},()=>{},()=>{}];if(typeof setup!='undefined'){__r__[0]=setup}if(typeof draw!='undefined'){__r__[1]=draw}if(typeof beforeUnload!='undefined'){__r__[2]=beforeUnload}if(typeof _editMode!='undefined'){__r__[3]=_editMode}__r__")
        
        _buttons = []
        _touch = []
        kbJustPressed = []
        kbButtons = []
        _kbHardwarePressed = []
        _kbHardwareUnpressed = []
        frameCount = 0
        _currentUnloadFunction = _fns[2]

        _canvas.width = window.innerWidth / _pixelSize
        _canvas.height = window.innerHeight / _pixelSize
        width = _canvas.width
        height = _canvas.height

        _fns[0]()

        window.onresize = function __onresize() {
            _canvas.width = window.innerWidth / _pixelSize
            _canvas.height = window.innerHeight / _pixelSize
            width = _canvas.width
            height = _canvas.height
            _fns[1]()
        }
        window.onorientationchange = window.onresize

        _drawInterval = setInterval(function __outerLoop(){
            _checkButtons()
            _fns[1]()
            fill(255)
            for (let a = 0; a < touch.length; a++) {
                touch[a]._frameMoved = false
                if (touch[a].lx >= width - _homeWidth && touch[a].x < width - _homeWidth) {
                    if (_currentCodeName == "") {
                        _fns[3]()
                    } else {
                        _startos()
                    }
                }
            }
            if (kbJustPressed.includes("ESCP")) {
            	if (_currentCodeName == "") {
                    _fns[3]()
                } else {
                    _startos()
                }
            }
            frameCount++
        }, 1000. / 45)
    }, 1000. / 45)
}

function haskeyboard() {
  return !([
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document))
}

let _pixelSize = 2
if (!haskeyboard()) {
	_pixelSize = 1
}

window.onbeforeunload = function __beforeUnload(event) {
    _currentUnloadFunction()
}

window.onerror = function __errorHandler(errorMsg, url, lineNo, columnNo, error) {
    _error("", error)
    return true
}

function _startos() {
	if (_drawInterval != null) {
        clearInterval(_drawInterval)
    }
    fetch("os.js").then(r => r.text().then(function(c){_runScript(c, "")}))
}
_startos()

/// ASK FOR INPUT

/*function _runCode() {
    frameCount = 0
    if (document.getElementsByTagName("textarea")[0].value.length < 10) {
        __removeGUI()
        return;
    }
    try {
        window.eval(document.getElementsByTagName("textarea")[0].value)
    } catch (e) {
        _error(e.stack.split("\n")[0], e)
    }
    if (typeof window.setup != 'undefined') {
        setup()
        frameCount = 0
    }
    __removeGUI()
}

function __removeGUI() {
    let txt = document.getElementsByTagName("textarea")[0]
    let but = document.getElementsByTagName("input")[0]
    txt.parentElement.removeChild(txt)
    but.parentElement.removeChild(but)
}

//__removeGUI()*/
