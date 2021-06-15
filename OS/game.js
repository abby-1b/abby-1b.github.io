
let keys = [
    "qwertyuiop",
    "asdfghjkl ",
    "zxcvbnm   ",
    "##     ###"
]

let tiles = [
    {x:0,y:0,w:1,h:1},
    {x:1,y:0,w:2,h:2}
]

let lp = -1

let stx = -1
let sty = -1
let stw =  0
let sth =  0

function draw() {
    fill(0)
    background()
    
    if (touch.length == 5) { window.location.reload() }

    stroke(255)
    let w3 = Math.floor(width / 3)

    console.log(tiles.length)
    for (let a = 0; a < tiles.length; a++) {
        rect(tiles[a].x * w3 + 1, tiles[a].y * w3 + 1, tiles[a].w * w3 - 3, tiles[a].h * w3 - 3)
    }

    fill(255, 0, 0, 100)
    for (let t = 0; t < touch.length; t++) {
        fillRect(Math.floor(touch[t].x / w3) * w3, Math.floor(touch[t].y / w3) * w3, w3, w3)
    }

    if (touch.length != 0) {
        let tx = Math.floor(touch[0].x / w3)
        let ty = Math.floor(touch[0].y / w3)
        if (lp == -1) {
            lp = tiles.length
            tiles[lp] = {x: tx, y: ty, w: 1, h: 1}
        }
        if (tx < tiles[lp].x) {
            tiles[lp].x = tx
        } else if (ty < tiles[lp].y) {
            tiles[lp].y = ty
        } else {
            tiles[lp].w = (tx - tiles[lp].x) + 1
            tiles[lp].h = (ty - tiles[lp].y) + 1
        }
    } else if (lp != -1) {
        lp = -1
    }

    stroke(255)
    fill(255)
    for (let a = 0; a < touch.length; a++) {
        if ((touch[a].x - touch[a].lx) ** 2 + (touch[a].y - touch[a].ly) ** 2 > 26) {
            let n = Math.atan2(touch[a].ly - touch[a].y, touch[a].lx - touch[a].x) + Math.PI
            let ex = touch[a].x + Math.cos(n) * 4
            let ey = touch[a].y + Math.sin(n) * 4
            n -= Math.PI / 2
            line(touch[a].lx, touch[a].ly, touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4)
            line(touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4, ex, ey)
            n += Math.PI
            line(touch[a].lx, touch[a].ly, touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4)
            line(touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4, ex, ey)
        } else {
            circle(touch[a].x, touch[a].y, 4)
        }
    }
}
  
function keyboard() {
    let kh = 120
    for (let a = 0; a < 4; a++) {
        rect(0, a * (kh / 4) + (height - kh), width - 1, 0)
        let ck = keys[a]
        let xo = 0
        if (a == 1) xo = 0.5
        else if (a == 2) xo = 1.5
        for (let b = 0; b < ck.length; b++) {
            if (ck[b] != ck[b - 1]) {
                rect((b + xo) * (width / ck.length), a * (kh / 4) + (height - kh), 0, kh / 4)
                text(ck[b], (b + xo) * (width / ck.length) + (width / ck.length) * 0.5 - 1, a * (kh / 4) + (height - kh) + kh / 8 - 2)
            }
            if (ck[b] != ck[b + 1]) rect((b + xo + 1) * (width / ck.length), a * (kh / 4) + (height - kh), 0, kh / 4)
        }
    }
}
