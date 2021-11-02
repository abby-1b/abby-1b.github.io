
window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(cb, e){
				window.setTimeout(cb, 1000 / 45)
			}
})()

window.requestInterval = function(fn, delay, arg) {
	if (!window.requestAnimationFrame
		&& !window.webkitRequestAnimationFrame
		&& !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame)
		&& !window.oRequestAnimationFrame
		&& !window.msRequestAnimationFrame)
			return window.setInterval((arg)=>{fn.call(arg)}, delay, arg)
	let start = Date.now(),
		handle = new Object(),
		last = Date.now()
	function loop() {
		let current = Date.now(), delta = current - start
		if (delta >= delay) {
			fn.call(arg)
			start = current - (delta % delay)
		}
		last = current
		handle.value = requestAnimFrame(loop)
	}
	handle.value = requestAnimFrame(loop)
	return handle
}

class Console {
	constructor(h, col) {
		let metaTags = {
			"viewport": "width=device-width,initial-scale=1,maximum-scale=1.0,user-scalable=0",
			"apple-mobile-web-app-capable": "yes"
		}
		for (let mt in metaTags) {
			let meta = document.createElement('meta')
			meta.name = mt
			meta.content = metaTags[mt]
			document.head.appendChild(meta)
		}
		document.body.style.margin = document.body.style.padding = "0"
		document.body.style.backgroundColor = col | "white"
		this.el = document.createElement("canvas")
		this.el.style.width = "100vw"
		this.el.style.height = "100vh"
		window.onresize = () => {
			this.width = Math.ceil((window.innerWidth / window.innerHeight) * h)
			this.height = Math.ceil(h)
			this.el.width = this.width
			this.el.height = this.height
		}
		window.onorientationchange = window.onresize
		window.ondeviceorientation = window.onresize
		window.onresize()
		this.el.style.objectFit = "contain"
		this.el.style.position = "fixed"
		this.el.style.transform = "translate(-50%,-50%)"
		this.el.style.left = this.el.style.top = "50%"
		this.ctx = this.el.getContext('2d', {alpha: false})
		this.ctx.imageSmoothingEnabled= false
		this.imageIndexes = {}
		this.imageElements = []
		this.backgroundColor = col
		this.objects = []
		this.camPos = new Vec2(0, 0)
		this.followInterval = 0
		this.physics = {
			gravity: new Vec2(0.0, 0.015),
			// friction: new Vec2(0.9, 0.995)
			friction: new Vec2(0.9, 0.997),
			groundFriction: new Vec2(0.9, 0.997),

			cZeroThresh: 0.001 // The speed at witch the engine can consider the object stationary.
		}
		this.frameTotalCollisions = 0
		this.fonts = {"": "20px Arial"}
		this.nFont("std", new CImage(`>J?[UFF9^9;[N?JH:9OR+Y^9*9[R6?$1_(_XAVF6^J1IM_JEV9N(^.$>PA[S'I]IPTBYG?^?C_"[W9W_XO_=N_^[F^SKU^K_#=")W _YG_ 1$09@#_!O]F9F%^B.<0$0!OF?8-V?P, ,  ,  G57("6U`, 4))
		this.font("std")
		this.events = {}
		this.initFn    = () => {}
		this.preLoopFn = () => {}
		this.loopFn    = () => {}
		this.frameCount = 0
		document.body.appendChild(this.el)
		document.body.style.overflow = "hidden"
		this.keys = {}
		window.addEventListener('keydown', e => { if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now(); if (e.key == ' ') e.preventDefault() })
		window.addEventListener('keyup'  , e => { if (  e.key.toLowerCase() in this.keys ) delete this.keys[e.key.toLowerCase()] })
	}

	// Controls
	nEvent(n, f) {
		this.events[n] = [f, false]
	}

