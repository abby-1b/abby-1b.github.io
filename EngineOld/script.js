
Console.prepareEnv()
let con = new Console(window.innerWidth, window.innerHeight, 3)

let ctBg = con.addSprite(Sprite(con, "Tiles/Sky.png", con.width / 2 - 2, con.height / 2 - 2, con.width + 4, con.height + 4, true))
ctBg.imageCentered = true
ctBg.hasAnimation = true
ctBg.animationStart = 0
ctBg.animationFrames = 1
ctBg.animationTimer = 0

let plant = con.addSprite(Sprite(con, "Sprites/Plant.png", 1580, 506, 8, 8, false))
plant.hasAnimation = true
plant.animationTimer = 10
plant.animationFrames = 41

// Player
let player = con.addSprite(Sprite(con, "Sprites/Player.png", con.width / 2, con.height / 2, 16, 16, true))
player.speed = new Vec2(0, 0)
// player.xp += 1300
// player.yp += 100
player.hasAnimation = true
player.animationFrames = 6
player.animationTimer = 6
player.canMove = true
player.hbOffsets({top: 3, bottom: 0, left: 6, right: 6})
player.lowerBar = con.addSprite(Sprite(con, "Sprites/LowerBar.png", 0, 0, 4, 1, true))
player.crouchBar = con.addSprite(Sprite(con, "Sprites/LowerBar.png", 0, 0, 2, 5, true))
player.dialogBar = con.addSprite(Sprite(con, "Sprites/LowerBar.png", 0, 0, 0, 0, true))
player.isCrouched = false

player.collidedWith = function(el, d) {
    // console.log(el.curAnimationTimer)
    if (el.sourceUrl == "Tiles/Bounce.png" && d == "top") {
        player.speed.y = -19

        player.isCrouched = false
        player.animationFrame = 0
        player.animationFrames = 3
        player.animationTimer = 10
        player.animationStart = 12
        player.loopAnimation = false
        player.curAnimationTimer = player.animationTimer
        player.onGround = false
    } else if (el.sourceUrl == "Sprites/Trash.png" && d == "top" && (el.curAnimationTimer == 0 || el.curAnimationTimer == 120)) {
        el.hasAnimation = true
        el.animationStart = -1
        el.animationFrame = 0
        el.animationFrames = 2
        el.loopAnimation = false
        el.animationTimer = 120
        el.curAnimationTimer = 120
        player.speed.y -= 11
        player.yp -= 5
        
        player.isCrouched = false
        player.animationFrame = 0
        player.animationFrames = 3
        player.animationTimer = 10
        player.animationStart = 12
        player.loopAnimation = false
        player.curAnimationTimer = player.animationTimer
        player.onGround = false
    }
}

// Triggers
let ts = [
    [1e+10, ""],
    [1283 + 50, "M3 interested."],
    [1283, "Trash not in web."],
    [1183 + 50, "Trash not in archive."],
    [1183, "Trash not in memory."],
    [655, "Trash found. Compressing..."],
    [287, "M3 should jump. [space]"]
]

// Objects
let obs = []

