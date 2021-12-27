
const SCREEN_MARGIN = 10
const SOCKET_POS = 800

const con = new Console(Device.touch() ? 300 : 200, [49, 25, 77])

let enemies = []
for (let e = 0; e < 50; e++) {
	enemies.push(con.nObj(new PhysicsActor("Assets/off.png", Math.random() * con.width, Math.random() * con.height, 16, 33)))
	enemies[e].hbOffsets({top: 29, bottom: 2, left: 7, right: 7})
	enemies[e].addAnimation("run" , { start: 8, end: 20, timer: 5, loop: true, pause: -1 }, true)

	enemies[e].animation[0] = Math.floor(Math.random() * 8)
	enemies[e].animation[1] = Math.floor(Math.random() * 12)

	if (e > 0) {
		enemies[e].drawFn = (function(){
			let md = 1e4
			for (let h = 0; h < hovers.length; h++) {
				let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
				if (dsq < md) md = dsq
			}
			md = Math.max(0, 50 - (md / 10)) * 3
			if (enemies[0].isOn) {
				con.color(Math.max(300 - Math.sqrt(enemies[0].pos.distSquared(this.pos)) * 0.5) + md)
			} else {
				con.color(Math.max(255 - Math.sqrt(enemies[0].pos.distSquared(this.pos)) * 0.3) + md)
			}
		})
	}
}

// Setup player
enemies[0].addAnimation("idle", { start: 0, end: 7, timer: 12, loop: true , pause: -1 }, true)
enemies[0].addAnimation("socket", { start: 21, end: 25, timer: 3, loop: false, pause: -1 })
enemies[0].drawFn = (function(){
	let md = 1e4
	for (let h = 0; h < hovers.length; h++) {
		let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
		if (dsq < md) md = dsq
	}
	md = Math.max(0, 50 - (md / 10)) * 2
	con.color(300 + md)
})
enemies[0].pos.x = 0
enemies[0].pos.y = con.height / 2 - enemies[0].h / 2

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

// Ground things
let groundThings = []

// Make socket
let socket = con.nObj(new Sprite("Assets/socket.png", SOCKET_POS + con.width / 2, con.height / 2 - 16, 16, 16))
socket.drawFn = (function(){
	if (enemies[0].isOn) {
		con.color(Math.max(100, 355 - Math.sqrt(enemies[0].pos.distSquared(this.pos))))
	} else {
		con.color(255, 100)
	}
})
groundThings.push(socket)

// Instantiate ground things
for (let g = 0; g < 20; g++) {
	groundThings.push(con.nObj(new Sprite("Assets/water.png", 0, 0, 16, 16)))
	groundThings[groundThings.length - 1].pos = new Vec2(Math.random() * (con.width + 16), Math.random() * (con.height + 16))
	if (Math.random() < 0.6) {
		// Water
		groundThings[groundThings.length - 1].addAnimation("w", { start: 0, end: 1, timer: 8, loop: true, pause: -1 }, true)
		groundThings[groundThings.length - 1].animation[1] = Math.floor(Math.random() * 8)
	} else {
		// Grass
		groundThings[groundThings.length - 1].animation[0] = Math.random() < 0.5 ? 2 : 3
	}
	groundThings[groundThings.length - 1].flipped = Math.random() < 0.5
}
for (let t = 0; t < groundThings.length; t++) groundThings[t].layer(-1e9)


// Instantiate lampposts
let elevatedThings = []
for (let l = 0; l < 5; l++) {
	elevatedThings.push(con.nObj(new Sprite("Assets/lamppost.png", 0, 0, 21, 59)))
	elevatedThings[elevatedThings.length - 1].drawFn = (function(){
		con.color(Math.max(120, 280 - Math.sqrt(enemies[0].pos.distSquared(this.pos)) * 0.7))
	})
	elevatedThings[elevatedThings.length - 1].pos = new Vec2(Math.random() * con.width, Math.random() * con.height)
}

