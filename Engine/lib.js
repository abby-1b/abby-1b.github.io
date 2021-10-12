
class Console {
    constructor(h, col) {
        let metaTags = {
            "description": "This uses an unnamed JS engine made by CodeIGuess!",
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
        this.el.style.position = "absolute"
        this.el.style.transform = "translate(-50%,-50%)"
        this.el.style.left = this.el.style.top = "50%"
        this.ctx = this.el.getContext('2d')
        this.ctx.imageSmoothingEnabled= false
        this.imageIndexes = {}
        this.imageElements = []
        this.sprites = [] // Everything that is a sprite
        this.bgSprites = [] // Sprites that go behind everything
        this.tiles = [] // Everything that is a tile
        this.objects = [] // Everything that is an object
        this.camPos = new Vec2(0, 0)
        this.followInterval = 0
        this.physics = {
            gravity: new Vec2(0.0, 0.015),
            // friction: new Vec2(0.9, 0.995)
            friction: new Vec2(0.9, 0.995),
            groundFriction: new Vec2(0.9, 0.995)
        }
        this.fonts = {"": "20px Arial"}
        this.currentFont = ""
        this.events = {}
        this.loopFn = () => {}
        this.initFn = () => {}
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
    follow(el, interval) {
        this.following = el
        this.followInterval = interval
    }

    // Loop
    init(fn) { fn() }

    loop(fn) {
        // Yes, these run on 45 fps. Deal with it.
        this.loopFn = fn
        setInterval(this.updateAll, 1000 / 45, this) // 1000 / 45
    }

    updateAll(ths) {
        ths.camPos.lerp(
            (-ths.following.pos.x + ths.width  / 2) - ths.following.speed.x * 12 - ths.following.w * ths.following.s * 0.5,
            (-ths.following.pos.y + ths.height / 2) - ths.following.speed.y * 4  - ths.following.h * ths.following.s * 0.5,
             ths.followInterval)
        ths.ctx.clearRect(0, 0, ths.width, ths.height)
        for (let s = 0; s < ths.bgSprites.length; s++) { ths.bgSprites[s].draw() }
        for (let s = 0; s < ths.tiles.length; s++) { ths.tiles[s].draw() }
        for (let s = 0; s < ths.sprites.length; s++) { ths.sprites[s].draw() }
        for (let s = 0; s < ths.objects.length; s++) {
            if (ths.objects[s].constructor.name == "PhysicsActor") {
                ths.objects[s].collided = false
                ths.objects[s].onGround = false
                for (let a = 0; a < 5; a++) {
                    ths.objects[s].physics()
                    for (let t = 0; t < ths.tiles.length; t++) {
                        ths.objects[s].avoidCollision(ths.tiles[t])
                    }
                    for (let t = 0; t < ths.objects.length; t++) {
                        if (s != t) ths.objects[s].avoidCollision(ths.objects[t])
                    }
                }
            }
            ths.objects[s].draw()
        }
        ths.loopFn()
        ths.frameCount++
    }

    // Objects can have animation and physics.
    nObj(obj) {
        return this.objects[this.objects.push(this.imageThing(obj)) - 1]
    }

    // Sprites can have animation, but no physics.
    nSprite(spr) {
        return this.sprites[this.sprites.push(this.imageThing(spr)) - 1]
    }

    // Sprites can have animation, but no physics.
    nBgSprite(spr) {
        return this.bgSprites[this.bgSprites.push(this.imageThing(spr)) - 1]
    }

    // Tiles can have (static) physics, but no animation.
    nTile(til) {
        return this.tiles[this.tiles.push(this.imageThing(til)) - 1]
    }

    // Adding any image thing. Supposed to be private.
    imageThing(spr) {
        spr.parentCon = this
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
            i.addEventListener('load', () => {
                spr.imageLoaded()
            })
            i.src = spr.src
            this.imageIndexes[spr.src] = this.imageElements.push(i) - 1
        }
        spr.srcStr = spr.src
        spr.src = this.imageIndexes[spr.src]
        return spr
    }

    nFont(name, url) {
        this.fonts[name] = new FontFace(name, 'url(' + url + ')')
        this.fonts[name].load().then((font) => {
            document.fonts.add(font)
        })
    }

    font(name) {
        this.currentFont = name
    }

    text(t, x, y) {
        this.ctx.fillStyle = "black"
        this.ctx.font = "1em " + this.currentFont
        this.ctx.fillText(t, x, y)
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
        this.animationStates = {} // start, end, timer, loop, pause frame
        this.animationState = ""
        this.showHitbox = false // false
        this.flipped = false
        this.collided = false
        this.collisionEvents = []
        this.hb = {top: 0, bottom: 0, left: 0, right: 0}
    }

    hbOffsets(hb) { this.hb = hb }

    getHb() {
        if (this.flipped) {
            return [
                this.pos.x - (this.c ? this.w / 2 : 0) + this.hb.right * this.s,
                this.pos.y - (this.c ? this.h / 2 : 0) + this.hb.top * this.s,
                this.w * this.s - (0 + this.hb.right * this.s + this.hb.left * this.s), this.h * this.s - (0 + this.hb.top * this.s + this.hb.bottom * this.s)
            ]
        } else {
            return [
                this.pos.x - (this.c ? this.w / 2 : 0) + this.hb.left * this.s,
                this.pos.y - (this.c ? this.h / 2 : 0) + this.hb.top * this.s,
                this.w * this.s - (0 + this.hb.left * this.s + this.hb.right * this.s), this.h * this.s - (0 + this.hb.top * this.s + this.hb.bottom * this.s)
            ]
        }
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
        for (let e = 0; e < this.collisionEvents.length; e++) {
            this.collisionEvents[e](el, d)
        }
    }

    onCollision(fn) {
        this.collisionEvents.push(fn)
    }

    draw() {
        // Animation
        if (!this.animation[2]) {
            if (this.animation[1]-- == 0) {
                this.animation[1] = this.animationStates[this.animationState][2]
                if (this.animation[0] == this.animationStates[this.animationState][4]) {
                    this.animation[2] = true
                }
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
        let repeatedPattern = this.parentCon.ctx.createPattern(this.parentCon.imageElements[this.src], 'repeat')
        this.parentCon.ctx.fillStyle = repeatedPattern
        repeatedPattern.setTransform(new DOMMatrix([(this.flipped ? -this.s : this.s), 0, 0, this.s, 
            Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) + this.parentCon.camPos.x) - (this.flipped ? (-(this.animation[0] + 1) * this.w) : (this.animation[0] * this.w)) * this.s,
            Math.floor(this.pos.y - (this.c ? this.h / 2 : 0) + this.parentCon.camPos.y)
        ]))
        this.parentCon.ctx.fillRect(
            Math.floor(this.pos.x - (this.c ? this.w / 2 : 0) + this.parentCon.camPos.x),
            Math.floor(this.pos.y - (this.c ? this.h / 2 : 0) + this.parentCon.camPos.y),
            this.w * this.s, this.h * this.s)
        // Hitbox
        if (this.showHitbox) {
            this.parentCon.ctx.strokeStyle = (this.collided ? "#f0f9" : "#f009")
            this.drawHb()
        }
    }
}

class Tile extends Sprite {
    constructor(src, x, y, w, h, s, c) {
        super(src, x, y, w, h, s ,c)
        this.type = "Tile"
    }
}

class PhysicsActor extends Sprite {
    constructor(src, x, y, w, h, s, c) {
        super(src, x, y, w, h, s, c)
        this.type = "PhysicsActor"
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

        if (b1[1] + b1[3] >= b2[1]
        &&  b1[0] + b1[2] >= b2[0]
        && (b1[1] + b1[3]) - b1[3] <= (b2[1] + b2[3])
        && (b1[0] + b1[2]) - b1[2] <= (b2[0] + b2[2])) {
            return true
        }
        return false
    }

