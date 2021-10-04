
let con = new Console(300, 200, "#ebe3c5")

// Controls
con.nEvent("jump", () => {
    player.speed.y = -1
})
con.onKeyPressed(' ', "jump")

// Background
let background = con.nBgSprite(new Sprite("Tiles/Sky.png", -16, -16, con.width + 32, 512, 1, true))

let plant = con.nSprite(new PhysicsActor("Sprites/Plant.png", 0, 0, 8, 8, false))
plant.addAnimation("default", {
    start: 0,
    end: 40,
    timer: 8,
    loop: true,
    pause: -1
}, true)

// Player
let player = con.nObj(new PhysicsActor("Sprites/Player.png", 0, 0, 16, 16, false))
player.addAnimation("idle", {
    start: 0,
    end: 5,
    timer: 6,
    loop: true,
    pause: -1
}, true)
player.showHitbox = true
player.isCrouched = false
player.hbOffsets({top: 3, bottom: 0, left: 5, right: 6})
player.pos.x += 5

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

// // Triggers
// let ts = [
//     [1e+10, ""],
//     [1283 + 50, "M3 interested."],
//     [1283, "Trash not in web."],
//     [1183 + 50, "Trash not in archive."],
//     [1183, "Trash not in memory."],
//     [655, "Trash found. Compressing..."],
//     [287, "M3 should jump. [space]"]
// ]

con.init(() => {
    CTool.tileMapFrom("Tiles/Map1.png", {
        PLAYER: ["player", 78, 205, 196],
        BRICK: ["Tiles/SmallBrick.png", 168, 168, 168],
        BOUNCE: ["Tiles/Bounce.png", 31, 255, 40],
        TRASH: ["trash", 255, 230, 109]
    }, (bars) => {
        let offs = CTool.findTilePos(bars, "player")
        for (let b = 0; b < bars.length; b++) {
            const ss = 8
            if (bars[b].type == "player") continue
            if (bars[b].type == "trash") {
                con.nObj(new Sprite("Sprites/Trash.png", ss * (bars[b].x - offs.x), ss * (bars[b].y - offs.y), ss * 2, ss * 2))
                continue
            }
            let s = con.nTile(new Sprite(bars[b].type, ss * (bars[b].x - offs.x), ss * (bars[b].y - offs.y), ss * bars[b].w, ss * bars[b].h, false))
        }
        con.loop(gameLoop)
        // con.loop(() => {})
    })
})

// let tos = [] // Timeouts
// function doDialog(txt) {
//     player.canMove = false
//     let dMap = {
//         'a': '4', 'b': '8',
//         'c': '2', 'd': '9',
//         'e': '3', 'h': '6',
//         'l': '1', 'q': '4',
//         's': '5', 't': '7',
//         'p': '9', 'i': '1',
//         '!': '1', '.': ',',
//         ',': '.', ':': ';',
//         ';': ':', '[': '{',
//         ']': '}'
//     }
//     let tms = 0
//     for (let a = 0; Math.floor(a) < txt.length; a += Math.random() * 2 + 3) {
//         if (txt[Math.floor(a)].toLowerCase() in dMap)
//             txt = txt.slice(0, Math.floor(a)) + dMap[txt[Math.floor(a)].toLowerCase()] + "*" + txt.slice(Math.floor(a))
//     }
//     for (let a = 0; a < txt.length; a++) {
//         if (txt[a] == "*") {
//             tos.push(setTimeout(eval(`()=>{player.dialogBar.innerHTML=player.dialogBar.innerText.slice(0,player.dialogBar.innerText.length-1);player.dialogBar.innerHTML += '${(txt[++a] == ' ' ? '&nbsp' : txt[a])}'}`), tms += (Math.random() * 80 + 20)))
//         } else {
//             tos.push(setTimeout(eval(`()=>{player.dialogBar.innerHTML += \`${(txt[a] == ' ' ? '&nbsp' : (txt[a] == '\n' ? "<br>" : txt[a]))}\`}`), tms += (Math.random() * 40 + 20)))
//         }
//     }
// }

// function clearDialog() {
//     player.dialogBar.innerHTML = ""
//     for (let a = 0; a < tos.length; a++) {
//         clearTimeout(tos[a])
//     }
//     tos = []
// }

