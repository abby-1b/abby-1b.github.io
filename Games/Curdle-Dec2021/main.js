
const sound = new SoundPlayer()
sound.preload([
	"dash.mp3",
	"switch.mp3",
	"noSwitch.mp3",
	"death.mp3",
	"click.mp3",
	"hover.mp3",
	"final.mp3",
	"spark.mp3"
], "Sound/")


const con = new Console(Device.touch() ? 300 : 200, [49, 25, 77])
document.body.style.background = '#000'

// Gameplay
const DASH_ENERGY = 0.25
const LAMPPOST_CHARGE = 0.001
const ON_CHARGE_MULTIPLIER = 1.5
const HOVER_ENERGY_DRAIN = 0.01
const INIT_ENERGY = 0.8
const TOUCH_ENERGY_DRAIN = 0.002

// Screen stuff
let ts = Device.touch() ? 1 : 2
const PLAYER_SCREEN_MARGIN = 10
const ENEMY_SCREEN_MARGIN = -10
const SPAWN_MARGIN = 40

// Fading
let fadeSpeed = 0.02
let fadeTo = 0
let fadeMultiplier = -1

// Bars
let blackBarSize = 0
let blackBarSizeTo = 0
let blackBarOffset = 0

// Timer
let timer = -1
let timerText = ""
let timerScores = []

// Title screen
let title = con.nObj(new Sprite("Assets/TITLE.png", 0, 0, 68, 32, 1, true))
title.drawFn = (function(){
	con.color(255, button.opacity * 255)
})
title.layer(2e9)

// Button
let button = con.nObj(new Button("Assets/playButton.png", 0, 0, 16, 16, 1, true))
button.addAnimation("off", {start: 0, end: 0, timer: 1, loop: false, pause: -1}, true)
button.addAnimation("on", {start: 1, end: 1, timer: 1, loop: false, pause: -1})
button.opacity = 1
button.state = 0
button.layer(2e9)
button.drawFn = (function() {
	if (this.state % 2 == 1) this.opacity = Math.max(0, this.opacity - 0.04)
	con.color(255, this.opacity * 255)
})
button.onClick(function(){
	if (this.opacity != 1) return
	if (this.state++ % 2 == 0) {
		this.animate("on")
		timer = Device.getTime()
	}
	else this.animate("off")

	// var audio = new Audio('Sound/click.mp3')
	// console.log(audio)
	// audio.play()
	// audio.addEventListener('timeupdate', function(){
	// 	var buffer = .1
	// 	if(this.currentTime > this.duration - buffer){
	// 		this.currentTime = 0
	// 		this.play()
	// 	}
	// })
})

// Instructions
let insShow = 0
let ins = con.nObj(new Sprite("Assets/insWasd.png", 0, con.height / 5, 33, 24, 1, true))
ins.addAnimation("sw", {start: 0, end: 3, timer: 30, loop: true, pause: -1}, true)
ins.layer(3e9)
ins.drawFn = (function(){
	con.color(255, insShow * 255)
})

// Spotlight
let spotlight = con.nObj(new Sprite("Assets/playerSpotlight.png", 0, 0, 69 * 8, 26 * 8, 1, true))
let spotlightAdd = 0
spotlight.drawFn = (function(){
	con.color(255, player.energyLevel * (player.isOn ? 190 : 130))
	con.blend(1)
})

