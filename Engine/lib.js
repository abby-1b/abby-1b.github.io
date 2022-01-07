"use strict";

// These are tags to look for in this file so I can find the things I need.
// BOTT: bottleneck
// ERR: potential error
// ADD: a feature that needs to be added

/**
 * @fileOverview A JS library for making games.
 * @author Code (I Guess)
 */
// Fully tryharding this.

const CON_IMAGE_LOAD_TIMEOUT = 10
let _ImageLoadTimeoutCount = CON_IMAGE_LOAD_TIMEOUT + 1

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
	constructor(desiredHeight, backgroundColor) {
		// Setup HTML stuff
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

		window.onresize = () => {
			// let fh = (window.innerHeight / window.innerWidth) / (16 / 9) * desiredHeight
			this.width = Math.ceil((window.innerWidth / window.innerHeight) * desiredHeight)
			this.height = Math.ceil(desiredHeight)
			// console.log(fh)
			if (this.usesSecondStepBlur) {
				this.secondOutputCanvas.width = this.width
				this.secondOutputCanvas.height = this.height
			}
			this.el.width = this.width
			this.el.height = this.height
			if (this.material) {
				this.gl.viewport(0, 0, this.el.width, this.el.height)
				this.gl.uniform2fv(this.gl.getUniformLocation(this.material, "screenScale"), [2 / this.el.width, -2 / this.el.height])
			}
		}
		window.onorientationchange = window.onresize
		window.ondeviceorientation = window.onresize

		// Setup WebGL
		this.gl = this.el.getContext("webgl2", {antialias: false, alpha: true})
		this.material = CTool.buildShaderProgram(this.gl, `
			attribute vec2 vPos;
			uniform vec2 vOffs;
			uniform vec2 screenScale;
			varying vec2 tPos;
			uniform vec2 tOffs;

			void main() {
				tPos = vPos.xy + tOffs;
				gl_Position = vec4((vPos + vOffs) * screenScale - vec2(1.0, -1.0), 0.0, 1.0);
			}`, `
			varying vec2 tPos;
			uniform vec2 tSize;
			uniform vec4 colorParam;
			uniform sampler2D sTexture;

			void main() {
				if (colorParam.w < 0.0) {
					vec4 t = texture2D(sTexture, (floor(tPos) + 0.5) / tSize) * vec4(colorParam.x, colorParam.y, colorParam.z, -colorParam.w);
					if (t.w <= 0.0) discard;
					gl_FragColor = t;
				} else {
					gl_FragColor = colorParam;
				}
			}`)
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer())
		let vPos = this.gl.getAttribLocation(this.material, "vPos")
		this.gl.enableVertexAttribArray(vPos)
		this.gl.vertexAttribPointer(vPos, 2, this.gl.FLOAT, false, 0, 0)
		this.gl.useProgram(this.material)
		this.gl.disable(this.gl.DEPTH_TEST)
		// this.gl.depthFunc(this.gl.LEQUAL)
		this.gl.enable(this.gl.BLEND)
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

		window.onresize()
		this.glParams = {
			vOffs: this.gl.getUniformLocation(this.material, "vOffs"),
			tSize: this.gl.getUniformLocation(this.material, "tSize"),
			tOffs: this.gl.getUniformLocation(this.material, "tOffs"),
			colorParam: this.gl.getUniformLocation(this.material, "colorParam"),
		}
		this.glTranslation = [0, 0]

		// Image loading for sprites
		// This ensures if two sprites use the same image it doesn't have to be loaded again.
		this.imageIndexes = {}
		this.imageElements = []
		
		// Colors state machine
		this.backgroundColor = backgroundColor
		this.currentColor = [0, 0, 0, 0]

		// Holds everything that is rendered.
		this.objects = []
		this.maxSortPerFrame = 1
		this.sortIdx = 0

		// The camera. Pretty self-explanatory.
		this.camera = {
			pos: new Vec2(0, 0),

			set constrains(v) {
				v.bottomRight = true
				v.reload()
				this._constrains = v
			},
			get constrains() {
				return this._constrains
			},
			_constrains: new Rect(-1e9, -1e9, 2e9, 2e9, true),

			following: false,
			followFract: 0
		}

		// Physics variables, all modifiable
		this.physics = {
			gravity: new Vec2(0.0, 0.015),
			friction: new Vec2(0.9, 0.997),
			groundFriction: new Vec2(0.9, 0.997),

			// TODO: Implement different collision types
			// Bits:
			//   0: Physics loop (Inertia and friction)
			//   1: Hard (Normal physics)
			//   2: Soft (Pushing things around)
			enable: 3
		}
		this.frameTotalCollisions = 0

		// Font
		this.fonts = {"": "20px Arial"}
		this.nFont("std", new ImageLoader(1, `121|4|>J?[UFF9^9;[N?JH:9OR+Y^9*9[R6?$1_(_XAVF6^J1IM_JEV9N(^.$>PA[S'I]IPTBYG?^?C_"[W9W_XO_=N_^[F^SKU^K_#=")W _YG_ 1$09@#_!O]F9F%^B.<0$0!OF?8-V?P, ,  ,  G57("6U!0 `, this.gl))
		this.font("std")

		// Events
		this.events = {}

		// Deals with key events
		this.keys = {}
		window.addEventListener('keydown', e => {
			if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now()
			if (e.key == ' ') e.preventDefault()
		})
		window.addEventListener('keyup'  , e => {
			if (e.key.toLowerCase() in this.keys) delete this.keys[e.key.toLowerCase()]
		})

		// Different functions.
		this.initFn    = () => {}
		this.preFrameFn = () => {}
		this.frameFn    = () => {}
		this.pFrameFn   = () => {}
		this.frameCount = 0

		// Finally, the canvas gets appended.
		// Second step to make things not blurry on some devices.
		this.usesSecondStepBlur = false
		if (Device.outputIsBlurry()) {
			this.usesSecondStepBlur = true
			this.secondOutputCanvas = document.createElement("canvas")
			
			this.secondOutputCanvas.width = this.width
			this.secondOutputCanvas.height = this.height

			this.secondOutputCtx = this.secondOutputCanvas.getContext("2d")
			this.secondOutputCanvas.style.width = "100vw"
			this.secondOutputCanvas.style.height = "100vh"
			document.body.appendChild(this.secondOutputCanvas)
		} else {
			this.el.style.width = "100vw"
			this.el.style.height = "100vh"
			// this.el.style.objectFit = "contain"
			// this.el.style.position = "fixed"
			// this.el.style.transform = "translate(-50%,-50%)"
			// this.el.style.left = this.el.style.top = "50%"
			document.body.appendChild(this.el)
		}
	}

	// Controls
	/**
	 * Adds a new event for when a key os pressed.
	 * @param {String} name Name for the event
	 * @param {Function} funct Function to be ran when the event is triggered
	 */
	nEvent(name, funct) {
		if (name in this.events) CTool.warning("Event '" + name + "' already exists. Its function was replaced.")
		this.events[name] = [funct || (() => {}), false]
	}

	/**
	 * Runs an event when a key is pressed.
	 * @param {String} keyName Name of the key to to check for
	 * @param {String} eventName Name of the event to run
	 */
	onKeyPressed(keyName, eventName) {
		if (!(eventName in this.events)) {
			// ERR:
			// CTool.warning("Event", eventName, "doesn't exist.")
		}
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
	 * @returns {boolean} Wether or not the event is ongoing
	 */
	eventOngoing(eventName) {
		if (!(eventName in this.events)) {
			CTool.warning("Event '" + eventName + "' does not exist. Creating...")
			this.events[eventName] = [() => {}, false]
			return false
		}
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
		if (!(el instanceof Sprite)) CTool.error("Can't follow given element.")
		if (!interval) CTool.error("No interval supplied!")
		if (!speedPos) CTool.error("No speed position supplied!")
		this.camera.following = el
		this.camera.followFract = [interval, speedPos]
	}

	/**
	 * Init, runs when everything is ready; in this case, instantly.
	 * @param {Function} fn Function to be ran when everything is ready
	 */
	init(fn) {
		this.initFn = fn
		this._init()
	}

	_init() {
		this.initFn()

		let unloaded = 0
		for (let i = 0; i < this.imageElements.length; i++) {
			if (!this.imageElements[i].complete) unloaded++
		}

		// ERR:
		// console.log("Missing", unloaded, "images.")
		if (unloaded > 0) {
			setTimeout(() => {
				this._init.call(this)
			}, 10)
			return
		}

		// Framerate calculation setup
		this.lastTime = window.performance.now()
		this.frameRate = 60

		// Graphics interval
		let graphicsFn = () => {
			this.doGraphics.call(this)
			window.requestAnimationFrame(graphicsFn)
		}
		window.requestAnimationFrame(graphicsFn)

		// Physics interval
		setInterval(() => {
			this.doPhysics.call(this)
		}, 4)
	}

	/**
	 * Runs this function before every frame, when sprites are about to be rendered
	 * @param {Function} fn Function to be ram
	 */
	preFrame(fn) {
		this.preFrameFn = fn
	}

	/**
	 * Runs this function at the end of every frame
	 * @param {Function} fn Function to be ran
	 */
	frame(fn) {
		this.frameFn = fn
	}
	
	/**
	 * Runs this function every physics frame
	 * @param {Function} fn Function to be ran
	 */
	pFrame(fn) {
		this.pFrameFn = fn
	}

	/**
	 * Main loop for the game. Runs the preLoop, moves everything, and runs the normal loop functions.
	 * @private
	 */
	doGraphics() {
		// Move camera towards targeted object
		if (this.camera.following) {
			if (this.camera.following instanceof PhysicsActor) {
				this.camera.pos.lerp(
					Math.min(this.camera._constrains.x2, Math.max(this.camera._constrains.x, (this.camera.following.pos.x - this.width  / 2) + this.camera.following.speed.x * this.camera.followFract[1].x + this.camera.following.w * this.camera.following.scale * 0.5)),
					Math.min(this.camera._constrains.y2, Math.max(this.camera._constrains.y, (this.camera.following.pos.y - this.height / 2) + this.camera.following.speed.y * this.camera.followFract[1].y + this.camera.following.h * this.camera.following.scale * 0.5)),
					this.camera.followFract[0])
			} else {
				this.camera.pos.lerp(
					Math.min(this.camera._constrains.x2, Math.max(this.camera._constrains.x, (this.camera.following.pos.x - this.width  / 2) + this.camera.following.w * this.camera.following.scale * 0.5)),
					Math.min(this.camera._constrains.y2, Math.max(this.camera._constrains.y, (this.camera.following.pos.y - this.height / 2) + this.camera.following.h * this.camera.following.scale * 0.5)),
					this.camera.followFract[0])
			}
		}

		// Calculate frame rate
		this.deltaTime = (window.performance.now() - this.lastTime)
		if (this.deltaTime != 0)
			this.frameRate = CTool.lerp(this.frameRate, 1000 / this.deltaTime, 0.05)
		this.lastTime = window.performance.now()

		// Clear screen
		this.gl.clearColor(...CTool.glColor(...this.backgroundColor))
		this.gl.clear(this.gl.COLOR_BUFFER_BIT)

		// l - Math.abs(x % (2 * l) - l)

		if (this.objects.length > 1) {
			if (this.maxSortPerFrame < 0) {
				this.objects.sort((a, b) => a._layer - b._layer)
			} else {
				for (let cso = 0; cso < this.maxSortPerFrame; cso++) {
					if (++this.sortIdx == this.objects.length - 1) this.sortIdx = 0
					if (this.objects[this.sortIdx]._layer > this.objects[this.sortIdx + 1]._layer) {
						let tmp = this.objects[this.sortIdx]
						this.objects[this.sortIdx] = this.objects[this.sortIdx + 1]
						this.objects[this.sortIdx + 1] = tmp
					}
				}
			}
		}

		this.preFrameFn()

		// Draw all objects
		this.glTranslation[0] = -Math.round(this.camera.pos.x)
		this.glTranslation[1] = -Math.round(this.camera.pos.y)
		this.gl.uniform2fv(this.glParams.vOffs, this.glTranslation)

		for (let o = 0; o < this.objects.length; o++)
			this.objects[o].draw()

		this.glTranslation = [0, 0]
		this.gl.uniform2fv(this.glParams.vOffs, this.glTranslation)
		
		this.frameFn() // Call user loop function
		this.frameCount++ // Increment frame count

		// Draw to second canvas if still blurry
		if (this.usesSecondStepBlur) {
			this.secondOutputCtx.drawImage(this.gl.canvas, 0, 0, this.width, this.height)
		}
	}

	/** */
	doPhysics() {
		// Loop through all objects, and then again for PhysicsActors
		this.frameTotalCollisions = 0
		for (let o = 0; o < this.objects.length; o++) {
			if (this.objects[o].constructor.name == "PhysicsActor") {
				this.objects[o].collided = false
				this.objects[o].onGround = false
				this.objects[o].physics()
			}
		}

		this.pFrameFn()
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
	 * @param {number} idx Index to remove
	 * @returns The removed object
	 */
	rObjIdx(idx) {
		return this.objects.splice(idx, 1)
	}

	/**
	 * Adds any image thing from a sprite
	 * @param {Sprite} spr Sprite class to load as an image thing
	 * @returns The given sprite
	 * @private
	 */
	imageThing(spr) {
		if (spr.src.isText) {
			this.imageIndexes[spr.src] = this.imageElements.push(spr.src.canvas) - 1
			spr.imageLoaded()
		} else {
			if (spr.src in this.imageIndexes) {
				// TODO
				// if (this.imageElements[this.imageIndexes[spr.src]].texture.complete) {
				// 	spr.imageLoaded()
				// } else {
				// 	this.imageElements[this.imageIndexes[spr.src]].texture.addEventListener('load', () => {
				// 		spr.imageLoaded()
				// 	})
				// }
			} else {
				let tex = this.gl.createTexture()
				this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
			
				let textureInfo = { width: 1, height: 1, texture: tex }
				let img = new Image()
				img.addEventListener('load', function() {
					textureInfo.width = img.width
					textureInfo.height = img.height
					CTool.bindTexture(spr.parentCon.gl, textureInfo.texture, img)
					textureInfo.complete = true
					spr.imageLoaded()
				})
				setTimeout(() => { img.src = spr.srcStr }, _ImageLoadTimeoutCount += CON_IMAGE_LOAD_TIMEOUT)
				this.imageIndexes[spr.src] = this.imageElements.push(textureInfo) - 1
			}
		}
		spr.srcStr = spr.src
		spr.src = this.imageIndexes[spr.src]
		return spr
	}
	
	shiftObjects(x, y) {
		this.camera.pos.x += x
		this.camera.pos.y += y
		for (let o = 0; o < this.objects.length; o++) {
			this.objects[o].pos.x += x
			this.objects[o].pos.y += y
		}
	}

	/**
	 * Sets the background color.
	 * @param {String} color Color to set
	 */
	background(color) {
		this.backgroundColor = color
	}

	/**
	 * Sets the current color.
	 * @param {*} r Red
	 * @param {*} g Green
	 * @param {*} b Blue
	 * @param {*} a Alpha
	 */
	color(r, g, b, a) {
		this.currentColor = CTool.glColor(r, g, b, a)
	}
	
	/**
	 * 
	 * @param {*} t 
	 */
	blend(t) {
		this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA)
		switch (t) {
			case 0:
				this.gl.blendEquation(this.gl.FUNC_ADD)
				break
			case 1:
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE)
				// this.gl.blendEquation(this.gl.ADD)
				break
		}
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
	 * Draws text to the screen. Drawing starts at the upper left corner. Currently not working due to WebGL implementation.
	 * @param {*} text Text to draw (can be any type, as it gets converted)
	 * @param {*} x X Position to draw at
	 * @param {*} y Y Position to draw at
	 */
	text(text, x, y) {
		let _scale = Device.touch() ? 1 : 2
		let _h = this.fonts[this.currentFont].textureInfo.height
		x -= (_h + 1) * _scale
		let ox = x + 0
		let charMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?[]_*|+-/\\.()@\"',<>&:\n"
		text = (text + '').toUpperCase().split('').map(e => charMap.indexOf(e))
		// console.log(text)
		let _vertexArr = new Float32Array([0,0, 0,0, 0,0, 0,0])
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.fonts[this.currentFont].textureInfo.tex)
		this.gl.uniform2fv(this.glParams.tSize, [
			this.fonts[this.currentFont].textureInfo.width * _scale,
			this.fonts[this.currentFont].textureInfo.height * _scale
		])
		this.gl.uniform4fv(this.glParams.colorParam, [
			this.currentColor[0], this.currentColor[1],
			this.currentColor[2], -this.currentColor[3]
		])

		for (let c = 0; c < text.length; c++) {
			x += (_h + 1) * _scale
			if (text[c] == 58) {
				x = ox
				y += (_h + 1) * _scale
				continue
			}
			if (text[c] == -1) continue
			this.gl.uniform2fv(this.glParams.tOffs, [-x + text[c] * _scale * _h, -y])
			_vertexArr[0] = x
			_vertexArr[1] = y
			_vertexArr[2] = x + _h * _scale
			_vertexArr[3] = y
			_vertexArr[4] = x
			_vertexArr[5] = y + _h * _scale
			_vertexArr[6] = _vertexArr[2]
			_vertexArr[7] = _vertexArr[5]
			this.gl.bufferData(this.gl.ARRAY_BUFFER, _vertexArr, this.gl.STATIC_DRAW)
			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
		}
	}

	/**
	 * Draws a single pixel at a given position.
	 * @param {number} x X Position to draw at
	 * @param {number} y Y Position to draw at
	 */
	point(x, y) {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			Math.floor(x + 1), Math.floor(y)
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.POINTS, 0, 1)
	}

	/**
	 * Draws a line to the screen.
	 * @param {number} x X Position to draw at
	 * @param {number} y Y Position to draw at
	 * @param {number} w Width of the rectangle
	 * @param {number} h Height of the rectangle
	 */
	line(x1, y1, x2, y2) {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			Math.floor(x1), Math.floor(y1), Math.floor(x2 + 1), Math.floor(y2 + 1)
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.LINES, 0, 2)
	}

	/**
	 * Draws a filled rectangle to the screen. Drawing starts at the upper left corner.
	 * @param {number} x X Position to draw at
	 * @param {number} y Y Position to draw at
	 * @param {number} w Width of the rectangle
	 * @param {number} h Height of the rectangle
	 */
	rect(x, y, w, h) {
		x = Math.floor(x + 1)
		y = Math.floor(y)
		w = Math.floor(w - 1)
		h = Math.floor(h - 1)
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			x, y, x + (w - 1), y,
			x, y, x, y + h + 1,
			x + w, y, x + w, y + h,
			x, y + h, x + w, y + h
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.LINES, 0, 8)
	}

	/**
	 * Draws a filled rectangle to the screen. Drawing starts at the upper left corner.
	 * @param {number} x X Position to draw at
	 * @param {number} y Y Position to draw at
	 * @param {number} w Width of the rectangle
	 * @param {number} h Height of the rectangle
	 */
	fillRect(x, y, w, h) {
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
			x, y, x + w, y,
			x, y + h, x + w, y + h
		]), this.gl.DYNAMIC_DRAW)
		this.gl.uniform4fv(this.glParams.colorParam, this.currentColor)
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
	}

	/**
	 * Guess what this does. Just try to guess.
	 */
	fullScreen() {
		let fn =
			(this.el.requestFullscreen ? "requestFullscreen" :
			this.el.webkitRequestFullscreen ? "webkitRequestFullscreen" :
			this.el.msRequestFullscreen ? "msRequestFullscreen" : false)
		if (!fn) {
			CTool.warning("Fullscreen function not found.")
			return
		}
		this.el[fn]()
	}

	exitFullscreen() {
		if (!this.isFullscreen()) CTool.warning("Not in fullscreen.")
		document.exitFullscreen()
	}

	isFullscreen() {
		return document.fullscreenElement
	}
}

