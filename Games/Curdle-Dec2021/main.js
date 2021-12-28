
// Gameplay
const ON_ENERGY_DRAIN = 0.002
const LAMPPOST_CHARGE = 0.0016
const HOVER_ENERGY_DRAIN = 0.008

// Screen stuff
const PLAYER_SCREEN_MARGIN = 10
const ENEMY_SCREEN_MARGIN = -10
const SPAWN_MARGIN = 40
const SOCKET_POS = 200

const con = new Console(Device.touch() ? 300 : 200, [49, 25, 77])

// con.nObj(new Sprite("Assets/finalSocket.png"))

// Button
let button = con.nObj(new Button("Assets/playButton.png", 0, 0, 16, 16, 1, true))
button.addAnimation("off", {start: 0, end: 0, timer: 1, loop: false, pause: -1}, true)
button.addAnimation("on", {start: 1, end: 1, timer: 1, loop: false, pause: -1})
button.opacity = 1
button.state = 0
button.layer(2e9)
button.drawFn = (function() {
	if (this.state % 2 == 1) this.opacity = Math.max(0, this.opacity - 0.1)
	con.color(255, this.opacity * 255)
})
button.onClick(function(){
	if (this.opacity != 1) return
	if (this.state++ % 2 == 0) this.animate("on")
	else this.animate("off")
})

// Spotlight
let spotlight = con.nObj(new Sprite("Assets/playerSpotlight.png", 0, 0, 69, 19))
spotlight.drawFn = (function(){
	con.color(255, player.energyLevel * (player.isOn ? 150 : 100))
	con.blend(1)
})

// Bulbs
let bulbs = []
for (let e = 0; e < 1; e++) {
	bulbs.push(con.nObj(new PhysicsActor("Assets/off.png", Math.random() * con.width, Math.random() * con.height, 16, 33)))
	bulbs[e].hbOffsets({top: 29, bottom: 2, left: 7, right: 7})
	bulbs[e].addAnimation("run" , { start: 8, end: 20, timer: 5, loop: true, pause: -1 }, true)

	bulbs[e].animation[0] = Math.floor(Math.random() * 8)
	bulbs[e].animation[1] = Math.floor(Math.random() * 12)

	if (e > 0) {
		bulbs[e].drawFn = (function(){
			let md = 1e4
			for (let h = 0; h < hovers.length; h++) {
				let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
				if (dsq < md) md = dsq
			}
			md = Math.max(0, 50 - (md / 10)) * 3
			if (player.isOn) {
				con.color(Math.max(300 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.5) + md)
			} else {
				con.color(Math.max(255 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.3) + md)
			}
		})
	}
}

// Setup player
let player = bulbs[0]

player.addAnimation("idle", { start: 0, end: 7, timer: 12, loop: true , pause: -1 }, true)
player.addAnimation("socket", { start: 21, end: 26, timer: 3, loop: false, pause: -1 })
player.drawFn = (function(){
	let md = 1e4
	for (let h = 0; h < hovers.length; h++) {
		let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
		if (dsq < md) md = dsq
	}
	md = Math.max(0, 50 - (md / 10)) * 2
	if (player.isOn) {
		con.color(
			CTool.lerp(229, 300, player.energyLevel) + md, 
			CTool.lerp(180, 300, player.energyLevel) + md, 
			CTool.lerp(366, 300, player.energyLevel) + md)
	} else {
		con.color(300 + md)
	}
})
player.pos.x = 0
player.pos.y = con.height / 2 - player.h / 2

// Player custom properties
player.isOn = false
player.setSrc("Assets/on.png")
player.setSrc("Assets/off.png")

player.energyLevel = 10 // 0 - 1

// Controls
Controllers.new(player, "topDown")
con.onKeyPressed([' '], "switch")
con.nEvent("switch", () => {
	if (button.state % 2 != 1) {
		button.state++
		button.animate("on")
		return
	}
	player.isOn = (!player.isOn) && player.energyLevel > 0
	if (player.isOn) {
		player.setSrc("Assets/on.png")
		player.animationStates.run[2] = 2
	} else {
		player.setSrc("Assets/off.png")
		player.animationStates.run[2] = 6
	}
})

// con.events.right[1] = true

// Ground things
let groundThings = []