	onKeyPressed(k, n) {
		if (typeof k === "string") {
			window.addEventListener('keydown', e => {
				if (e.key == k && !e.repeat) {
					this.events[n][1] = true
					this.events[n][0]()
				}
			})
			window.addEventListener('keyup', e => {
				if (e.key == k)
					this.events[n][1] = false
			})
		} else {
			window.addEventListener('keydown', e => {
				if (k.includes(e.key) && !e.repeat) {
					this.events[n][1] = true
					this.events[n][0]()
				}
			})
			window.addEventListener('keyup', e => {
				if (k.includes(e.key))
					this.events[n][1] = false
			})
		}
	}

	eventOngoing(n) {
		return this.events[n][1]
	}

	isKeyDown(k) {
		return k in this.keys
	}

	// Touch
	touchArea(h, v, events) {
		this.currentTouches = {}
		var ths = this
		window.addEventListener("touchstart", function(e) {
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				let i = Math.floor(Math.round(e.changedTouches[ct].clientX) * h / (window.innerWidth + 1))
				  + h * Math.floor(Math.round(e.changedTouches[ct].clientY) * v / (window.innerHeight + 1))
				ths.currentTouches[e.changedTouches[ct].identifier] = i
				try {
					ths.events[events[i]][1] = true
					ths.events[events[i]][0]()
				} catch (e) {
					console.error("Event `" + events[i] + "` doesn't exist.")
				}
			}
		})
		window.addEventListener("touchmove", function(e) {
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				let i = Math.floor(Math.round(e.changedTouches[ct].clientX) * h / (window.innerWidth  + 1))
				  + h * Math.floor(Math.round(e.changedTouches[ct].clientY) * v / (window.innerHeight + 1))
				if (i != ths.currentTouches[e.changedTouches[ct].identifier]) {
					ths.events[events[ths.currentTouches[e.changedTouches[ct].identifier]]][1] = false
					ths.currentTouches[e.changedTouches[ct].identifier] = i
					ths.events[events[i]][1] = true
					ths.events[events[i]][0]()
				}
			}
		})
		window.addEventListener("touchend", function(e) {
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				ths.events[events[ths.currentTouches[e.changedTouches[ct].identifier]]][1] = false
				delete ths.currentTouches[e.changedTouches[ct].identifier]
			}
		})
	}

	// Camera
	follow(el, interval, speedPos) {
		this.following = el
		this.followInterval = [interval, speedPos]
	}

	// Init, runs when everything is ready. Or in this case, instantly.
	init(fn) { fn() }

	// Runs before the main loop, before the frame elements are moved.
	preLoop(fn) {
		this.preLoopFn = fn
	}
	
	// Main library loop
	loop(fn) {
		// Yes, this runs on 45 fps. Deal with it.
		this.loopFn = fn
		this.lastTime = Date.now()
		this.frameRate = 45
		window.requestInterval(this.updateAll, 1000 / 45, this)
		// window.setInterval(function(ths){
		// 	ths.updateAll.call(ths)
		// }, 1000 / 45, this)
	}

	// The loop!
	updateAll() {

		// Calculate frame rate
		this.frameRate = CTool.lerp(this.frameRate, 1000 / (Date.now() - this.lastTime), 0.05)
		this.lastTime = Date.now()
		// Move camera towards targeted object
		if (this.following)
			this.camPos.lerp(
				(this.following.pos.x - this.width  / 2) + this.following.speed.x * this.followInterval[1].x + this.following.w * this.following.s * 0.5,
				(this.following.pos.y - this.height / 2) + this.following.speed.y * this.followInterval[1].y + this.following.h * this.following.s * 0.5,
				this.followInterval[0])
		// Clear screen
		this.ctx.fillStyle = this.backgroundColor
		this.ctx.fillRect(0, 0, this.width, this.height)

		this.preLoopFn()

		// Loop through all objects, and then again for PhysicsActors
		this.frameTotalCollisions = 0
		for (let o = 0; o < this.objects.length; o++) {
			if (this.objects[o].constructor.name == "PhysicsActor") {
				this.objects[o].collided = false
				this.objects[o].onGround = false
				this.objects[o].physics()
			}
			this.objects[o].draw()
		}
		
		this.loopFn() // Call user loop function
		this.frameCount++ // Increment frame count
	}

	// Adds something to the scene.
	nObj(obj) {
		obj.parentCon = this
		if (["TileMap".includes(obj.type)])
			return this.objects[this.objects.push(obj) - 1]
		else
			return this.objects[this.objects.push(this.imageThing(obj)) - 1]
	}

	// Removes an object from the scene.
	// Does *not* remove any image elements or sources.
	rObj(obj) {
		this.rIdx(this.objects.indexOf(obj))
	}

	// Removes an object by its index in the `this.objects` list.
	rIdx(idx) {
		return this.objects.splice(idx, 1)
	}

	// Adding any image thing. Supposed to be private.
	imageThing(spr) {
		console.log("imageThing:", spr)
		if (spr.src.isText) {
			this.imageIndexes[spr.src] = this.imageElements.push(spr.src.canvas) - 1
			spr.imageLoaded()
		} else {
			if (spr.src in this.imageIndexes) {
				if (this.imageElements[this.imageIndexes[spr.src]].complete) {
					spr.imageLoaded()
				} else {
					this.imageElements[this.imageIndexes[spr.src]].addEventListener('load', () => {
						spr.imageLoaded()
					})
				}
			} else {
				let i = document.createElement("img")
				i.className += "noSmooth"
				i.addEventListener('load', () => { spr.imageLoaded() })
				i.src = spr.src
				this.imageIndexes[spr.src] = this.imageElements.push(i) - 1
			}
		}
		spr.srcStr = spr.src
		spr.src = this.imageIndexes[spr.src]
		return spr
	}

	// Sets the background color
	background(col) {
		this.backgroundColor = col
	}

	// Font name, CImage
	nFont(name, img) {
		this.fonts[name] = img
	}

	// Sets the font that's currently being used
	font(name) {
		this.currentFont = name
	}

	text(text, x, y) {
		let f = this.fonts[this.currentFont].canvas
		let charMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?[]_*|+-/\\.()@\"',<>&"
		text = (text + '').toUpperCase().split('').map(e => charMap.indexOf(e))
		for (let c = 0; c < text.length; c++) {
			this.ctx.drawImage(f, text[c] * 4, 0, f.height, f.height, x + c * (f.height + 1), y, f.height, f.height)
		}
	}

	rect(x, y, w, h, c) {
		this.ctx.fillStyle = c
		this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h))
	}

	point(x, y, c) {
		this.ctx.fillStyle = c
		this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
	}
}