// Loads an image from a specific source.
class ImageLoader {
	constructor(srcType, src, gl) {
		this.isText = true
		this.canvas = CTool.canvasFromString(src)
		this.textureInfo = {width: this.canvas.width, height: this.canvas.height, tex: gl.createTexture()}
		CTool.bindTexture(gl, this.textureInfo.tex, this.canvas)
	}
}

// Draws a sprite or any type of image to the screen
// Eventually Sprite should inherit from ImageLoader, as should TileMap.
class Sprite {
	constructor(src, x, y, width, height, scale, centered) {
		if ((!width) && (!height)) CTool.warning("No width / height provided!")
		this.type = "Sprite"
		this.src = src
		this.pos = new Vec2(x, y)
		this.w = width
		this.h = height
		this.scale = scale | 1
		this.c = centered
		this._layer = 0
		this.drawFn = null
		this.hidden = false
		this.animation = [0, 0, true] // frame, timer, paused
		this.animationOffset = 0
		this.animationStates = {} // start, end, timer, loop, pause frame
		this.animationState = ""
		this._onAnimationDone = () => {}

		this.showHitbox = false // false
		this.flipped = false
		this.collided = false
		this.collisionEvents = []
		this.hb = {top: 0, bottom: 0, left: 0, right: 0, slr: 0, stb: 0}

		this._vertexArr = new Float32Array([0,0, 0,0, 0,0, 0,0])
	}