// Bulbs
let bulbs = []
let deadBulbs = []
let addBulbs = []
function newBulb() {
	if (fadeMultiplier == -1) {
		bulbs.push(con.nObj(new PhysicsActor("Assets/off.png", Math.random() * con.width, Math.random() * con.height, 16, 33)))
	} else {
		bulbs.push(con.nObj(new PhysicsActor("Assets/off.png", con.camera.pos.x - 16, Math.random() * con.height, 16, 33)))
	}
	// bulbs[bulbs.length - 1].showHitbox = true
	bulbs[bulbs.length - 1].hbOffsets({top: 28, bottom: 1, left: 5, right: 6})
	bulbs[bulbs.length - 1].addAnimation("run", { start: 8, end: 20, timer: 5, loop: true, pause: -1 }, true)
	bulbs[bulbs.length - 1].animation[0] = Math.floor(Math.random() * 8)
	bulbs[bulbs.length - 1].animation[1] = Math.floor(Math.random() * 12)
	bulbs[bulbs.length - 1].drawFn = (function(){
		let md = 1e4
		for (let h = 0; h < hovers.length; h++) {
			let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
			if (dsq < md) md = dsq
		}
		md = Math.max(0, 50 - (md / 10)) * 3
		if (player.isOn)
			con.color(Math.max(300 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.5) + md)
		else
			con.color(Math.max(255 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.3) + md)
	})
}
function clearBulbs() {
	while (bulbs.length > 1) con.rObj(bulbs.pop())
}
function deathAnim(b, hide) {
	setTimeout(() => { sound.play("death.mp3", hide ? 1 : 0.5, hide ? 1 + Math.random() * 0.5 : 1) }, 120)
	let ds = con.nObj(new Sprite("Assets/offDeath.png", b.pos.x, b.pos.y, 46, 32))
	ds.fadeOut = 1
	if (hide) ds.drawFn = b.drawFn
	else ds.drawFn = (function(){
		if ((this.fadeOut -= 0.002) < 0) {
			con.rObj(this)
			deadBulbs.splice(deadBulbs.indexOf(this))
		}
		let md = 1e4
		for (let h = 0; h < hovers.length; h++) {
			let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
			if (dsq < md) md = dsq
		}
		md = Math.max(0, 50 - (md / 10)) * 3
		if (player.isOn)
			con.color(Math.max(300 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.5) + md, this.fadeOut * 255)
		else
			con.color(Math.max(255 - Math.sqrt(player.pos.distSquared(this.pos)) * 0.3) + md, this.fadeOut * 255)
	})
	ds.addAnimation("die", { start: 0, end: 5 + Math.round(Math.random()), timer: 9, loop: false, pause: -1}, true)
	ds.flipped = b.flipped
	if (!ds.flipped) ds.pos.x -= 25
	if (hide) { b.hidden = true }
	else { b.pos.x = con.camera.pos.x - 16 }
	deadBulbs.push(ds)
}

// PLAYER
// Setup player
newBulb()
let player = bulbs[0]

player.addAnimation("idle", { start: 0, end: 7, timer: 12, loop: true , pause: -1 }, true)
player.addAnimation("socket", { start: 21, end: 26, timer: 3, loop: false, pause: -1 })
player.onCollision((e) => {
	if (levelInfo[level].dash > 1) deathAnim(e, false)
	if (!player.isOn) player.energyLevel -= TOUCH_ENERGY_DRAIN
})
player.drawFn = (function(){
	let md = 2e5
	for (let h = 0; h < hovers.length; h++) {
		let dsq = this.pos.multiplied2(1, 2).distSquared(hovers[h][1].pos.multiplied2(1, 2).added(new Vec2(20, 48)))
		if (dsq < md) md = dsq
	}
	sound.loaded["hover.mp3"].volume = Math.max(0, ((1 - Math.min(Math.sqrt(md), 500) / 500) ** 2) * (1 - Math.abs(fadeMultiplier)))
	md = Math.max(0, 50 - (md / 10)) * 2 + spotlightAdd * 1600
	if (player.isOn)
		con.color(
			CTool.lerp(229, 300, player.energyLevel) + md, 
			CTool.lerp(180, 300, player.energyLevel) + md, 
			CTool.lerp(366, 300, player.energyLevel) + md)
	else
		con.color(300 + md)
})

// Player custom properties
player.isOn = false
player.setSrc("Assets/insSpace.png")
player.setSrc("Assets/insLamppost.png")
player.setSrc("Assets/insSocket.png")
player.setSrc("Assets/spark.png")
player.setSrc("Assets/offDeath.png")
player.setSrc("Assets/on.png")
player.setSrc("Assets/off.png")

player.energyLevel = INIT_ENERGY

// Player Controls
Controllers.new(player, "topDown")
con.onKeyPressed([' '], "switch")
con.nEvent("switch", () => {
	if (levelInfo[level].finalSocket) return
	if (button.state % 2 != 1) {
		button.state++
		button.animate("on")
		timer = Device.getTime()
		return
	}
	if (player.locked) return
	if (levelInfo[level].dash > 0) {
		// Dashing mechanic
		if (player.energyLevel > 0) {
			sound.play("dash.mp3", 1)
			player.speed = player.speed.normalized().multiplied2(3,1.8)
			player.energyLevel -= DASH_ENERGY
		}
	} else {
		// Switching mechanic
		if (player.energyLevel > 0) sound.play("switch.mp3", 0.8, (player.isOn ? 0.85 : 1) + Math.random() * 0.3)
		else sound.play("noSwitch.mp3", 1)
		player.isOn = (!player.isOn) && player.energyLevel > 0
		if (player.isOn) {
			player.setSrc("Assets/on.png")
			player.animationStates.run[2] = 2
		} else {
			player.setSrc("Assets/off.png")
			player.animationStates.run[2] = 6
		}
	}
})

