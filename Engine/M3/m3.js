"use strict";

let con = new Console(200, [235, 227, 197])

// Set up physics
con.physics.gravity = new Vec2(0, 0.017)
con.physics.friction = new Vec2(0.92, 0.9985)

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
// con.backgroundColor = "#f0eddf" // (why in god's green earth is this here and not in the constructor?)
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
player.addAnimation("idle", { start: 0 , end: 5 , timer: 7 , loop: true , pause: -1 }, true)
player.addAnimation("run" , { start: 6 , end: 11, timer: 4 , loop: true , pause: -1 })
player.addAnimation("jump", { start: 12, end: 13, timer: 12, loop: false, pause: -1 })
player.addAnimation("fall", { start: 14, end: 16, timer: 8 , loop: false, pause: -1 })
player.addAnimation("down", { start: 17, end: 18, timer: 3 , loop: false, pause: -1 })
player.addAnimation("cmov", { start: 18, end: 19, timer: 5 , loop: true , pause: -1 })

player.extraJumps = 1
player.groundFriction = false
// player.showHitbox = true
// player.pos = new Vec2(615, 357)
// player.pos.y -= 16

player.isCrouched = false
player.hbOffsets({top: 3, bottom: 0, left: 5, right: 6})
player.onCollision(function(el, d, i) {
	if (i != undefined) {
		// console.log(el.colliders[i].type)
		if (el.colliders[i].type == "BOUNCE" && d == "top") {
			player.speed.y = -2.3
	        player.animate("jump")
		}
	}
    if (el.srcStr == "Sprites/Trash.png") {
		con.rObj(el)
		player.extraJumps++
    }
})

// for (let t = 0; t < 600; t++) {
// 	con.nObj(new PhysicsActor("Sprites/Trash.png", 32 + t * 4, 0, 4, 4))
// }

let tileMap = con.nObj(TileMap.from("Maps/Map1.png", {
	PLAYER: [78, 205, 196],
	PLANT: [31, 255, 40],
	BRICK: [168, 168, 168, new TileSet("Tiles/SmallBrick.png", 8, 8)],
	BOUNCE: [26, 83, 92, new TileSet("Tiles/BouncePad.png", 8, 8)],
	TRASH: [255, 230, 109]
}))


con.init(() => {
    con.follow(player, 0.1, new Vec2(10, 0))
})

con.frame(() => {
    // con.text(CTool.round(con.frameRate, 2), 1, 1)
	// con.text(player.speed.rounded(), 1, 1)
	// con.text(player.pos.multiplied(1 / 8).rounded(), 1, 6)

	let p = player.finalPos(true)

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
})

con.pFrame(() => {
	for (let p = 0; p < background.length; p++) {
		background[p].w = con.width + 32
		background[p].pos.x =  con.camPos.x + con.width / 2
		background[p].pos.y = (con.camPos.y + con.height / 2) / (p / 300 + 1)
		background[p].animation[0] = CTool.lerp(background[p].animation[0], (con.camPos.x / 10000) * (p / 10 + 1), 0.4)
	}

    if ('s' in con.keys && player.onGround) {
        player.isCrouched = true
        player.speed.x *= 0.6
    } else {
        player.isCrouched = false
    }
    if (player.speed.x != 0) player.flipped = player.speed.x < 0

    if (!player.locked)
        player.speed.addVec(new Vec2(
            (con.eventOngoing("right") ? 1 : 0) - (con.eventOngoing("left") ? 1 : 0), 0).normalized().divideRet(15))
})