	onAnimationDone(fn) {
		this._onAnimationDone = fn
	}

	setSrc(src) {
		if (src in this.parentCon.imageIndexes) {
			this.src = this.parentCon.imageIndexes[src]
		} else {
			let tex = this.parentCon.gl.createTexture()
			this.parentCon.gl.bindTexture(this.parentCon.gl.TEXTURE_2D, tex)

			let textureInfo = { width: 1, height: 1, texture: tex }
			let img = new Image()

			let spr = this
			img.addEventListener('load', function() {
				textureInfo.width = img.width
				textureInfo.height = img.height
				textureInfo.complete = true
				spr.parentCon.gl.bindTexture(spr.parentCon.gl.TEXTURE_2D, textureInfo.texture)

				spr.parentCon.gl.texParameteri(spr.parentCon.gl.TEXTURE_2D, spr.parentCon.gl.TEXTURE_WRAP_S, spr.parentCon.gl.REPEAT)
				spr.parentCon.gl.texParameteri(spr.parentCon.gl.TEXTURE_2D, spr.parentCon.gl.TEXTURE_WRAP_T, spr.parentCon.gl.REPEAT)
				spr.parentCon.gl.texParameteri(spr.parentCon.gl.TEXTURE_2D, spr.parentCon.gl.TEXTURE_MIN_FILTER, spr.parentCon.gl.NEAREST)
				spr.parentCon.gl.texParameteri(spr.parentCon.gl.TEXTURE_2D, spr.parentCon.gl.TEXTURE_MAG_FILTER, spr.parentCon.gl.NEAREST)
				spr.parentCon.gl.texImage2D(spr.parentCon.gl.TEXTURE_2D, 0, spr.parentCon.gl.RGBA, spr.parentCon.gl.RGBA, spr.parentCon.gl.UNSIGNED_BYTE, img)
				spr.imageLoaded()
			})
			img.src = src
			this.parentCon.imageIndexes[src] = this.parentCon.imageElements.push(textureInfo) - 1
			this.src = this.parentCon.imageElements.length - 1
		}
	}