// Make socket
// let socket = con.nObj(new Sprite("Assets/socket.png", SOCKET_POS + con.width / 2, con.height / 2 - 16, 16, 16, 1, true))
let socket = con.nObj(new Sprite("Assets/finalSocket.png", SOCKET_POS + con.width / 2, con.height / 2, 75, 25, 1, true))
socket.drawFn = (function(){
	if (player.isOn) {
		con.color(Math.max(100, 355 - Math.sqrt(player.pos.distSquared(this.pos))))
	} else {
		con.color(255, 100)
	}
})
socket.layer(-1e8)
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
let lampposts = []
for (let l = 0; l < 5; l++) {
	// Instantiate lamppost
	lampposts.push(con.nObj(new Sprite("Assets/lamppost.png", 0, 0, 21, 59)))
	lampposts[lampposts.length - 1].drawFn = (function(){
		con.color(Math.max(120, 280 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.7))
	})
	// lampposts[lampposts.length - 1].showHitbox = true
	lampposts[lampposts.length - 1].hbOffsets({top: 50, bottom: -4, left: -8, right: 3})
	lampposts[lampposts.length - 1].pos = new Vec2(Math.random() * con.width, Math.random() * con.height)

	// Instantiate shine
	lampposts.push(con.nObj(new Sprite("Assets/lamppostShine.png", 0, 0, 27, 59)))
	lampposts[lampposts.length - 1].drawFn = (function(){
		con.color(255, 100)
		con.blend(1)
	})
}

// Instantiate hovers
let hovers = []
for (let h = 0; h < 1; h++) {
	let nh = [
		con.nObj(new Sprite("Assets/lamp.png", h * 74, 0, 74, 31)),
		con.nObj(new Sprite("Assets/lampLight.png", h * 74, 0, 48, 58))
	]
	// Hover
	nh[0].addAnimation("h", { start: 0, end: 3, timer: 3, loop: true, pause: -1 }, true)
	nh[0].layer(1e9)

	// Shine
	nh[1].drawFn = (function(){
		con.blend(1)
	})
	// nh[1].showHitbox = true
	nh[1].hbOffsets({top: 43, bottom: 3, left: 3, right: 3})
	hovers.push(nh)
}

con.init(() => {
	con.follow(player, 0.05, new Vec2(40, 40))

	con.physics.gravity = new Vec2(0, 0)
	con.physics.friction = new Vec2(0.95, 0.95)
	con.maxSortPerFrame = -1

	con.camera.constrains = new Rect(0, 0, SOCKET_POS, 0)
})

function keepOnScreen(el, mult=1) {
	let fp = el.finalPos()
	if (fp.x < -el.w) {
		el.pos.x += con.width + SPAWN_MARGIN + el.w
		el.pos.y = CTool.spreadRandom() * (con.height - el.h)
	} else if (fp.x > con.width + SPAWN_MARGIN + el.w) {
		el.pos.x -= con.width + SPAWN_MARGIN + el.w * 2
		el.pos.y = CTool.spreadRandom() * (con.height - el.h)
	}
	return fp
}

function useSocket(s) {
	player.locked = true
	player.pos.x -= ((player.pos.x + Math.ceil(player.w / 2)) - s.pos.x) * 0.3
	// player.pos.y -= ((player.pos.y + 20.5) - s.pos.y) * 0.3
	player.pos.y -= ((player.pos.y + 32.5) - s.pos.y) * 0.3

	player.animate("socket")
}

con.frame(() => {
	button.pos.x = con.width / 2
	button.pos.y = con.height / 2

	spotlight.pos = player.pos.added2(-26, 22)

	// Temporary Hover animation
	// hovers[0][0].pos = new Vec2(SOCKET_POS - con.width / 2, Math.sin(con.frameCount / 80) * 30 + 50)
	for (let h = 0; h < hovers.length; h++) {
		hovers[h][1].pos = hovers[h][0].pos.added2(13, 29)
	}

	// Socket interaction
	if (player.isOn && player.pos.added2(player.w / 2, 32).distSquared(socket.pos) < 161) useSocket(socket)
	else player.locked = false // Not necessary, only for testing

	// Layering, animation (for bulbs), and keeping things on screen.
	let ppy = player.finalPos().y + (Math.random() - 0.5) * 3
	for (let e = 0; e < lampposts.length; e++) {
		if (e % 2 == 0) {
			lampposts[e].layer(lampposts[e].pos.y + 33)
			keepOnScreen(lampposts[e])
		} else {
			lampposts[e].pos = lampposts[e - 1].pos.added2(-9, 4)
			lampposts[e].layer(lampposts[e].pos.y + 17)
		}
	}
	for (let e = 1; e < groundThings.length; e++) keepOnScreen(groundThings[e], 2)
	for (let h = 0; h < hovers.length; h++) hovers[h][1].layer(hovers[h][1].pos.y + 14)
	for (let e = 0; e < bulbs.length; e++) {
		bulbs[e].flipped = bulbs[e].speed.x > 0
		bulbs[e].layer(bulbs[e].pos.y)
		if (bulbs[e].animationState != "socket") {
			if (bulbs[e].speed.length() > 0.1) {
				bulbs[e].animate("run")
			} else if (e == 0) {
				bulbs[e].animate("idle")
			}
		}

		if (e > 0) {
			let fp = keepOnScreen(bulbs[e])
			// Go towards center
			bulbs[e].speed.y += (fp.y < ppy ? 1 : -1) * (fp.x < con.width / 2 ? -0.5 : 1) * (player.isOn ? 1 : -1) * 0.004
		}
	}
	player.layer(player.pos.y + 3)
})

