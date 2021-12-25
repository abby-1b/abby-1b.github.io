
const con = new Console(Device.touch() ? 300 : 200, [49, 25, 77])

con.physics.gravity = new Vec2(0, 0)
con.physics.friction = new Vec2(0.95, 0.95)
con.maxSortPerFrame = -1

let enemies = []
for (let e = 0; e < 50; e++) {
	enemies.push(con.nObj(new PhysicsActor("Assets/off.png", 0, 0, 16, 33)))
	enemies[e].hbOffsets({top: 29, bottom: 2, left: 7, right: 7})
	// enemies[e].showHitbox = true
	enemies[e].pos = new Vec2((Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200)

	enemies[e].addAnimation("idle", { start: 0 , end: 7 , timer: 12, loop: true , pause: -1 }, true)
	enemies[e].addAnimation("run" , { start: 8 , end: 20, timer: 5 , loop: true , pause: -1 })

	enemies[e].animation[0] = Math.floor(Math.random() * 8)
	enemies[e].animation[1] = Math.floor(Math.random() * 12)

	if (e > 0) {
		enemies[e].drawFn = (function(){
			if (enemies[0].isOn) {
				con.color(300 - Math.sqrt(enemies[0].pos.distSquared(this.pos)))
			} else {
				con.color(255 - Math.sqrt(enemies[0].pos.distSquared(this.pos)) * 0.8)
			}
		})
	}
}

// Setup player
enemies[0].drawFn = (function(){
	con.color(255)
})
enemies[0].pos.x = 0
enemies[0].pos.y = 0

enemies[0].isOn = false
enemies[0].setSrc("Assets/on.png")
enemies[0].setSrc("Assets/off.png")

// Controls
con.nEvent("left", () => {})
con.nEvent("right", () => {})
con.nEvent("up", () => {})
con.nEvent("down", () => {})
con.nEvent("switch", () => {
	enemies[0].isOn = !enemies[0].isOn
	if (enemies[0].isOn) {
		enemies[0].setSrc("Assets/on.png")
		enemies[0].animationStates.run[2] = 2
	} else {
		enemies[0].setSrc("Assets/off.png")
		enemies[0].animationStates.run[2] = 6
	}
})
Controllers.new(enemies[0], "topDown")
con.onKeyPressed([' '], "switch")

// con.events.right[1] = true

// Things

let groundThings = []
groundThings.push(con.nObj(new Sprite("Assets/socket.png", 0, 0, 16, 16)))
groundThings[0].drawFn = (function(){
	if (enemies[0].isOn) {
		con.color(355 - Math.sqrt(enemies[0].pos.distSquared(this.pos)))
	} else {
		con.color(200, 10)
	}
})

// Instantiate water
for (let w = 0; w < 50; w++) {
	groundThings.push(con.nObj(new Sprite("Assets/water.png", 0, 0, 16, 16)))
	groundThings[groundThings.length - 1].drawFn = (function(){
		con.color(255)
	})
	groundThings[groundThings.length - 1].pos = new Vec2(Math.random() * con.width, Math.random() * con.height)
	groundThings[groundThings.length - 1].addAnimation("w", { start: 0, end: 1, timer: 8, loop: true, pause: -1 }, true)
	groundThings[groundThings.length - 1].animation[1] = Math.floor(Math.random() * 8)
}
for (let t = 0; t < groundThings.length; t++) groundThings[t].layer(-1e9)


let elevatedThings = []

// Instantiate lampposts
for (let l = 0; l < 5; l++) {
	elevatedThings.push(con.nObj(new Sprite("Assets/lamppost.png", 0, 0, 21, 59)))
	elevatedThings[elevatedThings.length - 1].drawFn = (function(){
		con.color(280 - Math.sqrt(enemies[0].pos.distSquared(this.pos)) * 0.7)
	})
	elevatedThings[elevatedThings.length - 1].pos = new Vec2(Math.random() * con.width, Math.random() * con.height)
}

con.init(() => {
	con.follow(enemies[0], 0.05, new Vec2(20, 20))
})

// con.preFrame(() => {
// 	let ppos = enemies[0].finalPos()
// 	con.color(255, 230, 100, 50)
// 	con.fillRect(ppos.x + 1, ppos.y, 30, 16)
// 	con.fillRect(ppos.x, ppos.y + 1, 32, 14)
// })

function keepOnScreen(el, mult=1) {
	let fp = el.finalPos()
	if (fp.x < -el.w) {
		el.pos.x += con.width + el.w
		el.pos.y += Math.random() * con.height
	} else if (fp.x > con.width + el.w) {
		el.pos.x -= con.width + el.w * 2
		el.pos.y += Math.random() * con.height
	}
	if (fp.y < -el.h) {
		el.pos.y += con.height + el.h * 1
	} else if (fp.y > con.height + el.h) {
		el.pos.y -= con.height + el.h * 2
	}
	return fp
}

con.frame(() => {
	let ppy = enemies[0].finalPos().y + (Math.random() - 0.5) * 3
	for (let e = 0; e < elevatedThings.length; e++) {
		elevatedThings[e].layer(elevatedThings[e].pos.y + 33)
		keepOnScreen(elevatedThings[e])
	}
	for (let e = 1; e < groundThings.length; e++) {
		keepOnScreen(groundThings[e], 2)
	}
	for (let e = 0; e < enemies.length; e++) {
		enemies[e].flipped = enemies[e].speed.x > 0
		enemies[e].layer(enemies[e].pos.y)
		if (enemies[e].speed.length() > 0.1) {
			enemies[e].animate("run")
		} else {
			enemies[e].animate("idle")
		}

		if (e > 0) {
			let fp = keepOnScreen(enemies[e])

			// Go towards center
			enemies[e].speed.y += (fp.y < ppy ? 1 : -1) * (fp.x < con.width / 2 ? -0.5 : 1) * 0.0035
		}
	}
	enemies[0].layer(enemies[0].pos.y + 5)
})

con.pFrame(() => {
	for (let e = 0; e < enemies.length; e++) {
		for (let o = 0; o < enemies.length; o++) {
			if (e == o) continue
			let d = Math.sqrt((enemies[e].pos.x - enemies[o].pos.x) ** 2 + ((enemies[e].pos.y - enemies[o].pos.y) * 1.5) ** 2)
			if (d > 0) {
				let a = Math.atan2(enemies[e].pos.x - enemies[o].pos.x, enemies[e].pos.y - enemies[o].pos.y)
				if (d < 16 || (d < 64 && e > 0)) {
					enemies[e].speed.x += Math.sin(a) / (d * 40)
					enemies[e].speed.y += Math.cos(a) / (d * 40)
				}
			}
		}
		if (e > 0)
			enemies[e].speed.x -= (CTool.noise(e, con.frameCount / 200) + 4) / 400
	}
	if (!enemies[0].locked)
        enemies[0].speed.addVec(new Vec2(
            (con.eventOngoing("right") ? 1 : 0) - (con.eventOngoing("left") ? 1 : 0)
			+ (con.eventOngoing("down") ? 0.01 : 0) - (con.eventOngoing("up") ? 0.01 : 0),
			(con.eventOngoing("down") ? 1 : 0) - (con.eventOngoing("up") ? 1 : 0) * 0.5
		).normalized().divideRet(
			enemies[0].isOn ? 45 : 100
		))
})