	layer(l) {
		this._layer = l
	}

	hbOffsets(hb) {
		this.hb = hb
		this.hb.slr = hb.left + hb.right
		this.hb.stb = hb.top + hb.bottom
	}

	// ISSUE WITH MINIFY
	getHb() {
		if (this.flipped) {
			return [
				this.pos.x - (this.c ? this.w * 0.5 : 0) + this.hb.right * this.scale,
				this.pos.y - (this.c ? this.h * 0.5 : 0) + this.hb.top * this.scale,
				this.w * this.scale - (this.hb.right * this.scale + this.hb.left * this.scale),
				this.h * this.scale - (this.hb.top * this.scale + this.hb.bottom * this.scale)
			]
		}
		return [
			this.pos.x - (this.c ? this.w * 0.5 : 0) + this.hb.left * this.scale,
			this.pos.y - (this.c ? this.h * 0.5 : 0) + this.hb.top * this.scale,
			this.w * this.scale - (this.hb.left * this.scale + this.hb.right * this.scale),
			this.h * this.scale - (this.hb.top * this.scale + this.hb.bottom * this.scale)
		]
	}

	drawHb() {
		this.parentCon.rect(...this.getHb())
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
		// return
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

	/**
	 * Called when the sprite collides with anything.
	 * @param {*} el 
	 * @param {*} d 
	 * @param {*} i 
	 * 
	 * @private
	 */
	collidedWith(el, d, i) {
		for (let e = 0; e < this.collisionEvents.length; e++)
			this.collisionEvents[e](el, d, i)
	}

	/**
	 * Adds a collision event, which runs whenever the sprite collides with something.
	 * @param {Function} fn 
	 */
	onCollision(fn) {
		this.collisionEvents.push(fn)
	}

	/**
	 * Draws the sprite to the screen. Used by the library, not the user.
	 * @private
	 */
	draw() {
		// Reset parentCon settings
		this.parentCon.color(255)
		this.parentCon.blend(0)

		// Use this sprite's draw function
		if (this.drawFn) this.drawFn.call(this)

		// Animation
		if (!this.animation[2]) { // if not paused
			if ((this.animation[1] -= 60 / this.parentCon.frameRate) <= 0) { // if the next frame is supposed to go
				this.animation[1] = this.animationStates[this.animationState][2] // reset animation frame timer
				if (this.animation[0] == this.animationStates[this.animationState][4]) // if the frame is the pause frame
					this.animation[2] = true // pause it
				if (this.animation[0]++ >= this.animationStates[this.animationState][1]) { // if the frame is out of the animation range
					if (this.animationStates[this.animationState][3]) { // if it loops
						this.animation[0] = this.animationStates[this.animationState][0] // go back to start
					} else { // if it doesn't loop
						this._onAnimationDone()
						this.animation[2] = true
						this.animation[0]--
					}
				}
			}
		}
		// Return if the image is not loaded
		if (typeof this.src == 'string' || !this.parentCon.imageElements[this.src].complete) return
		if (!this.hidden) {
			this.parentCon.gl.bindTexture(this.parentCon.gl.TEXTURE_2D, this.parentCon.imageElements[this.src].texture)

			this.parentCon.gl.uniform2fv(this.parentCon.glParams.tSize, [
				this.parentCon.imageElements[this.src].width * (this.flipped ? -1 : 1) * this.scale,
				this.parentCon.imageElements[this.src].height * this.scale
			])
			let _xOffs = Math.floor(this.pos.x - (this.c ? (this.w / 2) * this.scale : 0))
			let _yOffs = Math.floor(this.pos.y - (this.c ? (this.h / 2) * this.scale : 0))
			this.parentCon.gl.uniform2fv(this.parentCon.glParams.tOffs, [-_xOffs + (this.flipped ? -1 : 1) * (this.animation[0] + (this.flipped ? 1 : 0) + this.animationOffset) * this.w * this.scale, -_yOffs])
			this.parentCon.gl.uniform4fv(this.parentCon.glParams.colorParam, [
				this.parentCon.currentColor[0],
				this.parentCon.currentColor[1],
				this.parentCon.currentColor[2],
				-this.parentCon.currentColor[3]
			])
			this._vertexArr[0] = _xOffs
			this._vertexArr[1] = _yOffs
			this._vertexArr[2] = _xOffs + this.w * this.scale
			this._vertexArr[3] = _yOffs
			this._vertexArr[4] = _xOffs
			this._vertexArr[5] = _yOffs + this.h * this.scale
			this._vertexArr[6] = this._vertexArr[2]
			this._vertexArr[7] = this._vertexArr[5]

			this.parentCon.gl.bufferData(this.parentCon.gl.ARRAY_BUFFER, this._vertexArr, this.parentCon.gl.STATIC_DRAW)
			// Four is the number of vertices, which for images is always four.
			this.parentCon.gl.drawArrays(this.parentCon.gl.TRIANGLE_STRIP, 0, 4)
		}

		// Hitbox
		if (this.showHitbox) {
			// this.parentCon.ctx.strokeStyle = (this.collided ? "#f0f9" : "#f009")
			this.parentCon.color(...(this.collided ? [255, 0, 255, 143] : [255, 0, 0, 143]))
			this.drawHb()
		}
	}

	finalPos(centered) {
		return new Vec2(
			(this.pos.x - this.parentCon.camera.pos.x) + (centered ? this.w / 2 : 0),
			this.pos.y - this.parentCon.camera.pos.y + (centered ? this.h / 2 : 0)
		)
	}
}

class Button extends Sprite {
	constructor(src, x, y, width, height, scale, centered, doOnTouchStart) {
		super(src, x, y, width, height, scale, centered)

		var ths = this
		// ERR: Both events can be triggered at the same time.
		// ERR: Touch / mouse might be scaled differently in mobile viewport...
		let _checkFn = (function(e){
			if ((new Rect(...ths.getHb(), true)).coordInside(
				(e.clientX / window.innerWidth) * con.width, 
				(e.clientY / window.innerHeight) * con.height) && ths.clickFn) {
				ths.clickFn()
			}
		})
		window.addEventListener('mousedown', _checkFn)
		window.addEventListener(doOnTouchStart ? 'touchstart' : 'touchend', _checkFn)
	}