con.pFrame(() => {
	// Energy drain
	if (player.isOn && player.animationState != "socket") player.energyLevel -= ON_ENERGY_DRAIN
	if (player.energyLevel <= 0) {
		player.energyLevel = 0
		player.isOn = false
		player.setSrc("Assets/off.png")
		player.animationStates.run[2] = 6
	}
	for (let h = 0; h < hovers.length; h++) {
		if (player.intersects(hovers[h][1])) {
			player.energyLevel -= HOVER_ENERGY_DRAIN
		}
	}

	// Energy gain
	for (let l = 0; l < lampposts.length; l += 2) {
		if (player.intersects(lampposts[l])) {
			player.energyLevel += LAMPPOST_CHARGE
			break
		}
	}
	
	// Energy cap
	// if (player.energyLevel > 1) player.energyLevel = 1

	// Physics things
	if (player.pos.x < PLAYER_SCREEN_MARGIN * 2) {
		player.speed.x += (player.pos.x - PLAYER_SCREEN_MARGIN * 2) ** 2 / 2e4
	}
	for (let e = 0; e < bulbs.length; e++) {
		for (let o = 0; o < bulbs.length; o++) {
			if (e == o) continue
			let d = Math.sqrt((bulbs[e].pos.x - bulbs[o].pos.x) ** 2 + ((bulbs[e].pos.y - bulbs[o].pos.y) * 1.5) ** 2)
			if (d > 0) {
				let a = Math.atan2(bulbs[e].pos.x - bulbs[o].pos.x, bulbs[e].pos.y - bulbs[o].pos.y)
				if (d < 16 || (d < 64 && e > 0)) {
					bulbs[e].speed.x += Math.sin(a) / (d * 40)
					bulbs[e].speed.y += Math.cos(a) / (d * 40)
				}
			}
		}
		if (e > 0)
			bulbs[e].speed.x -= (CTool.noise(e, con.frameCount / 200) + 4) / 400
		
		// Limit y position
		if (e > 0) {
			if (bulbs[e].pos.y < ENEMY_SCREEN_MARGIN) {
				bulbs[e].speed.y += (bulbs[e].pos.y - ENEMY_SCREEN_MARGIN) ** 2 / 1e4
			} else if (bulbs[e].pos.y > con.height - bulbs[e].h - ENEMY_SCREEN_MARGIN) {
				bulbs[e].speed.y -= (bulbs[e].pos.y - (con.height - bulbs[e].h - ENEMY_SCREEN_MARGIN)) ** 2 / 1e4
			}
		} else {
			if (bulbs[e].pos.y < PLAYER_SCREEN_MARGIN) {
				bulbs[e].speed.y += (bulbs[e].pos.y - PLAYER_SCREEN_MARGIN) ** 2 / 1e4
			} else if (bulbs[e].pos.y > con.height - bulbs[e].h - PLAYER_SCREEN_MARGIN) {
				bulbs[e].speed.y -= (bulbs[e].pos.y - (con.height - bulbs[e].h - PLAYER_SCREEN_MARGIN)) ** 2 / 1e4
			}
		}
	}
	if (button.state % 2 == 1 && !player.locked)
        player.speed.addVec(new Vec2(
            (con.eventOngoing("right") ? 1 : 0) - (con.eventOngoing("left") ? 1 : 0)
			+ (con.eventOngoing("down") ? 0.01 : 0) - (con.eventOngoing("up") ? 0.01 : 0),
			(con.eventOngoing("down") ? 1 : 0) - (con.eventOngoing("up") ? 1 : 0) * 0.5
		).normalized().divideRet(
			player.isOn ? 45 : 100
		))
})