    physics(el) {
        this.speed.x = (this.speed.x + this.parentCon.physics.gravity.x) * this.parentCon.physics[(this.collided && this.groundFriction ? "groundFriction" : "friction")].x
        this.speed.y = (this.speed.y + this.parentCon.physics.gravity.y) * this.parentCon.physics[(this.collided && this.groundFriction ? "groundFriction" : "friction")].y
        this.pos.add(this.speed)
    }

    avoidCollision(el) {
        if (this.intersects(el)) {
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
                this.speed.y = Math.min(-this.speed.y * this.bounce, 0)
                this.onGround = true
                this.collidedWith(el, "top")
            } else if (bd < rd && bd < ld) {
                this.pos.y += bd
                this.speed.y = Math.max(-this.speed.y * this.bounce, 0)
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
    static lerp(a, b, v) {
        return a * (1 - v) + b * v
    }

    static map(v, ir1, ir2, or1, or2) {
        return or1 + (or2 - or1) * (v - ir1) / (ir2 - ir1)
    }

    static getImagePixels(src, fn) {
        var img = document.createElement("img")
        img.onload = function() {
            var canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
            fn(canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data, img.width, img.height)
        }
        img.src = src
    }

    static findTilePos(tiles, type, def) {
        let offs = def ? def : new Vec2(0, 0)
        for (let b = 0; b < tiles.length; b++) {
            if (tiles[b].type == type) {
                offs.set(tiles[b].x, tiles[b].y)
                break
            }
        }
        return offs
    }

    static tileMapFrom(src, types, callback) {
        this.getImagePixels(src, (px, w, h) => {
            function getType(p1, p2, p3) {
                for (let t in types)
                    if (types[t][1] == p1 && types[t][2] == p2 && types[t][3] == p3)
                        return t
                return false
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
}

class Vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y
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
    mul(v) {
        this.x *= v
        this.y *= v
    }

    // Multiplies by vector
    mulV(v) {
        this.x *= v.x
        this.y *= v.y
    }

    // Multiplies, returns
    mulr(v) {
        this.x *= v
        this.y *= v
        return this
    }

    // Multiplied, doesn't mutate
    muld(v) {
        return new Vec2(this.x * v, this.y * v)
    }

    add(v) {
        this.x += v.x
        this.y += v.y
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
}
