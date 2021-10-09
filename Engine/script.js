
let con = new Console(200, "#ebe3c5")

// Text
con.nFont("rh", "rainyhearts.ttf")
con.font("rh")

// Controls
con.nEvent("jump", () => {
    if (player.onGround)
        player.speed.y = -1
})
con.onKeyPressed(' ', "jump")
con.nEvent("left", () => {})

// Touch
con.touchArea(2, 2, [
    "jump", "jump",
    "left", "right"
])

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
player.addAnimation("idle", { start: 0 , end: 5 , timer: 6 , loop: true , pause: -1 }, true)
player.addAnimation("run" , { start: 6 , end: 11, timer: 3 , loop: true , pause: -1 })
player.addAnimation("jump", { start: 12, end: 13, timer: 12, loop: false, pause: -1 })
player.addAnimation("fall", { start: 14, end: 16, timer: 8 , loop: false, pause: -1 })
player.addAnimation("down", { start: 17, end: 18, timer: 3 , loop: false, pause: -1 })
player.addAnimation("cmov", { start: 18, end: 19, timer: 5 , loop: true, pause: -1 })

player.flipped = true
// player.showHitbox = true
player.isCrouched = false
player.hbOffsets({top: 3, bottom: 0, left: 5, right: 6})
// player.pos.x += 75

player.onCollision(function(el, d) {
    if (el.srcStr == "Tiles/Bounce.png" && d == "top") {
        player.speed.y = -2.3
        player.animate("jump")
    } else if (el.srcStr == "Sprites/Trash.png" && d == "top") {
        player.speed.y = -1.5
    }
})

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
    con.follow(player, 0.1)
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
    // console.log(con.eventOngoing("jump"))

    background.pos.x = -con.camPos.x + con.width / 2
    background.pos.y = (-con.camPos.y + con.height / 2) - (player.pos.y / 40)
    background.animation[0] = (-con.camPos.x / 1000) + player.pos.x / 10000

    con.text("Hello, World!", 5, 10)

    if (!player.locked)
        player.speed.add(new Vec2(
            ('d' in con.keys ? 1 : 0) - ('a' in con.keys ? 1 : 0), 0).normalized().mulr(0.25))
    
    if ('s' in con.keys && player.onGround) {
        player.isCrouched = true
        player.speed.x *= 0.7
    } else {
        // if (player.canUnCrouch) {
        player.isCrouched = false
        // }
        // if (!player.canUnCrouch) player.speed.x *= 0.7
        // else player.speed.x *= 0.87
    }
    if (player.onGround) {
        if (player.isCrouched) {
            if (Math.abs(player.speed.x) > 0.1)
                player.animate("cmov")
            else
                player.animate("down")
            
            player.hbOffsets({top: 10, bottom: 0, left: 3, right: 5})
        } else {
            if (Math.abs(player.speed.x) > 0.1)
                player.animate("run")
            else
                player.animate("idle")
            player.hbOffsets({top: 3, bottom: 0, left: 5, right: 6})
        }
    } else {
        if (player.speed.y < -0.5)
            player.animate("jump")
        else
            player.animate("fall")
        player.hbOffsets({top: 3, bottom: 0, left: 5, right: 6})
    }
    if (player.speed.x != 0) player.flipped = player.speed.x < 0
}