// A type of source
class CImage {
	constructor(text, h) {
		this.isText = true
		this.canvas = CTool.canvasFromString(text, h)
		this.canvas.className += "noSmooth"
	}
}

// The constructor for anything that renders on the programmer's side.
class Sprite {
	constructor(src, x, y, w, h, scale, centered) {
		this.type = "Sprite"
		this.src = src
		this.pos = new Vec2(x, y)
		this.w = w
		this.h = h
		this.s = scale | 1
		this.c = centered
		this.animation = [0, 0, true] // frame, timer, paused
		this.animationOffset = 0
		this.animationStates = {} // start, end, timer, loop, pause frame
		this.animationState = ""
		this.showHitbox = false // false
		this.flipped = false
		this.collided = false
		this.collisionEvents = []
		this.hb = {top: 0, bottom: 0, left: 0, right: 0, slr: 0, stb: 0}
	}

	hbOffsets(hb) {
		this.hb = hb
		this.hb.slr = hb.left + hb.right
		this.hb.stb = hb.top + hb.bottom
	}

	getHb() {
		if (this.flipped) {
			return [
				this.pos.x - (this.c ? this.w * 0.5 : 0) + this.hb.right * this.s,
				this.pos.y - (this.c ? this.h * 0.5 : 0) + this.hb.top * this.s,
				this.w * this.s - (this.hb.right * this.s + this.hb.left * this.s), this.h * this.s - (this.hb.top * this.s + this.hb.bottom * this.s)
			]
		}
		return [
			this.pos.x - (this.c ? this.w * 0.5 : 0) + this.hb.left * this.s,
			this.pos.y - (this.c ? this.h * 0.5 : 0) + this.hb.top * this.s,
			this.w * this.s - (this.hb.left * this.s + this.hb.right * this.s), this.h * this.s - (this.hb.top * this.s + this.hb.bottom * this.s)
		]
	}