	onClick(fn) {
		this.clickFn = fn
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
// I believe it's different enough from the Sprite class to be its own,
// but they do share a lot of similarities. I don't know how fast it
// would be to inherit from Sprite vs just re-creating it from the ground up.
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
	static from(src, types) {
		let tileSets = []
		for (let t in types)
			tileSets.push(types[t][3])
		let tm = new TileMap(tileSets, -1)
		CTool.getImagePixels(src, (data, dw, dh) => {
			tm.wt = dw
			tm.ht = dh
			tm.map = new Array(dw * dh).fill(0)
			let bars = this.tileMapFromPixels(data, dw, types)
			// Loop through all the bars
			for (let b = 0; b < bars.length; b++) {
				// Get its type
				let n = Object.keys(types).indexOf(bars[b].type) + 1

				// Fill the map in with its pixels
				for (let y = 0; y < bars[b].h; y++) {
					for (let x = 0; x < bars[b].w; x++) {
						tm.map[(x + bars[b].x) + (y + bars[b].y) * tm.wt] = n
					}
				}
			}
			tm.colliders = []
			for (let b = 0; b < bars.length; b++)
				if (types[bars[b].type][3])
					tm.colliders.push(bars[b])
			tm.init()
		})
		return tm
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

	constructor(tileSets, w, h, mapData) {
		this.type = "TileMap"
		this.tileSets = tileSets
		this.loadableSets = 0
		for (let t in this.tileSets)
			if (this.tileSets[t]) {
				this.tileSet = this.tileSets[t]
				break
			}
		for (let t in this.tileSets)
			if (this.tileSets[t]) this.loadableSets++

		this.wt = w
		this.ht = h
		this.map = mapData
		this.showHitbox = false
		this.x = 0
		this.y = 0
		this._layer = 0
		if (this.wt != -1) this.init()

		// {type, x, y, w, h}
		this.colliders = []

		this.hb = {top: 0, bottom: 0, left: 0, right: 0, slr: 0, stb: 0}

		this._vertexArr = new Float32Array([0,0, 0,0, 0,0, 0,0])
	}

	layer(l) {
		this._layer = l
	}

	init() {
		this.cnv = document.createElement('canvas')
		this.w = this.tileSet.tw * this.wt
		this.h = this.tileSet.th * this.ht
		this.cnv.width  = this.w
		this.cnv.height = this.h
		this.ctx = this.cnv.getContext('2d')

		this.nbToIdx = [36,24,0,12,39,27,3,15,37,25,1,13,38,26,2,14,36,24,0,12,39,47,3,31,37,25,1,13,38,42,-1,4,36,24,0,12,39,27,3,-1,37,44,1,28,38,41,-1,7,36,24,0,12,39,47,3,31,37,44,-1,28,38,45,2,46,36,24,0,12,39,-1,11,19,37,25,1,-1,38,26,6,40,36,24,0,12,39,47,11,35,37,25,1,13,38,42,6,23,36,24,0,12,39,27,11,19,-1,44,1,28,38,41,6,34,36,24,0,12,39,47,11,35,-1,44,1,28,38,45,6,30,36,-1,0,12,39,27,-1,-1,37,25,8,16,38,26,5,43,36,24,0,12,39,47,3,31,37,25,-1,16,-1,42,5,21,36,24,0,12,39,27,3,15,37,44,8,20,38,41,5,32,36,24,0,12,-1,47,3,31,37,44,8,20,38,45,5,29,36,24,0,12,39,27,11,19,37,25,8,16,38,26,10,9,36,24,0,24,39,47,11,35,37,25,8,16,38,42,10,18,36,24,0,12,-1,-1,11,19,-1,44,8,20,38,41,10,17,-1,24,0,12,39,47,11,35,-1,44,8,20,38,45,10,33]

		const UP     = 1
		const DOWN   = 2
		const LEFT   = 4
		const RIGHT  = 8
		const ULEFT  = 16
		const URIGHT = 32
		const DLEFT  = 64
		const DRIGHT = 128

		// console.log("missing", this.nbToIdx.filter(e => e == -1).length)
		// console.log(JSON.stringify(this.nbToIdx))

		this.loadedSets = 0
		for (let t = 0; t < this.tileSets.length; t++)
			if (this.tileSets[t])
				this.tileSets[t].onDone(() => {
					this.loadedSets++
					if (this.loadedSets == this.loadableSets)
						this.allTilesetsLoaded()
				})
	}

	/**
	 * Runs autotiling for the entire TileMap
	 */
	allTilesetsLoaded() {
		this.glTex = {
			tex: this.parentCon.gl.createTexture(),
			width: this.cnv.width,
			height: this.cnv.height
		}
		for (let i = 0; i < this.ht * this.wt; i++) {
			let ti = this.map[i] // Tile index
			if (ti != 0 && ti != undefined && this.tileSets[ti - 1] != undefined) {
				let mv = 0
				if (this.map[i - this.wt] == ti) mv |= 1 // UP
				if (this.map[i + this.wt] == ti) mv |= 2 // DOWN
				if (i % this.wt != 0           && this.map[i - 1          ] == ti) mv |=  4 // LEFT
				if (i % this.wt != this.wt - 1 && this.map[i + 1          ] == ti) mv |=  8 // RIGHT
				if (i % this.wt != 0           && this.map[i - this.wt - 1] == ti) mv |= 16 // UP-LEFT
				if (i % this.wt != this.wt - 1 && this.map[i - this.wt + 1] == ti) mv |= 32 // UP-RIGHT
				if (i % this.wt != 0           && this.map[i + this.wt - 1] == ti) mv |= 64 // DOWN-LEFT
				if (i % this.wt != this.wt - 1 && this.map[i + this.wt + 1] == ti) mv |=128 // DOWN-RIGHT
				ti--
				mv = this.nbToIdx[mv]
				if (mv == undefined || mv == -1) mv = 22
				this.ctx.drawImage(this.tileSets[ti].tiles[mv],
					(i % this.wt) * this.tileSets[ti].tw,
					Math.floor(i / this.wt) * this.tileSets[ti].th)
			}
		}
		CTool.bindTexture(this.parentCon.gl, this.glTex.tex, this.cnv)
		this.nbToIdx = []
		// this.map = []
		this.loaded = true
	}

	draw() {
		if (!this.loaded) return
		this.parentCon.gl.bindTexture(this.parentCon.gl.TEXTURE_2D, this.glTex.tex)
		this.parentCon.gl.uniform2fv(this.parentCon.glParams.tSize, [
			this.glTex.width * (this.flipped ? -1 : 1),
			this.glTex.height])
		let _xOffs = Math.floor(this.x)
		let _yOffs = Math.floor(this.y)
		this.parentCon.gl.uniform2fv(this.parentCon.glParams.tOffs, [-_xOffs, -_yOffs])
		this.parentCon.gl.uniform4fv(this.parentCon.glParams.colorParam, [0,0,0,-1])
		this._vertexArr[0] = _xOffs
		this._vertexArr[1] = _yOffs
		this._vertexArr[2] = _xOffs + this.w
		this._vertexArr[3] = _yOffs
		this._vertexArr[4] = _xOffs
		this._vertexArr[5] = _yOffs + this.h
		this._vertexArr[6] = this._vertexArr[2]
		this._vertexArr[7] = this._vertexArr[5]
		this.parentCon.gl.bufferData(this.parentCon.gl.ARRAY_BUFFER, this._vertexArr, this.parentCon.gl.STATIC_DRAW)
		// Four is the number of vertices, which for images is always four.
		this.parentCon.gl.drawArrays(this.parentCon.gl.TRIANGLE_STRIP, 0, 4)

		if (this.showHitbox) {
			this.parentCon.color(255)
			for (let c = 0; c < this.colliders.length; c++) {
				this.parentCon.rect(...this.getHb(c))
				// this.parentCon.rect(0, 0, 10, 10)
			}
		}
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
	constructor(src, x, y, width, height, scale, centered) {
		super(src, x, y, width, height, scale, centered)
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

	/**
	 * Checks for two hitboxes intersecting
	 * @param {*} hbe Hitbox Element
	 * @param {*} colliderNum Collider number for TileMap collisions.
	 * @returns 
	 */
	intersects(hbe, colliderNum) {
		let b1 = this.getHb()
		let b2 = hbe.getHb(colliderNum)

		if (b1[1] + b1[3] > b2[1]
		&&  b1[0] + b1[2] > b2[0]
		&& (b1[1] + b1[3]) - b1[3] < (b2[1] + b2[3])
		&& (b1[0] + b1[2]) - b1[2] < (b2[0] + b2[2]))
			return true
		return false
	}

	physics(el) {
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
					* (this.scale + this.parentCon.objects[t].s)) continue
				this.avoidCollision(this.parentCon.objects[t])
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
	static bindTexture(gl, glTex, tx) {
		gl.bindTexture(gl.TEXTURE_2D, glTex)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tx)
	}

	static mod(n, m) {
		return ((n % m) + m) % m
	}

	static spreadRandom() {
		return (Math.random() * 100) % 1
	}

	static noise(x, y) {
		return (this._noise(x, y) + this._noise((x + 2) * 2, y * 2) / 2 + this._noise(x * 3, y * 3) / 3) * (6 / 11)
	}

	static _noise(x, y) {
		let _o = (x, y) => ((Math.sin(43 * Math.floor(x)) + Math.cos(51 * Math.floor(y))) * 40) % 2 - 1
		let _i = (a, b, c) => (1 - (1 - Math.cos(c * Math.PI)) / 2) * a + ((1 - Math.cos(c * Math.PI)) / 2) * b
		return _i(_i(_o(x, y), _o(x + 1, y), x % 1), _i(_o(x, y + 1), _o(x + 1, y + 1), x % 1), y % 1)
	}

	/**
	 * Converts a color from any representation into a 4-value array for use in WebGL.
	 * @param {Number} p1 Parameter 1 (light value, light value, red, red)
	 * @param {Number} p2 Parameter 2 (alpha, green, green)
	 * @param {Number} p3 Parameter 3 (blue, blue)
	 * @param {Number} p4 Parameter 4 (alpha)
	 * @returns 
	 */
	static glColor(p1, p2, p3, p4) {
		if (p1 == undefined) return [0,0,0,0]
		if (p2 == undefined) return [p1/255,p1/255,p1/255,1]
		if (p3 == undefined) return [p1/255,p1/255,p1/255,p2/255]
		if (p4 == undefined) return [p1/255,p2/255,p3/255,1]
		return [p1/255,p2/255,p3/255,p4/255]
	}

	/**
	 * Builds a WebGL shader.
	 * @param {String} vert Vertex shader code
	 * @param {String} frag Fragment shader code
	 * @returns The compiled program
	 */
	static buildShaderProgram(gl, vert, frag) {
		let program = gl.createProgram()
	
		// Compile vertex shader
		let vShader = gl.createShader(gl.VERTEX_SHADER)
		gl.shaderSource(vShader, vert)
		gl.compileShader(vShader)
		if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS))
			console.log("Error compiling vertex shader:\n" + gl.getShaderInfoLog(vShader).replace(/ERROR:/g, "\nERROR:"))
		gl.attachShader(program, vShader)
	
		// Compile fragment shader
		let fShader = gl.createShader(gl.FRAGMENT_SHADER)
		gl.shaderSource(fShader, "#ifdef GL_ES\nprecision highp float;\n#endif" + frag)
		gl.compileShader(fShader)
		if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS))
			console.log("Error compiling fragment shader:\n" + gl.getShaderInfoLog(fShader))
		gl.attachShader(program, fShader)
	