// AMBIENT THINGS
// Ground things
let groundThings = []

// Make socket
// let socket = con.nObj(new Sprite("Assets/socket.png", SOCKET_POS + con.width / 2, con.height / 2 - 16, 16, 16, 1, true))
let socket = con.nObj(new Sprite("Assets/finalSocket.png", 0, 0, 71, 23, 1, true))
socket.drawFn = (function(){
	if (player.isOn) {
		con.color(Math.max(100, 355 - Math.sqrt(player.pos.distSquared(this.pos))))
	} else {
		con.color(255, 100)
	}
})
socket.layer(-1e2)
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
	lampposts[lampposts.length - 1].pos = new Vec2(con.width * (l / 5) * (Math.random() * 0.5 + 1), Math.random() * con.height)

	// Instantiate shine
	lampposts.push(con.nObj(new Sprite("Assets/lamppostShine.png", 0, 0, 27, 59)))
	lampposts[lampposts.length - 1].drawFn = (function(){
		con.blend(1)
		con.color(255, 200)
	})
}

// Instantiate hovers
let hovers = []
for (let h = 0; h < 8; h++) {
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

	// Start hover sound
	sound.play("hover.mp3", 0, 1, true)
	// console.log("Init-ing...")
})

function keepOnScreen(el) {
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
	if (!player.locked) {
		timerText = Format.timeMMSSHH(Device.getTime() - timer)
		if (!levelInfo[level].finalSocket) timerScores.push([timerText, Device.getTime() - timer])
		timerText = Math.round(player.energyLevel * 100) + "% battery\n" + timerText
		setTimeout(() => {
			sound.play("click.mp3")
		}, 250)
		player.onAnimationDone(() => {
			if (!levelInfo[level].finalSocket) {
				fadeTo = -1
			}
		})
		levelDone = true
		totalEnergy += player.energyLevel
	}
	player.locked = true
	player.pos.x -= ((player.pos.x + Math.ceil(player.w / 2)) - s.pos.x + 1.5) * 0.3
	player.pos.y -= ((player.pos.y + 31.5) - s.pos.y) * 0.3

	player.animate("socket")
}

con.preFrame(() => {
	ins.pos.x = Math.floor(con.width / 2) + con.camera.pos.x
})