	drawHb() {
		if (this.flipped) {
			this.parentCon.ctx.strokeRect(
				Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) + this.parentCon.camPos.x) + 0.5 + this.hb.right * this.s,
				Math.floor(this.pos.y - (this.c ? this.h / 2 : 0) + this.parentCon.camPos.y) + 0.5 + this.hb.top * this.s,
				this.w * this.s - (1 + this.hb.right * this.s + this.hb.left * this.s), this.h * this.s - (1 + this.hb.top * this.s + this.hb.bottom * this.s))
		} else {
			this.parentCon.ctx.strokeRect(
				Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) + this.parentCon.camPos.x) + 0.5 + this.hb.left * this.s,
				Math.floor(this.pos.y - (this.c ? this.h / 2 : 0) + this.parentCon.camPos.y) + 0.5 + this.hb.top * this.s,
				this.w * this.s - (1 + this.hb.left * this.s + this.hb.right * this.s), this.h * this.s - (1 + this.hb.top * this.s + this.hb.bottom * this.s))
		}
	}

	imageLoaded() {
		// Called when an image loads. Interesting.
	}

	addAnimation(nam, dict, play) {
		this.animationStates[nam] = [
			dict.start,
			dict.end,
			dict.timer,
			dict.loop,
			dict.pause
		]
		if (play) {
			this.animationState = nam
			this.animation[2] = false
			this.animation[0] = this.animationStates[this.animationState][0]
		}
	}

	animate(nam) {
		if (this.animationState == nam) return
		this.animationState = nam
		this.animation[1] = this.animationStates[this.animationState][2]
		this.animation[2] = false
		this.animation[0] = this.animationStates[this.animationState][0]
	}

	paused() { return this.animation[2] }
	pause() { this.animation[2] = true }
	play(n) { this.animation[2] = false; if (n != undefined) { this.animation[0] = n } }
	frame(n) { this.animation[0] = n }

	collidedWith(el, d) {
		for (let e = 0; e < this.collisionEvents.length; e++)
			this.collisionEvents[e](el, d)
	}

	onCollision(fn) {
		this.collisionEvents.push(fn)
	}

	draw() {
		// Animation
		if (!this.animation[2]) {
			if (this.animation[1]-- == 0) {
				this.animation[1] = this.animationStates[this.animationState][2]
				if (this.animation[0] == this.animationStates[this.animationState][4])
					this.animation[2] = true
				if (this.animation[0]++ >= this.animationStates[this.animationState][1]) {
					if (this.animationStates[this.animationState][3]) {
						this.animation[0] = this.animationStates[this.animationState][0]
					} else {
						this.animation[2] = true
						this.animation[0]--
					}
				}
			}
		}
		// Sprite
		if (!this.parentCon.imageElements[this.src].complete) return
		let repeatedPattern = this.parentCon.ctx.createPattern(this.parentCon.imageElements[this.src], 'repeat')
		this.parentCon.ctx.fillStyle = repeatedPattern
		repeatedPattern.setTransform(new DOMMatrix([(this.flipped ? -this.s : this.s), 0, 0, this.s,
			Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) - Math.round(this.parentCon.camPos.x)) - (this.flipped ? (-(this.animation[0] + 1 + this.animationOffset) * this.w) : ((this.animation[0] + this.animationOffset) * this.w)) * this.s,
			Math.floor(this.pos.y - (this.c ? this.h / 2 : 0) - Math.round(this.parentCon.camPos.y))
		]))
		this.parentCon.ctx.fillRect(
			Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) - Math.round(this.parentCon.camPos.x)),
			Math.floor(this.pos.y - (this.c ? this.h / 2 : 0) - Math.round(this.parentCon.camPos.y)),
			this.w * this.s, this.h * this.s)
		// Hitbox
		if (this.showHitbox) {
			this.parentCon.ctx.strokeStyle = (this.collided ? "#f0f9" : "#f009")
			this.drawHb()
		}
	}
}