let gameLoop = () => {
    // if (player.canMove && (player.xp - con.width / 2) < -50) {
    //     player.speed.x = 10
    //     doDialog("M3 shouldn't go back. [space]")
    // }
    // if ((player.xp - con.width / 2) > ts[ts.length - 1][0]) {
    //     player.speed.x *= 0.8
    //     doDialog(ts.pop()[1])
    //     if (ts.length == 1) {
    //         setTimeout(function(){
    //             con.el.style.filter = "brightness(0)"
    //         }, 3000)
    //     }
    // }
    // if (ts.length > 1 && (!player.canMove) && ' ' in con.keys) {
    //     player.canMove = true
    //     clearDialog()
    // }

    con.camPos.lerp(
        (-player.pos.x + con.width  / 2) - player.speed.x * 12 - player.w * player.s * 0.5,
        (-player.pos.y + con.height / 2) - player.speed.y * 4  - player.h * player.s * 0.5,
         0.1)
    background.pos.x = -con.camPos.x + con.width / 2
    background.pos.y = (-con.camPos.y + con.height / 2) - (player.pos.y / 40)
    background.animation[0] = (-con.camPos.x / 1000) + player.pos.x / 10000

    // player.lowerOnGround = false
    // for (let a = 0; a < 2; a++) {
    //     con.doPhysicsSprite(player)
    //     for (let o = 0; o < obs.length; o++) {
    //         player.doPhysics(obs[o])
    //     }
    //     player.xp += player.speed.x * (0.3 / 2)
    //     player.yp += player.speed.y * (0.3 / 2)
    //     player.lowerBar.xp = player.xp
    //     player.lowerBar.yp = player.yp + 8
    //     player.crouchBar.xp = player.xp
    //     player.crouchBar.yp = player.yp - 2
    // }
    // player.dialogBar.xp = player.xp
    // player.dialogBar.yp = (player.yp - 18)
    // if (player.onGround && !player.lowerOnGround) player.onGround = false
    if (!player.locked)
        player.speed.add(new Vec2(
            ('d' in con.keys ? 1 : 0) - ('a' in con.keys ? 1 : 0), 0).normalized().mulr(0.25))
    // 3.86
    // let a = player.speed.angle()
    // console.log(a)
    // if ('s' in con.keys && player.onGround) {
    //     if (player.animationStart != 17) {
    //         player.animationStart = 17
    //         player.curAnimationTimer = 4
    //         player.animationFrame = 0
    //         player.animationFrames = 2
    //         player.animationTimer = 4
    //         player.loopAnimation = false
    //     }
    //     player.isCrouched = true
    //     player.hbOffsets({top: 10, bottom: 0, left: 5, right: 5})
    //     player.speed.x *= 0.7
    // } else {
    //     if (player.canUnCrouch) {
    //         player.hbOffsets({top: 3, bottom: 0, left: 6, right: 6})
    //         player.isCrouched = false
    //     }
    //     if (!player.canUnCrouch) player.speed.x *= 0.7
    //     else player.speed.x *= 0.87
    // }
    // if (ts.length > 1 && ' ' in con.keys) {
    //     if (player.onGround && player.canUnCrouch) {
    //         player.isCrouched = false
    //         player.animationFrame = 0
    //         player.animationFrames = 3
    //         player.animationTimer = 5
    //         player.animationStart = 12
    //         player.loopAnimation = false
    //         player.curAnimationTimer = player.animationTimer
    //         player.speed.y -= 9
    //         player.onGround = false
    //     }
    // }
    // if (!player.onGround)
    //     player.speed.y += 0.6
    // if (player.canUnCrouch && player.onGround && (!(' ' in con.keys)) && (!('s' in con.keys))) {
    //     player.loopAnimation = true
    //     player.animationFrames = 6
    //     if (Math.abs(player.speed.x) > 1) {
    //         player.animationStart = 6
    //         player.animationTimer = 3
    //     } else {
    //         player.animationStart = 0
    //         player.animationTimer = 6
    //     }
    // }
    // if ((!player.loopAnimation) && player.animationStart == 12 && player.speed.y > 0) {
    //     player.animationStart = 15
    //     player.animationFrame = 0
    //     player.animationFrames = 2
    //     player.animationTimes = 5
    //     player.curAnimationTimer = player.animationTimer
    // }
    // if (player.speed.x != 0) player.flipped = player.speed.x < 0
    // player.canUnCrouch = true
}
