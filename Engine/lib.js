/**
 * @fileOverview A JS library for making games.
 * @author Code (I Guess)
 */
// Fully tryharding this.

/**
 * The main console class! This runs all the games and is
 * basically a wrapper around all the classes' functions.
 */
class Console {
	/**
	 * The main console class!
	 * @param {number} height Height (in pixels) of the game. The width is dynamic.
	 * @param {String} backgroundColor Background color for when something is transparent.
	 */
	constructor(height, backgroundColor) {
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
		document.body.style.backgroundColor = backgroundColor | "white"
		this.el = document.createElement("canvas")
		this.el.style.width = "100vw"
		this.el.style.height = "100vh"
		window.onresize = () => {
			this.width = Math.ceil((window.innerWidth / window.innerHeight) * height)
			this.height = Math.ceil(height)
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
		this.backgroundColor = backgroundColor
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
		window.addEventListener('keydown', e => {
			if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now()
			if (e.key == ' ') e.preventDefault()
		})
		window.addEventListener('keyup'  , e => { if (e.key.toLowerCase() in this.keys) delete this.keys[e.key.toLowerCase()] })
	}

	// Controls

	/**
	 * Adds a new event for when a key os pressed.
	 * @param {String} name Name for the event
	 * @param {Function} funct Function to be ran when the event is triggered
	 */
	nEvent(name, funct) {
		this.events[name] = [funct || (() => {}), false]
	}

	/**
	 * Runs an event when a key is pressed.
	 * @param {String} keyName Name of the key to to check for
	 * @param {String} eventName Name of the event to run
	 */
	onKeyPressed(keyName, eventName) {
		if (typeof keyName === "string") {
			window.addEventListener('keydown', e => {
				if (e.key == keyName && !e.repeat) {
					this.events[eventName][1] = true
					this.events[eventName][0]()
				}
			})
			window.addEventListener('keyup', e => {
				if (e.key == keyName)
					this.events[eventName][1] = false
			})
		} else {
			window.addEventListener('keydown', e => {
				if (keyName.includes(e.key) && !e.repeat) {
					this.events[eventName][1] = true
					this.events[eventName][0]()
				}
			})
			window.addEventListener('keyup', e => {
				if (keyName.includes(e.key))
					this.events[eventName][1] = false
			})
		}
	}

	/**
	 * Checks if an event is currently ongoing.
	 * @param {String} eventName Name of the event to check
	 * @returns Wether or not the event is ongoing
	 */
	eventOngoing(eventName) {
		if (!(eventName in this.events)) CTool.error("Event '" + eventName + "' does not exist.")
		return this.events[eventName][1]
	}

	/**
	 * Checks if a key is pressed
	 * @param {String} keyName Name of the key to check
	 * @returns Wether or not the key is pressed
	 */
	isKeyDown(keyName) {
		return keyName in this.keys
	}

	// Touch

	/**
	 * Sets a touch area to act as buttons to trigger events.
	 * @param {number} height Height of touch area array
	 * @param {number} width Width of touch area array
	 * @param {Array} events Array of events to run when the screen is touched
	 */
	touchArea(height, width, events) {
		this.currentTouches = {}
		var ths = this
		window.addEventListener("touchstart", function(e) {
			for (let ct = 0; ct < e.changedTouches.length; ct++) {
				let i = Math.floor(Math.round(e.changedTouches[ct].clientX) * height / (window.innerWidth + 1))
				  + height * Math.floor(Math.round(e.changedTouches[ct].clientY) * width / (window.innerHeight + 1))
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
				let i = Math.floor(Math.round(e.changedTouches[ct].clientX) * height / (window.innerWidth  + 1))
				  + height * Math.floor(Math.round(e.changedTouches[ct].clientY) * width / (window.innerHeight + 1))
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
	/**
	 * Makes the camera follow an element
	 * @param {*} el Element to be followed
	 * @param {number} interval How fast to follow the element. Specifies the amount to lerp each frame.
	 * @param {Vec2} speedPos How much the element's speed affects the position of the camera
	 */
	follow(el, interval, speedPos) {
		this.following = el
		this.followInterval = [interval, speedPos]
	}

	/**
	 * Init, runs when everything is ready; in this case, instantly.
	 * @param {Function} fn Function to be ran when everything is ready
	 */
	init(fn) { fn() }

	/**
	 * Runs before the main loop, before the frame elements are moved.
	 * @param {Function} fn Function to be ran before the loop executes
	 */
	preLoop(fn) {
		this.preLoopFn = fn
	}
	
	/**
	 * Runs after the main loop, when all the elements are moved.
	 * @param {Function} fn Function to be ran after the loop executes
	 */
	loop(fn) {
		// Yes, this runs on 45 fps. Deal with it.
		this.loopFn = fn
		this.lastTime = window.performance.now()
		this.frameRate = 45
		// window.requestInterval(this.updateAll, 1000 / 45, this)
		setInterval(() => {
			this.updateAll.call(this)
		}, 1000 / 60)//1000 / 45)
	}

	/**
	 * Main loop for the game. Runs the preLoop, moves everything, and runs the normal loop functions.
	 * @private
	 */
	updateAll() {

		// Calculate frame rate
		this.deltaTime = (window.performance.now() - this.lastTime)
		if (this.deltaTime != 0)
			this.frameRate = CTool.lerp(this.frameRate, 1000 / this.deltaTime, 0.05)
		this.lastTime = window.performance.now()
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

	/**
	 * Adds an object to the scene.
	 * @example
	 * let x = con.nObj(new Sprite(...))
	 * 
	 * @param {*} obj Object to be added. Can be of any library type, such as a Sprite, PhysicsActor, Tile, TileMap, ect.
	 * @returns The added object.
	 */
	nObj(obj) {
		obj.parentCon = this
		if (["TileMap"].includes(obj.type))
			return this.objects[this.objects.push(obj) - 1]
		else
			return this.objects[this.objects.push(this.imageThing(obj)) - 1]
	}

	/**
	 * Removes an object from the scene.
	 * Does ***not*** remove any image elements or sources.
	 * @param {*} obj Object to be removed
	 * @returns The removed object
	 */
	rObj(obj) {
		return this.rObjIdx(this.objects.indexOf(obj))
	}

	/**
	 * Removes an object by its index in the `this.objects` list.
	 * @param {*} idx Index to remove
	 * @returns The removed object
	 */
	rObjIdx(idx) {
		return this.objects.splice(idx, 1)
	}

	/**
	 * Adds any image thing from a sprite
	 * @param {*} spr Sprite class to load as an image thing
	 * @returns The given sprite
	 * @private
	 */
	imageThing(spr) {
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

	/**
	 * Sets the background color.
	 * @param {String} color Color to set
	 */
	background(color) {
		this.backgroundColor = color
	}

	/**
	 * Creates a new font from a CImage.
	 * @param {*} name Font name
	 * @param {CImage} image Image to use as font
	 */
	nFont(name, image) {
		this.fonts[name] = image
	}

	/**
	 * Sets the font that's currently being used
	 * @param {String} name Font name
	 */
	font(name) {
		this.currentFont = name
	}

	/**
	 * Draws text to the screen. Drawing starts at the upper left corner.
	 * @param {*} text Text to draw (can be any type, as it gets converted)
	 * @param {*} x X Position to draw at
	 * @param {*} y Y Position to draw at
	 */
	text(text, x, y) {
		let f = this.fonts[this.currentFont].canvas
		let charMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?[]_*|+-/\\.()@\"',<>&"
		text = (text + '').toUpperCase().split('').map(e => charMap.indexOf(e))
		for (let c = 0; c < text.length; c++) {
			this.ctx.drawImage(f, text[c] * 4, 0, f.height, f.height, x + c * (f.height + 1), y, f.height, f.height)
		}
	}

	/**
	 * Draws a filled rectangle to the screen. Drawing starts at the upper left corner.
	 * @param {number} x X Position to draw at
	 * @param {number} y Y Position to draw at
	 * @param {number} w Width of the rectangle
	 * @param {number} h Height of the rectangle
	 * @param {String} color Color to draw with
	 */
	rect(x, y, w, h, color) {
		this.ctx.fillStyle = color
		this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h))
	}

	/**
	 * Draws a single pixel at a given position.
	 * @param {number} x X Position to draw at
	 * @param {number} y Y Position to draw at
	 * @param {String} color Color to draw with
	 */
	point(x, y, color) {
		this.ctx.fillStyle = color
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

	collidedWith(el, d, i) {
		for (let e = 0; e < this.collisionEvents.length; e++)
			this.collisionEvents[e](el, d, i)
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
		if (typeof this.src == 'string' || !this.parentCon.imageElements[this.src].complete) return
		let repeatedPattern = this.parentCon.ctx.createPattern(this.parentCon.imageElements[this.src], 'repeat')
		this.parentCon.ctx.fillStyle = repeatedPattern
		repeatedPattern.setTransform(new DOMMatrix([(this.flipped ? -this.s : this.s), 0, 0, this.s,
			Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) - Math.round(this.parentCon.camPos.x))
				- (this.flipped ? (-(this.animation[0] + 1 + this.animationOffset) * this.w)
					: ((this.animation[0] + this.animationOffset) * this.w)) * this.s,
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
		if (this.loaded) callback()
		else this.loadCb = callback
	}
}

// Declares an arrangement of a tileset on a given map.
class TileMap {

	/**
	 * Generates a tilemap from an array of pixels.
	 * @param {Array} px Pixel data in RGBA form.
	 * @param {number} w Width of pixel data
	 * @param {Array} types Types of tiles
	 */
	static tileMapFromPixels(px, w, types) {
		function getType(p1, p2, p3) {
			for (let t in types)
				if (types[t][0] == p1 && types[t][1] == p2 && types[t][2] == p3)
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
			let x = ((p / 4) % w)
			let y = (Math.floor((p / 4) / w))
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
				if (bars[a][4] == bars[b][4] && bars[a][1] == bars[b][1]
					&& bars[a][3] == bars[b][3] && bars[a][0] - 1 == (bars[b][0] + bars[b][2] - 1)) {
					bars.splice(a, 1)
					if (a < b) { b-- }
					a--
					bars[b][2]++
				}
			}
		}
		for (let b = 0; b < bars.length; b++) {
			if (types[bars[b][4]] === undefined) CTool.error("Color", bars[b][4], "not in table.")
			bars[b] = {
				type: bars[b][4],
				x: bars[b][0], y: bars[b][1],
				w: bars[b][2], h: bars[b][3]
			}
		}
		return bars
	}

	/**
	 * Gets a tile array from an image source
	 * @param {String} src 
	 * @param {Array} types 
	 * @param {Function} callback 
	 */
	static tileMapFrom(src, types, callback) {
		this.getImagePixels(src, (px, w, h) => {
			this.tileMapFromPixels(px, w, types, callback)
		})
	}

	/**
	 * Creates a tilemap from a source and a tileset.
	 * @param {String} src Image source
	 * @param {TileSet} ts Tileset
	 * @returns {TileMap} Tilemap
	 */
	static from(src, ts, types) {
		let tm = new TileMap(ts, -1)
		CTool.getImagePixels(src, (data, dw, dh) => {
			tm.wt = dw
			tm.ht = dh
			tm.map = new Array(dw * dh).fill(0)
			let bars = this.tileMapFromPixels(data, dw, types)
			for (let b = 0; b < bars.length; b++) {
				for (let y = 0; y < bars[b].h; y++) {
					for (let x = 0; x < bars[b].w; x++) {
						tm.map[(x + bars[b].x) + (y + bars[b].y) * tm.wt] = 1
					}
				}
			}
			tm.colliders = bars
			tm.init()
		})
		return tm
	}

	constructor(ts, w, h, dt) {
		this.type = "TileMap"
		this.tileSet = ts
		this.wt = w
		this.ht = h
		this.map = dt
		this.x = 0
		this.y = 0
		if (this.wt != -1) this.init()

		// {type, x, y, w, h}
		this.colliders = []

		this.hb = {top: 0, bottom: 0, left: 0, right: 0, slr: 0, stb: 0}
	}

	init() {
		this.cnv = document.createElement('canvas')
		this.cnv.width  = this.tileSet.tw * this.wt
		this.cnv.height = this.tileSet.th * this.ht
		this.ctx = this.cnv.getContext('2d')

		let nbToIdx = [36,24,0,12,39,27,3,15,37,25,1,13,38,26,2,14,36,24,-1,-1,39,47,-1,31,-1,-1,-1,-1,38,42,-1,4,36,24,-1,-1,-1,-1,-1,-1,37,44,-1,28,38,41,-1,7,-1,24,-1,12,-1,47,-1,35,-1,44,-1,20,-1,45,-1,46,36,-1,0,-1,39,-1,11,19,37,-1,-1,-1,38,-1,6,40,-1,-1,-1,-1,-1,47,11,35,-1,-1,-1,-1,-1,-1,-1,23,36,24,0,-1,-1,-1,-1,-1,-1,44,-1,-1,-1,-1,-1,21,-1,-1,-1,-1,-1,47,-1,-1,-1,-1,-1,-1,-1,45,-1,30,36,-1,0,-1,-1,-1,-1,-1,37,-1,8,16,-1,-1,5,43,36,24,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,34,-1,-1,-1,-1,-1,-1,-1,-1,-1,44,8,20,-1,-1,-1,32,-1,-1,-1,-1,-1,-1,-1,-1,-1,44,-1,-1,-1,-1,-1,29,-1,-1,0,12,-1,-1,11,-1,-1,-1,8,-1,-1,-1,10,9,-1,-1,-1,-1,-1,-1,11,35,-1,-1,-1,-1,-1,-1,10,18,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,20,-1,-1,10,17,-1,-1,-1,-1,-1,-1,-1,35,-1,-1,-1,20,-1,45,10,33]

		const UP     = 1
		const DOWN   = 2
		const LEFT   = 4
		const RIGHT  = 8
		const ULEFT  = 16
		const URIGHT = 32
		const DLEFT  = 64
		const DRIGHT = 128

		console.log(JSON.stringify(nbToIdx))

		this.tileSet.onDone(() => {
			for (let i = 0; i < this.ht * this.wt; i++) {
				if (this.map[i] != 0 && this.map[i] != undefined) {
					let ti = this.map[i]
					let mv = 0
					if (this.map[i - this.wt] == ti) mv |=  1 // UP
					if (this.map[i + this.wt] == ti) mv |=  2 // DOWN
					if (i % this.wt != 0           && this.map[i - 1    ] == ti) mv |=  4 // LEFT
					if (i % this.wt != this.wt - 1 && this.map[i + 1    ] == ti) mv |=  8 // RIGHT
					if (i % this.wt != 0           && this.map[i - this.wt - 1] == ti) mv |= 16 // UP-LEFT
					if (i % this.wt != this.wt - 1 && this.map[i - this.wt + 1] == ti) mv |= 32 // UP-RIGHT
					if (i % this.wt != 0           && this.map[i + this.wt - 1] == ti) mv |= 64 // DOWN-LEFT
					if (i % this.wt != this.wt - 1 && this.map[i + this.wt + 1] == ti) mv |=128 // DOWN-RIGHT
					// console.log(mv, nbToIdx[mv])
					mv = nbToIdx[mv]
					if (mv == undefined || mv == -1) mv = 22
					this.ctx.drawImage(this.tileSet.tiles[mv],
						(i % this.wt) * this.tileSet.tw, Math.floor(i / this.wt) * this.tileSet.th)
				}
			}
		})

		this.loaded = true
	}


	/**
	 * Finds a specific tile in this tilemap
	 * @param {Array} tiles List of tiles
	 * @param {string} type Type of tile to find
	 * @param {Vec2} [fallBack] Fallback when there's no tile found
	 * @returns {Vec2} The position found
	 */
	 findTilePos(tiles, type, fallBack) {
		let offs = fallBack ? fallBack : new Vec2(0, 0)
		for (let b = 0; b < tiles.length; b++) {
			if (tiles[b].type == type) {
				offs.set(tiles[b].x, tiles[b].y)
				break
			}
		}
		return offs
	}

	draw() {
		if (!tileSet.loaded) return
		if (!this.loaded) return
		this.parentCon.ctx.drawImage(this.cnv, Math.round(this.x - this.parentCon.camPos.x), Math.round(this.y - this.parentCon.camPos.y))
	}

	hbOffsets(hb) {
		this.hb = hb
		this.hb.slr = hb.left + hb.right
		this.hb.stb = hb.top + hb.bottom
	}

	/**
	 * Gets the hitbox of a specific collision box within the tilemap
	 * @param {number} cn Number of collision box to get
	 * @returns Hitbox data as an array with [x, y, w, h]
	 */
	getHb(cn) {
		return [
			this.colliders[cn].x * this.tileSet.tw + this.hb.left,
			this.colliders[cn].y * this.tileSet.th + this.hb.top,
			this.colliders[cn].w * this.tileSet.tw - (this.hb.left + this.hb.right),
			this.colliders[cn].h * this.tileSet.th - (this.hb.top + this.hb.bottom)
		]
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

	intersects(hbe, cn) {
		let b1 = this.getHb()
		let b2 = hbe.getHb(cn)

		if (b1[1] + b1[3] > b2[1]
		&&  b1[0] + b1[2] > b2[0]
		&& (b1[1] + b1[3]) - b1[3] < (b2[1] + b2[3])
		&& (b1[0] + b1[2]) - b1[2] < (b2[0] + b2[2]))
			return true
		return false
	}

	physics(el) {
		// Repeat 5 times per frame. Since it's ran separately for each PhysicsActor
		// it's very inaccurate, but this is mostly to avoid phasing through objects.
		for (let pf = 0; pf < 5; pf++) {
			// this.speed.x = (this.speed.x + this.parentCon.physics.gravity.x) * this.parentCon.physics.friction.x
			// this.speed.y = (this.speed.y + this.parentCon.physics.gravity.y) * this.parentCon.physics.friction.y
			this.pos.x += (this.speed.x = (this.speed.x + this.parentCon.physics.gravity.x) * this.parentCon.physics.friction.x)
			this.pos.y += (this.speed.y = (this.speed.y + this.parentCon.physics.gravity.y) * this.parentCon.physics.friction.y)
			for (let t = 0; t < this.parentCon.objects.length; t++) {
				if (this.parentCon.objects[t].type == "TileMap") {
					for (let c = 0; c < this.parentCon.objects[t].colliders.length; c++) {
						this.avoidCollision(this.parentCon.objects[t], c)
					}
				} else {
					if (this.parentCon.objects[t] == this // Same as self, skip
						|| (!this.parentCon.objects[t].hasPhysics) // Doesn't have physics, skip
						|| this.parentCon.objects[t].pos.cartesianDist(this.pos) > // Is too far away, skip
						(this.w + this.h + this.parentCon.objects[t].w + this.parentCon.objects[t].h)
						* (this.s + this.parentCon.objects[t].s)) continue
					this.avoidCollision(this.parentCon.objects[t])
				}
			}
		}
	}

	avoidCollision(el, cn) {
		if (this.intersects(el, cn)) {
			this.parentCon.frameTotalCollisions++
			let b1 = this.getHb()
			let b2 = el.getHb(cn)
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
				this.collidedWith(el, "top", cn)
			} else if (bd < rd && bd < ld) {
				this.pos.y += bd
				if (this.bounce != 0)
					this.speed.y = Math.max(-this.speed.y * this.bounce, 0)
				else
					this.speed.y = Math.max(this.speed.y, 0)
				this.collidedWith(el, "bottom", cn)
			} else if (ld <= rd) {
				this.pos.x += ld
				this.speed.x = -this.speed.x * this.bounce
				this.collidedWith(el, "left", cn)
			} else {
				this.pos.x -= rd
				this.speed.x = -this.speed.x * this.bounce
				this.collidedWith(el, "right", cn)
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
	 * Logs an error to the console.
	 * @param  {...any} things The arguments for this error
	 */
	static error(...things) {
		throw ("error: " + things.join(" ") + "\n" + (()=>{
			return "(" + new Error().stack.split('\n')[3].trim().split("/").reverse()[0]
		})())
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


class Controllers {
	static types = {
		"platformer": {
			"left": ['a', 'A', "ArrowLeft"],
			"right": ['d', 'D', "ArrowRight"],
			"jump": [' ', 'w', 'W', "ArrowUp"],
			"_touch": [2, 2, [
				"jump", "jump",
				"left", "right"
			]]
		}
	}
	static new(element, type) {
		for (let evt in this.types[type]) {
			if (evt == "_touch") {
				element.parentCon.touchArea(...this.types[type][evt])
			} else {
				element.parentCon.onKeyPressed(this.types[type][evt], evt)
			}
		}
	}
}

// Setting up font
let _font = `>J?[UFF9^9;[N?JH:9OR+Y^9*9[R6?$1_(_XAVF6^J1IM_JEV9N(^.$>PA[S'I]IPTBYG?^?C_"[W9W_XO_=N_N[B:SKU^K_#0")P ^0"? 1$09@#P!O]F9F%H"&$ $ !I )8-V?P, ,  , `