// Old tile class. Unused.
class Tile extends Sprite {
	constructor(src, x, y, w, h, s, centered) {
		super(src, x, y, w, h, s, centered)
		this.type = "Tile"
		this.hasPhysics = true
	}
}

// Declares a set of tiles from a source image.
class TileSet {
	/**
	 * Utility for drawing adaptive tilesets quickly.
	 * @param {String} src Source for the tileset
	 * @param {number} tw Tile width
	 * @param {number} th Tile height
	 */
	constructor(src, tw, th) {
		this.type = "TileSet"
		this.src = src
		this.tw = tw
		this.th = th

		this.tiles = []
		this.loaded = false
		this.loadCb = () => {}
		
		CTool.getImagePixels(src, (data, dw, dh) => {
			for (let ty = 0; ty < dh; ty += th) {
				for (let tx = 0; tx < dw; tx += tw) {
					let ct = []
					for (let y = 0; y < th; y++) {
						for (let x = 0; x < tw; x++) {
							let i = ((x + tx) + (y + ty) * dw) * 4
							ct.push(data[i])
							ct.push(data[i + 1])
							ct.push(data[i + 2])
							ct.push(data[i + 3])
						}
					}
					this.tiles.push(CTool.canvasFromPixels(ct, tw, th))
				}
			}
			this.loaded = true
			this.loadCb()
		})
	}

	onDone(callback) {
		if (this.done) callback()
		else this.loadCb = callback
	}
}

// Declares an arrangement of a tileset on a given map.
class TileMap {
	constructor(ts, w, h, dt) {
		this.type = "TileMap"
		this.tileSet = ts
		this.wt = w
		this.ht = h
		this.x = 0
		this.y = 0
		this.map = dt
		this.cnv = document.createElement('canvas')
		this.cnv.width  = this.tileSet.tw * this.wt
		this.cnv.height = this.tileSet.th * this.ht
		this.ctx = this.cnv.getContext('2d')

		// let nbToIdx = [
		// 	10, 14, 6, 2,
		// 	11, 15, 7, 3,
		// 	 9, 13, 5, 1,
		// 	 8, 12, 4, 0
		// ]

		let nbToIdx = [
			15,  3, 6, 2,
			11, 15, 7, 3,
			 9, 13, 5, 1,
			 8, 12, 4, 0
		]

		this.tileSet.onDone(() => {
			for (let i = 0; i < this.ht * this.wt; i++) {
				if (dt[i] != 0) {
					let ti = dt[i]
					let mv = 0
					if (dt[i - w] == ti) mv |= 1 // UP
					if (dt[i + w] == ti) mv |= 2 // DOWN
					if (dt[i - 1] == ti) mv |= 4 // LEFT
					if (dt[i + 1] == ti) mv |= 8 // RIGHT
					if (i == 6) console.log(mv, nbToIdx[mv])
					this.ctx.drawImage(this.tileSet.tiles[nbToIdx[mv]], (i % this.wt) * this.tileSet.tw, Math.floor(i / this.wt) * this.tileSet.th)
				}
				this.ctx.font = "8px Arial"
				// this.ctx.fillText(i, (i % this.wt) * this.tileSet.tw, Math.floor(i / this.wt) * this.tileSet.th + 7)
			}
		})
	}