con.frame(() => {
	// Show instructions
	insShow = CTool.lerp(insShow, button.state * (Math.min(ins.pos.dist(player.pos.added2(8, 10)), 35) / 35), 0.05)
	if (player.pos.x > 25 && ins.srcStr == "Assets/insWasd.png") {
		ins.setSrc("Assets/insSpace.png")
	} else if (con.camera.pos.x > 200 && ins.srcStr == "Assets/insSpace.png") {
		ins.setSrc("Assets/insLamppost.png")
		ins.animationStates.sw[2] *= 2
		ins.animationStates.sw[1] = 2
	} else if (con.camera.pos.x > 600 && ins.srcStr == "Assets/insLamppost.png") {
		// ins.hidden = true
		ins.setSrc("Assets/insSocket.png")
		ins.animationStates.sw[1] = 1
	}
	
	// Set title position
	title.pos.x = con.width / 2
	title.pos.y = con.height / 3

	// Set button position
	button.pos.x = con.width / 2
	button.pos.y = con.height - con.height / 3

	// Move and scale player's spotlight
	spotlight.pos = player.pos.added2(8, 31)
	spotlight.scale = (0.25 + Math.sin(con.frameCount / 30) * 0.01 + player.speed.length() * 0.025 + player.energyLevel * 0.1 + spotlightAdd) * 0.5

	// Hover animation
	if (levelInfo[level].finalSocket) {
		for (let h = 0; h < hovers.length; h++) {
			hovers[h][0].pos.x = -1e4
			hovers[h][1].pos.x = -1e4
		}
	} else {
		for (let h = 0; h < hovers.length; h++) {
			let cd = Math.floor(con.camera.pos.x / (74 * levelInfo[level].hoverSpace))
			hovers[h][0].pos.x = ((cd + h) * (74 * levelInfo[level].hoverSpace) + Math.sin(con.frameCount / 40 + (h + cd) * 7) * 5)
			hovers[h][0].pos.y = (Math.sin(con.frameCount / 100 + (h + cd) * 10) * 0.5 + 0.5) * con.height - 78
			hovers[h][1].pos = hovers[h][0].pos.added2(13, 29)
		}
	}

	// Socket interaction
	if ((!levelInfo[level].finalSocket) && player.isOn && (player.pos.added2(player.w / 2, 32).distSquared(socket.pos) < 161 || player.locked)) useSocket(socket)

	// Layering, animation (for bulbs), and keeping things on screen.
	let ppy = player.finalPos().y + (Math.random() - 0.5) * 3
	if (levelInfo[level].finalSocket) {
		for (let e = 0; e < lampposts.length; e++) lampposts[e].pos.x = -1e4
		for (let h = 0; h < hovers.length; h++) { hovers[h][0].pos.x = -1e4; hovers[h][1].pos.x = -1e4 }
		
		player.flipped = player.speed.x > 0
		player.layer(player.pos.y)
		if (player.animationState != "socket") {
			if (player.speed.length() > 0.1) player.animate("run")
			else player.animate("idle")
		}
	} else {
		for (let e = 0; e < lampposts.length; e++) {
			if (e % 2 == 0) {
				lampposts[e].layer(lampposts[e].pos.y + 33)
				keepOnScreen(lampposts[e])
			} else {
				lampposts[e].pos = lampposts[e - 1].pos.added2(-9, 4)
				lampposts[e].layer(lampposts[e].pos.y + 17)
			}
		}
		for (let h = 0; h < hovers.length; h++) hovers[h][1].layer(hovers[h][1].pos.y + 14)
		for (let d = 0; d < deadBulbs.length; d++) deadBulbs[d].layer(deadBulbs[d].pos.y - 1)
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
				// Go towards player Y position
				bulbs[e].speed.y += (fp.y < ppy ? 1 : -1) * (fp.x < con.width / 2 ? -0.5 : 1) * (player.isOn ? 1 : -1) * levelInfo[level].bulbFollow
			}
		}
	}
	for (let e = 1; e < groundThings.length; e++) keepOnScreen(groundThings[e], 2)
	player.layer(player.pos.y + 3)

	// Add scene bars
	con.color(0)
	blackBarSize = CTool.lerp(blackBarSize, blackBarSizeTo, 0.06)
	con.fillRect(0, 0, con.width, blackBarSize + blackBarOffset)
	con.fillRect(0, con.height - blackBarSize + blackBarOffset, con.width, blackBarSize - blackBarOffset)

	// Fade screen to black/white
	if (fadeMultiplier < fadeTo) fadeMultiplier += fadeSpeed
	else if (fadeMultiplier > fadeTo) fadeMultiplier -= fadeSpeed
	if (Math.abs(fadeMultiplier - fadeTo) < fadeSpeed / 2) fadeMultiplier = fadeTo
	con.blend(fadeTo <= 0 ? 0 : 1)
	con.color(fadeMultiplier < 0 ? 0 : 255, Math.abs(fadeMultiplier) * 255)
	con.fillRect(0, 0, con.width, con.height)
	if (levelDone && Math.abs(fadeMultiplier) >= 1) { loadLevel() }

	// Timer/ending text
	con.blend(0)
	con.color(fadeMultiplier < 0 ? 200 : 40, Math.abs(fadeMultiplier) * 255)
	let st = timerText.split("\n")
	// let 
	for (let l = 0; l < st.length; l++) {
		con.text(st[l], con.width / 2 - st[l].length * (2.5 * ts), con.height / 2 + (ts * 5) * l - (2.5 * ts * st.length))
	}

	// Add bulbs progressively
	if (player.pos.x / socket.pos.x > addBulbs[0]) newBulb(addBulbs.shift())
})

