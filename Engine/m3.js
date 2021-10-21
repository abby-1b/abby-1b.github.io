
let con = new Console(200, "#ebe3c5")

// Controls
con.nEvent("jump", () => {
    if (!player.onGround && player.extraJumps <= 0) return
	if (player.extraJumps > 0 && !player.onGround) {
		player.extraJumps--
		player.speed.y = -1.1
		return
	}
	if (player.isCrouched) player.speed.x *= 1.1
	player.speed.y = -1
})
con.onKeyPressed([' ', 'w', 'W', "ArrowUp"], "jump")

con.nEvent("left" , () => {})
con.onKeyPressed(['a', 'A', "ArrowLeft" ], "left")
con.nEvent("right", () => {})
con.onKeyPressed(['d', 'D', "ArrowRight"], "right")

// Touch
con.touchArea(2, 2, [
    "jump", "jump",
    "left", "right"
])

// Background
con.backgroundColor = "#f0eddf"
let background = [0, 1, 2]
background = background.map(e => con.nObj(new Sprite("Tiles/Sky" + e + ".png", -16, -16, con.width + 32, 512, 1, true)))

let plant = con.nObj(new Sprite("Sprites/Plant.png", 0, 0, 8, 8, false))
plant.addAnimation("default", {
    start: 0,
    end: 40,
    timer: 8,
    loop: true,
    pause: -1
}, true)

// Player
let player = con.nObj(new PhysicsActor("Sprites/Player.png", 0, 0, 16, 16))
player.addAnimation("idle", { start: 0 , end: 5 , timer: 6 , loop: true , pause: -1 }, true)
player.addAnimation("run" , { start: 6 , end: 11, timer: 3 , loop: true , pause: -1 })
player.addAnimation("jump", { start: 12, end: 13, timer: 12, loop: false, pause: -1 })
player.addAnimation("fall", { start: 14, end: 16, timer: 8 , loop: false, pause: -1 })
player.addAnimation("down", { start: 17, end: 18, timer: 3 , loop: false, pause: -1 })
player.addAnimation("cmov", { start: 18, end: 19, timer: 5 , loop: true, pause: -1 })

player.extraJumps = 999
player.groundFriction = false
// player.showHitbox = true
player.isCrouched = false
player.hbOffsets({top: 3, bottom: 0, left: 5, right: 6})
player.onCollision(function(el, d) {
	// console.log(d)
    if (el.srcStr == "Tiles/Bounce.png" && d == "top") {
        player.speed.y = -2.3
        player.animate("jump")
    } else if (el.srcStr == "Sprites/Trash.png") {
		con.rObj(el)
		player.extraJumps++
    }
})

// for (let t = 0; t < 600; t++) {
// 	con.nObj(new PhysicsActor("Sprites/Trash.png", 32 + t * 4, 0, 4, 4))
// }

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
    con.follow(player, 0.5, new Vec2(0, 0))
    CTool.tileMapFrom("Maps/OpenWorld.png", { // "Maps/OpenWorld.png"
        PLAYER: ["player", 78, 205, 196],
		PLANT: ["plant", 31, 255, 40],
        BRICK: ["Tiles/SmallBrick.png", 168, 168, 168],
        BOUNCE: ["Tiles/Bounce.png", 26, 83, 92],
        TRASH: ["trash", 255, 230, 109]
    }, (bars) => {
		console.log(bars)
		const ss = 1 // 8
		player.pos.addVec(CTool.findTilePos(bars, "player").multiplied(ss))
        // console.log(bars.length + " bars instanced.")
        for (let b = 0; b < bars.length; b++) {
            if (["player", "plant"].includes(bars[b].type)) continue
            if (bars[b].type == "trash") {
                con.nObj(new PhysicsActor("Sprites/Trash.png", ss * bars[b].x, ss * bars[b].y, ss * 2, ss * 2))
                continue
            }
            let s = con.nObj(new Tile(bars[b].type, ss * bars[b].x, ss * bars[b].y, ss * bars[b].w, ss * bars[b].h, false))
        }
		con.preLoop(preLoop)
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

let preLoop = () => {

	let bf = CTool.map(con.camPos.y, 156, -1204, 0, 1)

	for (let p = 0; p < background.length; p++) {
		background[p].w = con.width + 32
		background[p].pos.x =  -con.camPos.x + con.width / 2
		background[p].pos.y = (-con.camPos.y + con.height / 2) / (p / 300 + 1)
		background[p].animation[0] = CTool.lerp(background[p].animation[0], (-con.camPos.x / 1000) * (p / 10 + 1), 0.4)
	}
}

let gameLoop = () => {
    // con.text(CTool.round(con.frameRate, 2), 1, 1)
	con.text(con.camPos.rounded(), 1, 1)
    
    if ('s' in con.keys && player.onGround) {
        player.isCrouched = true
        player.speed.x *= 0.6
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

    if (!player.locked)
        player.speed.addVec(new Vec2(
            (con.eventOngoing("right") ? 1 : 0) - (con.eventOngoing("left") ? 1 : 0), 0).normalized().multiplyRet(0.25))
}