	draw() {
		if (!tileSet.loaded) returns
		this.parentCon.ctx.drawImage(this.cnv, this.x, this.y)
	}
}

class PhysicsActor extends Sprite {
	constructor(src, x, y, w, h, s, centered) {
		super(src, x, y, w, h, s, centered)
		this.type = "PhysicsActor"
		this.hasPhysics = true
		this.speed = new Vec2(0, 0)
		this.locked = false
		this.hb = {top: 0, bottom: 0, left: 0, right: 0}
		this.bounce = 0
		this.groundFriction = true
	}

	setFriction(x, y) {
		return (this.friction = new Vec2(x, y))
	}

	intersects(hbe) {
		let b1 = this.getHb()
		let b2 = hbe.getHb()

		if (b1[1] + b1[3] > b2[1]
		&&  b1[0] + b1[2] > b2[0]
		&& (b1[1] + b1[3]) - b1[3] < (b2[1] + b2[3])
		&& (b1[0] + b1[2]) - b1[2] < (b2[0] + b2[2]))
			return true
		return false
	}

	physics(el) {
		for (let pf = 0; pf < 5; pf++) {
			this.speed.x = (this.speed.x + this.parentCon.physics.gravity.x) * this.parentCon.physics.friction.x
			this.speed.y = (this.speed.y + this.parentCon.physics.gravity.y) * this.parentCon.physics.friction.y
			this.pos.x += this.speed.x
			this.pos.y += this.speed.y
			for (let t = 0; t < this.parentCon.objects.length; t++) {
				if (this.parentCon.objects[t] == this
					|| (!this.parentCon.objects[t].hasPhysics)
					|| this.parentCon.objects[t].pos.cartesianDist(this.pos) > 
					(this.w + this.h + this.parentCon.objects[t].w + this.parentCon.objects[t].h)
					* (this.s + this.parentCon.objects[t].s)) continue
				this.avoidCollision(this.parentCon.objects[t])
			}
		}
	}

	avoidCollision(el) {
		if (this.intersects(el)) {
			this.parentCon.frameTotalCollisions++
			let b1 = this.getHb()
			let b2 = el.getHb()
			el.collided = true
			this.collided = true
			
			let rd = ((b1[0] + b1[2]) - b2[0])
			let ld = ((b2[0] + b2[2]) - b1[0])
			let td = ((b1[1] + b1[3]) - b2[1])
			let bd = ((b2[1] + b2[3]) - b1[1])
			if (td < rd && td < ld && td < bd) {
				this.pos.y -= td
				if (this.bounce != 0) {
					// This stops the thing from infinitely bouncing.
					if (this.speed.y < 0.1 && this.speed.y != 0) {
						this.pos.y += td / 2
						this.speed.y = 0
					} else {
						this.speed.y = Math.min(-this.speed.y * this.bounce, 0)
					}
				} else
					this.speed.y = Math.min(this.speed.y, 0)
				this.onGround = true
				this.collidedWith(el, "top")
			} else if (bd < rd && bd < ld) {
				this.pos.y += bd
				if (this.bounce != 0)
					this.speed.y = Math.max(-this.speed.y * this.bounce, 0)
				else
					this.speed.y = Math.max(this.speed.y, 0)
				this.collidedWith(el, "bottom")
			} else if (ld <= rd) {
				this.pos.x += ld
				this.speed.x = -this.speed.x * this.bounce
				this.collidedWith(el, "left")
			} else {
				this.pos.x -= rd
				this.speed.x = -this.speed.x * this.bounce
				this.collidedWith(el, "right")
			}
		} else {
			el.collided = false
		}
	}
}

class CTool {