con.pFrame(() => {
	// Energy drain
	// if (player.isOn && player.animationState != "socket" && !levelInfo[level].dash) player.energyLevel -= ON_ENERGY_DRAIN
	if (player.energyLevel <= 0 && !levelInfo[level].finalSocket) {
		player.energyLevel = 0
		if (levelInfo[level].dash == 0) {
			player.isOn = false
			player.setSrc("Assets/off.png")
			player.animationStates.run[2] = 6
		}
	}
	for (let h = 0; h < hovers.length; h++) {
		if (player.intersects(hovers[h][1]) && player.isOn) {
			player.energyLevel -= HOVER_ENERGY_DRAIN
			break
		}
	}

	// Energy gain
	for (let l = 0; l < lampposts.length; l += 2) {
		if (player.intersects(lampposts[l])) {
			player.energyLevel += LAMPPOST_CHARGE * (player.isOn ? ON_CHARGE_MULTIPLIER : 1)
			break
		}
	}
	
	// Energy cap
	if (player.energyLevel > 1 && !levelInfo[level].finalSocket) player.energyLevel = 1

	// Physics things
	if (player.pos.x < PLAYER_SCREEN_MARGIN * 2)
		player.speed.x += (player.pos.x - PLAYER_SCREEN_MARGIN * 2) ** 2 / 2e4
	for (let e = 0; e < bulbs.length; e++) {
		for (let o = 0; o < bulbs.length; o++) {
			if (e == o) continue
			let d = Math.sqrt((bulbs[e].pos.x - bulbs[o].pos.x) ** 2 + ((bulbs[e].pos.y - bulbs[o].pos.y) * 1.5) ** 2)
			if (d > 0) {
				let a = Math.atan2(bulbs[e].pos.x - bulbs[o].pos.x, bulbs[e].pos.y - bulbs[o].pos.y)
				if (d < 13 || (d < 64 && e > 0)) {
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
	if (levelInfo[level].finalSocket) {
		let d = player.pos.dist(socket.pos)
		switch (scenePart) {
			case 0: // Walk to socket
				player.speed.addVec(new Vec2(
					(socket.pos.x - (player.pos.x + player.w / 2)),
					(socket.pos.y - (player.pos.y + player.h * 0.92))
				).normalized().divideRet(player.isOn ? 110 : 130))
				if (sceneID == 0 && d < 90) scenePart++
				else if (sceneID == 1 && d < 60) scenePart++
				else if (sceneID == 2 && d < 120) scenePart += 3
				break
			case 1: // Die
				spotlight.hidden = true
				deathAnim(player, true)
				con.follow(socket, 0.004, new Vec2(0, 0))
				scenePart++
				if (sceneID == 1) {
					setTimeout(() => { doSparks() }, 2000)
					setTimeout(() => { doSparks() }, 2500)
					setTimeout(() => { doSparks() }, 3000)
				}
				setTimeout(() => {
					finalFade()
				}, 5000)
				break
			case 2: // Fade out
				break
			case 3: // Live
				player.speed.addVec(new Vec2(
					(socket.pos.x - (player.pos.x + player.w / 2)),
					(socket.pos.y - (player.pos.y + player.h * 0.92))
				).normalized().divideRet(160))
				if (d < 35) scenePart++
				break
			case 4: // Socket
				useSocket(socket)
				if (player.locked) {
					setTimeout(() => {
						scenePart++
						sound.play("final.mp3")
					}, 2000)
					setTimeout(() => { scenePart++ }, 5500)
					scenePart++
				}
				break
			case 6:
				// Camera shake
				con.camera.pos.x += (Math.random() - 0.5) * 0.5
				con.camera.pos.y += (Math.random() - 0.5) * 0.5
				spotlightAdd += 0.0003
			case 5: // Wait for fadeout...
				useSocket(socket)
				player.energyLevel += 0.001
				break
			case 7:
				// player.energyLevel += 0.001
				// spotlight.scale += 0.01
				setTimeout(() => { finalFade() }, 500)
				scenePart++
			case 8:
				player.energyLevel += 0.001
				spotlightAdd += 0.0008

				// Camera shake
				blackBarOffset = Math.floor((Math.random() - 0.5) * spotlightAdd * 9)
				con.camera.pos.x += (Math.random() - 0.5) * 4 * spotlightAdd
				con.camera.pos.y += (Math.random() - 0.5) * 4 * spotlightAdd
				if (spotlightAdd > 2) scenePart++
				break
		}
	} else {
		if (button.state % 2 == 1 && !player.locked)
			player.speed.addVec(new Vec2(
				(con.eventOngoing("right") ? 1    : 0) - (con.eventOngoing("left") ? 1    : 0)
				+ (con.eventOngoing("down")  ? 0.01 : 0) - (con.eventOngoing("up")   ? 0.01 : 0),
				(con.eventOngoing("down")  ? 1    : 0) - (con.eventOngoing("up")   ? 1    : 0) * 0.5
			).normalized().divideRet(
				player.isOn ? 50 : 180
			))
	}
})

// DEALING WITH LEVELS
let totalEnergy = 0
let level = -1 //-1
let levelDone = false
let levelInfo = [
	{width: 1000, bulbs:  0, addBulbs: 15, bulbFollow: 0.0020, hoverSpace: 2.0, dash: 0, finalSocket: false},
	{width: 1200, bulbs: 15, addBulbs: 15, bulbFollow: 0.0025, hoverSpace: 1.8, dash: 0, finalSocket: false},

	{width: 1500, bulbs: 20, addBulbs: 20, bulbFollow: 0.0030, hoverSpace: 1.0, dash: 1, finalSocket: false},
	{width: 1800, bulbs: 25, addBulbs: 30, bulbFollow: 0.0035, hoverSpace: 0.8, dash: 1, finalSocket: false},

	{width: 1500, bulbs: 25, addBulbs: 30, bulbFollow: 0.0030, hoverSpace: 1.0, dash: 2, finalSocket: false},
	{width: 1800, bulbs: 30, addBulbs: 30, bulbFollow: 0.0035, hoverSpace: 0.8, dash: 2, finalSocket: false},

	{width:  100, bulbs:  0, bulbFollow: 0.0000, hoverSpace:  -1, dash: false, finalSocket: true}
]

function loadLevel() {
	if (level >= 0) {
		timer = Device.getTime()
		ins.hidden = true
	}
	levelDone = false
	level++
	if (level >= levelInfo.length) {
		console.log("No more levels.")
		level = 0
		return
	}
	console.log("Loading level", level)

	// Makes the level short for testing.
	levelInfo[level].width /= 100

	player.pos.x = 0
	player.pos.y = con.height / 2 - player.h / 2

	socket.pos.x = levelInfo[level].width + con.width / 2
	socket.pos.y = con.height / 2

	player.animate("idle")
	player.isOn = levelInfo[level].dash > 0
	if (player.isOn) player.setSrc("Assets/on.png")
	else  player.setSrc("Assets/off.png")
	player.energyLevel = INIT_ENERGY
	player.locked = false
	con.camera.constrains = new Rect(0, 0, levelInfo[level].width, 0)
	con.camera.pos.x = 0

	player.resolveCollision = (levelInfo[level].dash < 2)

	clearBulbs()
	for (let _ = 0; _ < levelInfo[level].bulbs; _++) newBulb()
	addBulbs = [...new Array(levelInfo[level].addBulbs).fill(0)].map((e, i, a) => i / a.length)

	// console.log(levelInfo[level])
	socket.animation[0] = levelInfo[level].finalSocket + 0

	// fadeScreenStep *= -1
	// fadeStopAtZero = true
	fadeTo = 0

	if (level == levelInfo.length - 1) runFinal()
}

// Final Scenes
let sceneID = -1
let scenePart = 0
function runFinal() {
	for (let b = 0; b < deadBulbs.length; b++) {
		deadBulbs[b].fadeOut = 0
	}
	sceneID = totalEnergy / 6 //(levelInfo.length - 1)
	player.energyLevel = sceneID
	if (sceneID < 0.5) {
		sceneID = 0
	} else if (sceneID < 0.8) {
		sceneID = 1
	} else {
		sceneID = 2
		player.isOn = true
		player.setSrc("Assets/on.png")
	}
	blackBarSizeTo = 20
}

function doSparks() {
	sound.play("spark.mp3", 0.2, 1 + Math.random() * 0.5)
	button.hidden = true
	let s = con.nObj(new Sprite("Assets/spark.png", socket.pos.x - 12 + Math.random() * 10, socket.pos.y - 4 + Math.random() * 8, 16, 16, 1, true))
	s.addAnimation("sp", {start: 0, end: 7, timer: 1, loop: false, pause: -1}, true)
}

function finalFade() {
	if (timerScores.length == 0) {
		timerScores.push(["xx:xx:xx", 0])
	}
	timerText = [
		"You\nfit in",
		"You tried,\nyet you fit in",
		"After all that, you\ndid great. Keep going,\nand dont fit in."
	][sceneID] + "\n\n" + timerScores.map((e, i) => "LVL " + (i + 1) + " " + e[0]).join("\n") + "\nTotal " + Format.timeMMSSHH(timerScores.map(e => e[1]).reduce((a, b) => a + b))
	fadeSpeed *= 0.5
	fadeTo = (sceneID == 2 ? 1 : -1)
}

loadLevel()