con.init(() => {
    // Dialog
    player.dialogBar.innerText = ""

    Console.getImagePixels("Tiles/Map1.png", (px, w, h) => {
        let m = {
            PLAYER: ["player", 78, 205, 196],
            BRICK: ["Tiles/SmallBrick.png", 168, 168, 168],
            BOUNCE: ["Tiles/Bounce.png", 31, 255, 40],
            TRASH: ["trash", 255, 230, 109]
        }
        function getType(p1, p2, p3) {
            for (let t in m) {
                if (m[t][1] == p1 && m[t][2] == p2 && m[t][3] == p3) {
                    return t
                }
            }
            return false
        }
        let bars = []
        let did = []
        for (let p = 0; p < px.length; p += 4) {
            if (did.includes(p)) continue
            did.push(p)
            let x = ((p / 4) % w) - 8
            let y = (Math.floor((p / 4) / w)) - 8
            if (px[p + 3] == 0) {
                // Air!
            } else {
                let tp = getType(px[p], px[p + 1], px[p + 2])
                let ch = 1
                while (getType(px[p + w * ch * 4], px[p + 1 + w * ch * 4], px[p + 2 + w * ch * 4]) == tp)
                    did.push(p + w * (ch++) * 4)
                bars.push([x, y, 1, ch, tp])
            }
        }
        for (let b = 0; b < bars.length; b++) {
            for (let a = 0; a < bars.length; a++) {
                if (a == b) continue
                if (bars[a][4] == bars[b][4] && bars[a][1] == bars[b][1] && bars[a][3] == bars[b][3] && bars[a][0] - 1 == (bars[b][0] + bars[b][2] - 1)) {
                    bars.splice(a, 1)
                    if (a < b) { b-- }
                    a--
                    bars[b][2] ++
                }
            }
        }
        let ox = 0
        let oy = 0
        for (let b = 0; b < bars.length; b++) {
            if (m[bars[b][4]][0] == "player") {
                ox = bars[b][0]
                oy = bars[b][1]
                break
            }
        }
        for (let b = 0; b < bars.length; b++) {
            let ss = 8
            if (m[bars[b][4]][0] == "player")
                continue
            if (m[bars[b][4]][0] == "trash") {
                obs.push(con.addSprite(Sprite(con, "Sprites/Trash.png", con.width / 2 + ss * (bars[b][0] - ox), con.height / 2 + ss * (bars[b][1] - oy), 16, 16)))
                continue
            }
            let s = con.addTile(Sprite(con, m[bars[b][4]][0], con.width / 2 + ss * (bars[b][0] - ox), con.height / 2 + ss * (bars[b][1] - oy), ss * bars[b][2], ss * bars[b][3], false))
            // s.style.border = "1px solid red"
            // s.style.opacity = "0.25"
        }
        con.loop(gameLoop)
    })
})

let tos = [] // Timeouts
function doDialog(txt) {
    player.canMove = false
    let dMap = {
        'a': '4', 'b': '8',
        'c': '2', 'd': '9',
        'e': '3', 'h': '6',
        'l': '1', 'q': '4',
        's': '5', 't': '7',
        'p': '9', 'i': '1',
        '!': '1', '.': ',',
        ',': '.', ':': ';',
        ';': ':', '[': '{',
        ']': '}'
    }
    let tms = 0
    for (let a = 0; Math.floor(a) < txt.length; a += Math.random() * 2 + 3) {
        if (txt[Math.floor(a)].toLowerCase() in dMap)
            txt = txt.slice(0, Math.floor(a)) + dMap[txt[Math.floor(a)].toLowerCase()] + "*" + txt.slice(Math.floor(a))
    }
    for (let a = 0; a < txt.length; a++) {
        if (txt[a] == "*") {
            tos.push(setTimeout(eval(`()=>{player.dialogBar.innerHTML=player.dialogBar.innerText.slice(0,player.dialogBar.innerText.length-1);player.dialogBar.innerHTML += '${(txt[++a] == ' ' ? '&nbsp' : txt[a])}'}`), tms += (Math.random() * 80 + 20)))
        } else {
            tos.push(setTimeout(eval(`()=>{player.dialogBar.innerHTML += \`${(txt[a] == ' ' ? '&nbsp' : (txt[a] == '\n' ? "<br>" : txt[a]))}\`}`), tms += (Math.random() * 40 + 20)))
        }
    }
}

function clearDialog() {
    player.dialogBar.innerHTML = ""
    for (let a = 0; a < tos.length; a++) {
        clearTimeout(tos[a])
    }
    tos = []
}