	/**
	 * Turns a number to binary
	 * @param {number} n Number to turn to binary
	 * @param {number} [l] Minimum length of string to return. Defaults to 0
	 * @returns {String}
	 */
	static bin(n, l) {
		let r = n.toString(2)
		if (l === undefined) return r
		while (r.length < l)
			r = "0" + r
		return r
	}

	/**
	 * Rounds a value to a set number of decimal places.
	 * @param {number} n Value to round
	 * @param {number} [d] Decimal places. Defaults to zero.
	 * @returns {number}
	 */
	static round(n, d) {
		d = 10 ** (d || 0)
		return Math.round(n * d) / d
	}

	/**
	 * Linear interpolation from one value to another.
	 * @param {number} a Value to interpolate from
	 * @param {number} b Value to interpolate to
	 * @param {number} v Percent to interpolate between `a` and `b`
	 * @returns {number}
	 */
	static lerp(a, b, v) {
		return a * (1 - v) + b * v
	}

	/**
	 * Maps a value from one range to another. Supports values outside of the original range, scaling accordingly.
	 * @param {number} v Value to map
	 * @param {number} ir1 Start of initial range
	 * @param {number} ir2 End of initial range
	 * @param {number} or1 Start of target range
	 * @param {number} or2 End of target range
	 * @returns {number}
	 */
	static map(v, ir1, ir2, or1, or2) {
		return or1 + (or2 - or1) * (v - ir1) / (ir2 - ir1)
	}

	/**
	 * Gets pixels from an image and returns them with a callback function.
	 * @param {String} src Source of the image to load
	 * @param {Function} callback Callback called when the image pixels are gotten
	 */
	static getImagePixels(src, callback) {
		var img = document.createElement("img")
		img.onload = function() {
			var canvas = document.createElement('canvas')
			canvas.width = img.width
			canvas.height = img.height
			canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
			callback(canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data, img.width, img.height)
		}
		img.src = src
	}


	/**
	 * Gets an editable canvas from a source string. 
	 * @param {String} str Data string that contains the image data.
	 * @param {number} h The height of the canvas, as it's not encoded in the string.
	 * @returns {HTMLCanvasElement}
	 */
	 static canvasFromString(str, h) {
		str = str.split('').map(e => CTool.bin(e.charCodeAt(0) - 32, 6)).join('').split('')
		let canvas = document.createElement("canvas")
		canvas.height = h
		canvas.width = Math.ceil(str.length / h)
		let ctx = canvas.getContext('2d')
		let dat = ctx.getImageData(0, 0, canvas.width, canvas.height)
		for (let i = 0; i < str.length; i++)
			dat.data[(Math.floor(i / canvas.height) + (i % canvas.height) * canvas.width) * 4 + 3] = str[i] == "0" ? 0 : 255
		ctx.putImageData(dat, 0, 0)
		return canvas
	}

	/**
	 * Gets an editable canvas from an array of pixels.
	 * @param {Array} data Pixels
	 * @param {number} w Width
	 * @param {number} h Height
	 */
	static canvasFromPixels(data, w, h) {
		let canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		let ctx = canvas.getContext('2d')
		let dat = ctx.getImageData(0, 0, w, h)
		for (let i = 0; i < data.length; i++) dat.data[i] = data[i]
		ctx.putImageData(dat, 0, 0)
		return canvas
	}

	/**
	 * Finds a specific tile in a tile array.
	 * @param {Array} tiles List of tiles
	 * @param {string} type Type of tile to find
	 * @param {Vec2} [fallBack] Fallback when there's no tile found.
	 * @returns {Vec2}
	 */
	static findTilePos(tiles, type, fallBack) {
		let offs = fallBack ? fallBack : new Vec2(0, 0)
		for (let b = 0; b < tiles.length; b++) {
			if (tiles[b].type == type) {
				offs.set(tiles[b].x, tiles[b].y)
				break
			}
		}
		return offs
	}