// Instantiate hovers
let hovers = []
for (let h = 0; h < 1; h++) {
	let nh = [
		con.nObj(new Sprite("Assets/lamp.png", h * 74, 0, 74, 31)),
		con.nObj(new Sprite("Assets/lampLight.png", h * 74, 0, 48, 58))
	]
	nh[1].drawFn = (function(){
		con.blend(1)
	})
	nh[0].addAnimation("h", { start: 0, end: 3, timer: 3, loop: true, pause: -1 }, true)
	nh[0].layer(1e9)
	hovers.push(nh)
}

con.init(() => {
	con.follow(enemies[0], 0.05, new Vec2(40, 40))

	con.physics.gravity = new Vec2(0, 0)
	con.physics.friction = new Vec2(0.95, 0.95)
	con.maxSortPerFrame = -1

	con.camera.constrains = new Rect(0, 0, SOCKET_POS, 0)
})

function keepOnScreen(el, mult=1) {
	let fp = el.finalPos()
	if (fp.x < -el.w) {
		el.pos.x += con.width + el.w
		el.pos.y = CTool.spreadRandom() * (con.height - el.h)
	} else if (fp.x > con.width + el.w) {
		el.pos.x -= con.width + el.w * 2
		el.pos.y = CTool.spreadRandom() * (con.height - el.h)
	}
	return fp
}

function useSocket(s) {
	enemies[0].locked = true
	enemies[0].pos.x -= (enemies[0].pos.x - s.pos.x) * 0.3
	enemies[0].pos.y -= ((enemies[0].pos.y + 20) - s.pos.y) * 0.3
}

con.frame(() => { // SOCKET_POS - con.width / 2
	hovers[0][0].pos = new Vec2(SOCKET_POS - con.width / 2, Math.sin(con.frameCount / 80) * 30 + 50)
	hovers[0][1].pos = hovers[0][0].pos.added2(13, 29)

	if (enemies[0].isOn && enemies[0].pos.added2(0, 19).distSquared(socket.pos) < 161) useSocket(socket)
	else enemies[0].locked = false

	let ppy = enemies[0].finalPos().y + (Math.random() - 0.5) * 3
	for (let e = 0; e < elevatedThings.length; e++) {
		elevatedThings[e].layer(elevatedThings[e].pos.y + 33)
		keepOnScreen(elevatedThings[e])
	}
	for (let e = 1; e < groundThings.length; e++) keepOnScreen(groundThings[e], 2)
	for (let h = 0; h < hovers.length; h++) hovers[h][1].layer(hovers[h][1].pos.y + 14)
	for (let e = 0; e < enemies.length; e++) {
		enemies[e].flipped = enemies[e].speed.x > 0
		enemies[e].layer(enemies[e].pos.y)
		if (enemies[e].speed.length() > 0.1) {
			enemies[e].animate("run")
		} else if (e == 0) {
			enemies[e].animate("idle")
		}

		if (e > 0) {
			let fp = keepOnScreen(enemies[e])
			// Go towards center
			enemies[e].speed.y += (fp.y < ppy ? 1 : -1) * (fp.x < con.width / 2 ? -0.5 : 1) * (enemies[0].isOn ? 1 : -1) * 0.004
		}
	}
	enemies[0].layer(enemies[0].pos.y + 5)
})

con.pFrame(() => {
	if (enemies[0].pos.x < SCREEN_MARGIN * 2) {
		enemies[0].speed.x += (enemies[0].pos.x - SCREEN_MARGIN * 2) ** 2 / 2e4
	}
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
		
		if (enemies[e].pos.y < SCREEN_MARGIN) {
			enemies[e].speed.y += (enemies[e].pos.y - SCREEN_MARGIN) ** 2 / 1e4
		} else if (enemies[e].pos.y > con.height - enemies[e].h - SCREEN_MARGIN) {
			enemies[e].speed.y -= (enemies[e].pos.y - (con.height - enemies[e].h - SCREEN_MARGIN)) ** 2 / 1e4
		}
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