let frameCount = 0
let gameLoop = () => {
    // console.log(obs[0].curAnimationTimer)

    if (player.canMove && (player.xp - con.width / 2) < -50) {
        player.speed.x = 10
        doDialog("M3 shouldn't go back. [space]")
    }
    if ((player.xp - con.width / 2) > ts[ts.length - 1][0]) {
        player.speed.x *= 0.8
        doDialog(ts.pop()[1])
        if (ts.length == 1) {
            setTimeout(function(){
                con.el.style.filter = "brightness(0)"
            }, 3000)
        }
    }
    if (ts.length > 1 && (!player.canMove) && ' ' in con.keys) {
        player.canMove = true
        clearDialog()
    }

    con.camPos.x = Console.lerp(con.camPos.x, (-player.xp + con.width / 2) - player.speed.x * 4, 0.1)
    con.camPos.y = Console.lerp(con.camPos.y, -player.yp + con.height / 2, 0.1)
    ctBg.xp = -con.camPos.x + con.width / 2
    ctBg.yp = -con.camPos.y + con.height / 2
    ctBg.animationStart = (-con.camPos.x / 1000) + player.xp / 10000

    player.lowerOnGround = false
    for (let a = 0; a < 2; a++) {
        con.doPhysicsSprite(player)
        for (let o = 0; o < obs.length; o++) {
            player.doPhysics(obs[o])
        }
        player.xp += player.speed.x * (0.3 / 2)
        player.yp += player.speed.y * (0.3 / 2)
        player.lowerBar.xp = player.xp
        player.lowerBar.yp = player.yp + 8
        player.crouchBar.xp = player.xp
        player.crouchBar.yp = player.yp - 2
    }
    player.dialogBar.xp = player.xp
    // console.log(("." + player.dialogBar.innerHTML + '.').split(/<br>/g).filter(e => e != '').length)
    player.dialogBar.yp = (player.yp - 18) // - (("." + player.dialogBar.innerHTML + '.').split(/<br>/g).filter(e => e != '').length) * 16
    if (player.onGround && !player.lowerOnGround) player.onGround = false
    if (player.canMove)
        player.speed.add(new Vec2(
            ('d' in con.keys ? 1 : 0) - ('a' in con.keys ? 1 : 0), 0).normalized())
    if ('s' in con.keys && player.onGround) {
        if (player.animationStart != 17) {
            player.animationStart = 17
            player.curAnimationTimer = 4
            player.animationFrame = 0
            player.animationFrames = 2
            player.animationTimer = 4
            player.loopAnimation = false
        }
        player.isCrouched = true
        player.hbOffsets({top: 10, bottom: 0, left: 5, right: 5})
        player.speed.x *= 0.7
    } else {
        if (player.canUnCrouch) {
            player.hbOffsets({top: 3, bottom: 0, left: 6, right: 6})
            player.isCrouched = false
        }
        if (!player.canUnCrouch) player.speed.x *= 0.7
        else player.speed.x *= 0.87
    }
    if (ts.length > 1 && ' ' in con.keys) {
        if (player.onGround && player.canUnCrouch) {
            player.isCrouched = false
            player.animationFrame = 0
            player.animationFrames = 3
            player.animationTimer = 5
            player.animationStart = 12
            player.loopAnimation = false
            player.curAnimationTimer = player.animationTimer
            player.speed.y -= 9
            player.onGround = false
        }
    }
    if (!player.onGround)
        player.speed.y += 0.6
    if (player.canUnCrouch && player.onGround && (!(' ' in con.keys)) && (!('s' in con.keys))) {
        player.loopAnimation = true
        player.animationFrames = 6
        if (Math.abs(player.speed.x) > 1) {
            player.animationStart = 6
            player.animationTimer = 3
        } else {
            player.animationStart = 0
            player.animationTimer = 6
        }
    }
    if ((!player.loopAnimation) && player.animationStart == 12 && player.speed.y > 0) {
        player.animationStart = 15
        player.animationFrame = 0
        player.animationFrames = 2
        player.animationTimes = 5
        player.curAnimationTimer = player.animationTimer
    }
    if (player.speed.x != 0) player.flipped = player.speed.x < 0
    player.canUnCrouch = true
    frameCount++
}