	/**
	 * Gets a tile array from an image source
	 * @param {String} src 
	 * @param {Array} types 
	 * @param {Function} callback 
	 */
	static tileMapFrom(src, types, callback) {
		this.getImagePixels(src, (px, w, h) => {
			function getType(p1, p2, p3) {
				for (let t in types)
					if (types[t][1] == p1 && types[t][2] == p2 && types[t][3] == p3)
						return t
				return `${p1},${p2},${p3}`
			}
			// Return bars
			let bars = []
			// Tiles already iterated through
			let did = []
			for (let p = 0; p < px.length; p += 4) {
				if (did.includes(p)) continue
				did.push(p)
				let x = ((p / 4) % w) - 8
				let y = (Math.floor((p / 4) / w)) - 8
				if (px[p + 3] != 0) {
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
			for (let b = 0; b < bars.length; b++) {
				if (types[bars[b][4]] === undefined) CTool.error("Color", bars[b][4], "not in table.")
				bars[b] = {
					type: types[bars[b][4]][0],
					x: bars[b][0],
					y: bars[b][1],
					w: bars[b][2],
					h: bars[b][3]
				}
			}
			callback(bars)
		})
	}

	/**
	 * Logs an error to the console.
	 * @param  {...any} things The arguments for this error
	 */
	static error(...things) {
		console.error(things.join(" "))
	}
}

class Vec2 {
	constructor(x, y) {
		this.x = x
		this.y = y
	}

	rounded() {
		return new Vec2(Math.round(this.x), Math.round(this.y))
	}

	log() {
		console.log(this + '')
		return this
	}

	lerp(x, y, a) {
		this.x = CTool.lerp(this.x, x, a)
		this.y = CTool.lerp(this.y, y, a)
	}

	set(x, y) {
		this.x = x
		this.y = y
	}

	// Multiplies, doesn't return
	multiply(v) {
		this.x *= v
		this.y *= v
	}

	// Multiplies by vector
	multiplyVec(v) {
		this.x *= v.x
		this.y *= v.y
	}

	// Multiplies, returns
	multiplyRet(v) {
		this.x *= v
		this.y *= v
		return this
	}

	// Multiplied, doesn't mutate
	multiplied(v) {
		return new Vec2(this.x * v, this.y * v)
	}

	addVec(v) {
		this.x += v.x
		this.y += v.y
	}

	// Added, doesn't mutate
	added(v) {
		return new Vec2(this.x + v.x, this.y + v.y)
	}

	// Normalizes, doesn't return
	normalize() {
		let d = Math.sqrt(this.x * this.x + this.y * this.y)
		if (d == 0) return
		this.x /= d
		this.y /= d
	}

	// Normalized, doesn't mutate
	normalized() {
		let d = Math.sqrt(this.x * this.x + this.y * this.y)
		if (d == 0) return new Vec2(0, 0)
		return new Vec2(this.x / d, this.y / d)
	}

	// Gets the length
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y)
	}

	// Gets the angle
	angle() {
		return Math.atan2(this.x, this.y)
	}

	toString() { return `(${this.x}, ${this.y})` }

	// Checks if a point is inside a rectangle
	pointInRect(x1, y1, x2, y2, x, y) {
		return x > x1 && x < x2 && y > y1 && y < y2
	}

	// Gets squared distance
	distSquared(v) {
		return (this.x - v.x) ** 2 + (this.y - v.y) ** 2
	}

	// Gets distance in x plus distance in y
	cartesianDist(v) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y)
	}
}

// Setting up font
let _font = `>J?[UFF9^9;[N?JH:9OR+Y^9*9[R6?$1_(_XAVF6^J1IM_JEV9N(^.$>PA[S'I]IPTBYG?^?C_"[W9W_XO_=N_N[B:SKU^K_#0")P ^0"? 1$09@#P!O]F9F%H"&$ $ !I )8-V?P, ,  , `
// CTool.canvasFromString(_font, 4)