		gl.linkProgram(program)
	
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.log("Error linking shader program:")
			console.log(gl.getProgramInfoLog(program))
		}
	
		return program
	}

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
		let img = document.createElement("img")
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
	 * @returns {HTMLCanvasElement}
	 */
	static canvasFromString(str) {
		str = str.split('|')
		str[0] = parseInt(str[0], 16)
		str[1] = parseInt(str[1], 16)
		let canvas = document.createElement("canvas")
		canvas.width = str[0]
		canvas.height = str[1]
		str = str[2].split('').map(e => CTool.bin(e.charCodeAt(0) - 32, 6)).join('').split('')
		let ctx = canvas.getContext('2d')
		let dat = ctx.getImageData(0, 0, canvas.width, canvas.height)
		for (let i = 0; i < str.length; i++) {
			let _p = (Math.floor(i / canvas.height) + (i % canvas.height) * canvas.width) * 4
			dat.data[_p] = 255
			dat.data[_p + 1] = 255
			dat.data[_p + 2] = 255
			dat.data[_p + 3] = str[i] == "0" ? 0 : 255
		}
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

	/**
	 * Logs a warning to the console.
	 * @param  {...any} things The arguments for this warning
	 */
	static warning(...things) {
		console.warn("warning: " + things.join(" ") + "\n" + (()=>{
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

	multiplied2(mx, my) {
		return new Vec2(this.x * mx, this.y * my)
	}

	// Divides, Returns
	divideRet(v) {
		this.x /= v
		this.y /= v
		return this
	}

	addVec(v) {
		this.x += v.x
		this.y += v.y
	}

	// Added, doesn't mutate
	added(v) {
		return new Vec2(this.x + v.x, this.y + v.y)
	}

	added2(ax, ay) {
		return new Vec2(this.x + ax, this.y + ay)
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

	// Gets distance
	dist(v) {
		return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2)
	}

	// Gets distance in x plus distance in y
	cartesianDist(v) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y)
	}
}

class Rect {
	constructor(x, y, width, height, bottomRight) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.bottomRight = bottomRight
		if (bottomRight) this.reload()
	}

	/**
	 * Constructs the bottom-right point of the triangle.
	 */
	reload() {
		this.x2 = this.x + this.width
		this.y2 = this.y + this.height
	}

	coordInside(ix, iy) {
		// ERR: Throw an error!
		// if (!this.bottomRight) CTool.error("")
		return (ix >= this.x && ix <= this.x2
			&& iy >= this.y && iy <= this.y2) 
	}
}


class Controllers {
	/**
	 * Sets up a controller for the Console class.
	 * @param {*} element 
	 * @param {*} type 
	 */
	static new(element, type) {
		let types = {
			"platformer": {
				"left": ['a', 'A', "ArrowLeft"],
				"right": ['d', 'D', "ArrowRight"],
				"jump": [' ', 'w', 'W', "ArrowUp"],
				"_touch": [2, 2, [
					"jump", "jump",
					"left", "right"
				]]
			},
			"topDown": {
				"left": ['a', 'A', "ArrowLeft"],
				"right": ['d', 'D', "ArrowRight"],
				"up": ['w', 'W', "ArrowUp"],
				"down": ['s', 'S', "ArrowDown"],

				"_touch": [3, 3, [
					" ", "up", " ",
					"left", "switch", "right",
					" ", "down", " "
				]]
			}
		}
		for (let evt in types[type]) {
			if (evt == "_touch") {
				element.parentCon.touchArea(...types[type][evt])
			} else {
				element.parentCon.onKeyPressed(types[type][evt], evt)
				element.parentCon.nEvent(evt, () => {})
			}
		}
	}

	/**
	 * Makes the controller have an effect over an element
	 * @param {*} el Element to be acted upon
	 */
	static use(el) {
		// TODO: this here
	}
}

class Device {
	/**
	 * Checks if the device supports touch
	 * @returns {boolean}
	 */
	static touch() {
		return "ontouchend" in document
	}

	/**
	 * Checks if the browser is Safari (very badly)
	 * @returns {boolean}
	 */
	static isSafari() {
		return "WebKitNamespace" in window
	}

	/**
	 * Checks if the result is blurry and needs a second step to make it crisp.
	 * @returns {boolean}
	 */
	static outputIsBlurry() {
		return this.isSafari()
	}

	static getWindowSize() {
		return [window.innerWidth, window.innerHeight]
	}

	static getTime() {
		return Date.now()
	}
}

class Format {
	static timeMMSSHH(ms) {
		return this.padNum(Math.floor(ms / 60000), 2) + ":" + this.padNum(Math.floor((ms % 60000) / 1000), 2) + ":" + this.padNum(Math.floor((ms % 1000) / 10), 2)
	}

	static padNum(n, z) {
		n += ''
		while (n.length < z) n = '0' + n
		return n
	}
}
