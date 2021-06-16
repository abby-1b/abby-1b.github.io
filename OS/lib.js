
let pixelSize = 2

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

/// ERRORS

function _error(t, err) {
    if (err == undefined) {
        err = (function(){try { throw Error('') } catch(err) { return err; }})()
    }
    console.error(t)
    document.write("<style>*{font-family:monospace;color:white;background-color:#100;}</style>")
    document.write(t + "<br>")
    document.write("Line: ", err.stack.split("\n").filter(e => e.includes("eval at _runCode"))[0].split(":").slice(-2).join(" : ").replace(")", ""))
    //document.write("<br>&nbsp;&nbsp;" + err.stack.split("\n").slice(1).join("<br>&nbsp;&nbsp;"))
    clearInterval(_drawInterval)
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
    if (x0 == undefined || y0 == undefined || x1 == undefined || y1 == undefined) { _error("'line' not given enough arguments!"); return; }
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
    _ctx.fillStyle = `rgb(${_stroke[0]},${_stroke[1]},${_stroke[2]})`
    _ctx.globalAlpha = _stroke[3] / 255.0
    _ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
}

// Draws the outline of a rectangle
function rect(x, y, w, h) {
    _ctx.strokeStyle = `rgb(${_stroke[0]},${_stroke[1]},${_stroke[2]})`
    _ctx.beginPath()
    _ctx.globalAlpha = _stroke[3] / 255.0
    _ctx.rect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h))
    _ctx.stroke()
}

// Draws a filled rectangle, without an outline
function fillRect(x, y, w, h) {
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

let _fontData="5]W_<CUN^G^D\\OOMZ79ONMDG_MUM]O_DVQ\\D\\/Z2MOMZM_J5O2YG]X20R8[XO(:PGXY(_X_(*1B42\"Y\"*4B1:3R6O]5 JH' 70XX22M 2 >8SP 0 2[S00021 /@IE]V"
  , _fontMapping="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789()!?/\\[]#^*-+=|\"'<>.,&:;`~%@"
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
let _font = [...Array(64).keys()].map(e => _gl(e))

function text(t, x, y) {
    t += ''
    t = t.replace(/\n/g, "\\n").toUpperCase()
    let _compiledFill = `rgb(${_fill[0]},${_fill[1]},${_fill[2]})`
    for (let a in t) {
        if (t[a] == ' ') continue
        let _idx = _fontMapping.indexOf(t[a])
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
            touch.push(new Touch(e.changedTouches[a].clientX / pixelSize - 0.5, e.changedTouches[a].clientY / pixelSize - 0.5, e.changedTouches[a].identifier))
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
                touch[b].x = e.changedTouches[a].clientX / pixelSize - 0.5
                touch[b].y = e.changedTouches[a].clientY / pixelSize - 0.5
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
        touch.push(new Touch(e.clientX / pixelSize - 0.5, e.clientY / pixelSize - 0.5, -1))
    } else {
        touch = []
    }
}
_canvas.onmouseup = _canvas.onmousedown

_canvas.onmousemove = function(e) {
    e.preventDefault()
    if (touch.length == 1) {
        if (touch[0]._frameMoved) {
            touch[0].x = e.clientX / pixelSize - 0.5
            touch[0].y = e.clientY / pixelSize - 0.5
            return
        }
        touch[0].lx = touch[0].x
        touch[0].ly = touch[0].y
        touch[0].x = e.clientX / pixelSize - 0.5
        touch[0].y = e.clientY / pixelSize - 0.5
        touch[0]._frameMoved = true
    }
}

/// CONTROL

let _buttons = []

// Adds a button with a callback
function addButton(x, y, w, h, c) {
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
    "qwertyuiop",
    "asdfghjkl ",
    "zxcvbnm   ",
    "##     \n\n\n"
], [
    "1234567890",
    "-/:;()$&@\"",
    ".,?!'     ",
    "##     \n\n\n"
]]
let _keyboardMode = 1

let kbButtons = []
let kbJustPressed = []

function _drawKeyboard() {
    let allPressed = []
    let kh = 120
    for (let a = 0; a < 4; a++) {
        rect(0, a * (kh / 4) + (height - kh), width - 1, 0)
        let ck = _keyboardKeys[_keyboardMode][a]
        let xo = 0
        if (a == 1) xo = 0.5
        else if (a == 2) xo = 1.5
        for (let b = 0; b < ck.length; b++) {
            let cx = (b + xo) * (width / ck.length)
            let cy = a * (kh / 4) + (height - kh)
            let dds = ck[b] != ' '
            if (ck[b] != ck[b - 1]) {
                rect(cx, cy, 0, kh / 4)
                if (dds) text(ck[b], cx + (width / ck.length) * 0.5 - 1, cy + kh / 8 - 2)
            }
            if (dds) {
		for (let t = 0; t < touch.length; t++) {
		    if (touch[t].x >= cx && touch[t].x <= cx + (width / ck.length)
		     && touch[t].y >= cy && touch[t].y <= cy + (kh / 4)) {
		     	allPressed.push(ck[b])
		     	break;
		    }
		}
	    }
            
            if (ck[b] != ck[b + 1]) rect((b + xo + 1) * (width / ck.length), a * (kh / 4) + (height - kh), 0, kh / 4)
        }
    }
    kbJustPressed = allPressed.filter(e => !kbButtons.includes(e))
    kbButtons = allPressed
}

// Document functions
document.addEventListener('contextmenu', e => e.preventDefault())
_canvas.addEventListener('touchmove'  , e => e.preventDefault())

// Main loop
function _runScript(c) {
    _currentUnloadFunction()
    if (_drawInterval != null) {
        clearInterval(_drawInterval)
    }

    setTimeout(function(){
        let _fns = eval(c + "\nlet __r__=[()=>{},()=>{},()=>{}];if(typeof setup!='undefined'){__r__[0]=setup}if(typeof draw!='undefined'){__r__[1]=draw}if(typeof beforeUnload!='undefined'){__r__[2]=beforeUnload}__r__")
        
        _buttons = []
        _touch = []
        frameCount = 0
        _currentUnloadFunction = _fns[2]

        _canvas.width = window.innerWidth / pixelSize
        _canvas.height = window.innerHeight / pixelSize
        width = _canvas.width
        height = _canvas.height

        //if (typeof window.setup != 'undefined') {
            _fns[0]()
        //}

        window.onresize = function() {
            _canvas.width = window.innerWidth / pixelSize
            _canvas.height = window.innerHeight / pixelSize
            width = _canvas.width
            height = _canvas.height
            _fns[1]()
        }
        window.onorientationchange = window.onresize

        _drawInterval = setInterval(function(){
            _checkButtons()
            _fns[1]()
            for (let a = 0; a < touch.length; a++) { touch[a]._frameMoved = false }
            frameCount++
        }, 1000. / 45)
    }, 1000. / 45)
}

window.onbeforeunload = function(event) {
    _currentUnloadFunction()
}

function _startOS() {
    fetch("os.js").then(r => r.text().then(_runScript))
}
_startOS()


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
