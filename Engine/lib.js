
// function Sprite(pCon, src, x, y, w, h, centered) {
//     let el = document.createElement("spr")
//     el.centered = centered
//     if (centered)
//         el.style.transform = "translate(-50%, -50%)"
//     el.sourceUrl = src
//     el.style.background = `url(${src}) 0px 0px`
//     el.style.width = w + "px"
//     el.style.height = h + "px"
//     el.style.position = "absolute"
//     el.classList = "noSmooth"
//     el.xp = x
//     el.yp = y
//     el.wv = w
//     el.hv = h
//     el.hb = {top: 0, bottom: 0, left: 0, right: 0}
//     el.animationStart = 0
//     el.animationFrame = 0
//     el.animationFrames = 0
//     el.animationTimer = 0
//     el.curAnimationTimer = 0
//     el.flipped = false
//     el.loopAnimation = true
//     el.lowerOnGround = false
//     el.canUnCrouch = true
//     el.hasAnimation = false
//     el.imageCentered = false
//     el.parentCon = pCon
//     el.collidedWith = () => {}
//     el.update = function update() {
//         this.style.left = (this.xp + Math.round(this.parentCon.camPos.x)) + "px"
//         this.style.top  = (this.yp + Math.round(this.parentCon.camPos.y)) + "px"
//         this.style.transform = (this.centered ? "translate(-50%, -50%) " : "") + (this.flipped ? "scaleX(-1) " : "")
//         if (this.hasAnimation) {
//             if (this.animationFrame <= this.animationFrames && this.curAnimationTimer > 0) this.curAnimationTimer -= 1
//             if (this.curAnimationTimer <= 0) {
//                 this.animationFrame++
//                 this.curAnimationTimer = this.animationTimer
//             }
//             if (this.animationFrame >= this.animationFrames) {
//                 if (this.loopAnimation) {
//                     this.animationFrame -= this.animationFrames
//                 } else {
//                     this.animationFrame = this.animationFrames - 1
//                 }
//             }
//             if (this.imageCentered) {
//                 this.style.background = `url(${this.sourceUrl}) calc(${(this.animationFrame + this.animationStart) * -this.wv}px + 50%) 50%`
//             } else {
//                 this.style.background = `url(${this.sourceUrl}) ${(this.animationFrame + this.animationStart) * -this.wv}px 0px`
//             }
//         } else {
//             this.style.background = `url(${this.sourceUrl}) ${this.imageCentered ? "50% 50%" : ""}`
//         }
//     }
//     el.getHb = function() {
//         let ret = this.getBoundingClientRect()
//         return {
//             left: ret.left + this.hb.left,
//             right: ret.right - this.hb.right,
//             top: ret.top + this.hb.top,
//             bottom: ret.bottom - this.hb.bottom,
//             width: ret.width - (this.hb.right + this.hb.left),
//             height: ret.height - (this.hb.bottom + this.hb.top)
//         }
//     }
//     el.intersects = function(el) {
//         let b1 = this.getHb()
//         let b2 = el.getHb()
//         if(b1.top    + b1.height > b2.top
//         && b1.left   + b1.width  > b2.left
//         && b1.bottom - b1.height < b2.bottom
//         && b1.right  - b1.width  < b2.right) {
//             return true
//         }
//         return false
//     }
//     el.doPhysics = function(el) {
//         // this.xp -= (this.getBoundingClientRect().left - el.getBoundingClientRect().right) / 2
//         if (!this.lowerOnGround) this.lowerOnGround = this.lowerBar.intersects(el)
//         if (this.canUnCrouch) this.canUnCrouch = !this.crouchBar.intersects(el)
//         if (!this.intersects(el)) return
//         let bt = this.getHb()
//         let be = el.getHb()
//         // console.log(this.intersects(el))
//         let rd = (bt.right - be.left) / this.parentCon.pixelSize
//         let ld = (be.right - bt.left) / this.parentCon.pixelSize
//         let td = (bt.bottom - be.top) / this.parentCon.pixelSize
//         let bd = (be.bottom - bt.top) / this.parentCon.pixelSize
//         if (td < rd && td < ld && td < bd) {
//             this.yp -= td
//             this.speed.y = 0
//             this.onGround = true
//             this.collidedWith(el, "top")
//         } else if (bd < rd && bd < ld) {
//             this.yp += bd
//             this.speed.y = 0
//         } else if (ld < rd) {
//             this.xp += ld
//             this.speed.x = 0
//         } else {
//             this.xp -= rd
//             this.speed.x = 0
//         }
//     }
//     // el.src = src
//     el.update()
//     return el
// }

// class Console {
//     constructor(w, h, s) {
//         this.sprites = []
//         this.tiles = []
//         this.camPos = new Vec2(0, 0)
//         this.loopFn = () => {}
//         document.body.appendChild(this.el)
//         document.body.style.overflow = "hidden"
//         this.keys = {}
//         window.addEventListener('keydown', e => { if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now(); if (e.key == ' ') e.preventDefault() })
//         window.addEventListener('keyup'  , e => { if (  e.key.toLowerCase() in this.keys ) delete this.keys[e.key.toLowerCase()] })
//     }

//     addTile(til) {
//         this.tiles.push(til)
//         this.el.appendChild(til)
//         return til
//     }

//     doPhysicsSprite(spr) {
//         // console.log(spr)
//         for (let s = 0; s < this.tiles.length; s++) {
//             spr.doPhysics(this.tiles[s])
//         }
//     }

//     updateAll(ths) {
//         ths.loopFn()
//         for (let s = 0; s < ths.tiles.length; s++)
//             ths.tiles[s].update()
//         for (let s = 0; s < ths.sprites.length; s++)
//             ths.sprites[s].update()
//     }

    // static getImagePixels(src, fn) {
    //     var img = document.createElement("img")
    //     img.onload = function() {
    //         var canvas = document.createElement('canvas')
    //         canvas.width = img.width
    //         canvas.height = img.height
    //         canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height)
    //         fn(canvas.getContext('2d').getImageData(0, 0, img.width, img.height).data, img.width, img.height)
    //     }
    //     img.src = src
    // }
// }

class Console {
    constructor(w, h, col) {
        let metaTags = {
            "description": "This uses an unnamed JS engine made by CodeIGuess!",
            "viewport": "width=device-width, initial-scale=1"
        }
        for (let mt in metaTags) {
            let meta = document.createElement('meta')
            meta.name = mt
            meta.content = metaTags[mt]
            document.head.appendChild(meta)
        }
        document.body.style.margin  = "0"
        document.body.style.padding = "0"
        document.body.style.backgroundColor = col | "white"
        this.width = Math.ceil(w)
        this.height = Math.ceil(h)
        this.el = document.createElement("canvas")
        this.el.width = this.width
        this.el.height = this.height
        this.el.style.width = "100vw"
        this.el.style.height = "min(100vh,100%)"
        this.el.style.objectFit = "contain"
        this.el.style.position = "absolute"
        this.el.style.transform = "translate(-50%,-50%)"
        this.el.style.left = "50%"
        this.el.style.top = "50%"
        this.ctx = this.el.getContext('2d')
        this.ctx.imageSmoothingEnabled= false
        this.imageIndexes = {}
        this.imageElements = []
        this.sprites = [] // Everything that is a sprite
        this.tiles = [] // Everything that is a tile
        this.objects = [] // Everything that is an object
        this.camPos = new Vec2(0, 0)
        this.physics = {
            gravity: new Vec2(0, -1)
        }
        this.loopFn = () => {}
        this.initFn = () => {}
        document.body.appendChild(this.el)
        document.body.style.overflow = "hidden"
        this.keys = {}
        window.addEventListener('keydown', e => { if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now(); if (e.key == ' ') e.preventDefault() })
        window.addEventListener('keyup'  , e => { if (  e.key.toLowerCase() in this.keys ) delete this.keys[e.key.toLowerCase()] })
    }

    init(fn) { fn() }

    loop(fn) {
        // Yes, these run on 45 fps. Deal with it.
        this.loopFn = fn
        setInterval(this.updateAll, 1000 / 45, this)
    }

    updateAll(ths) {
        ths.ctx.clearRect(0, 0, ths.width, ths.height)
        ths.loopFn()
        for (let s = 0; s < ths.tiles.length; s++) { ths.tiles[s].draw() }
        for (let s = 0; s < ths.sprites.length; s++) { ths.sprites[s].draw() }
        for (let s = 0; s < ths.objects.length; s++) { ths.objects[s].draw() }
    }

    // Objects can have animation and physics.
    nObj(obj) {
        return this.objects[this.objects.push(this.imageThing(obj)) - 1]
    }

    // Sprites can have animation, but no physics.
    nSprite(spr) {
        return this.sprites[this.sprites.push(this.imageThing(spr)) - 1]
    }

    // Tiles can have (static) physics, but no animation.
    nTile(til) {
        return this.tiles[this.tiles.push(this.imageThing(til)) - 1]
    }

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
        spr.src = this.imageIndexes[spr.src]
        return spr
    }
}

class Sprite {
    constructor(src, x, y, w, h, s, c) {
        this.src = src
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.s = s | 1
        this.c = c
        this.animation = [0, 0, true] // frame, timer, paused
        this.animationStates = {} // start, end, timer, loop, pause frame
        this.animationState = ""
        this.showHitbox = false
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
        this.animationState = nam
        this.animation[2] = false
        this.animation[0] = this.animationStates[this.animationState][0]
    }

    paused() { return this.animation[2] }
    pause() { this.animation[2] = true }
    play(n) { this.animation[2] = false; if (n != undefined) { this.animation[0] = n } }
    frame(n) { this.animation[0] = n }

    drawHb() {
        this.parentCon.ctx.strokeRect(
            Math.floor(this.x - (this.c ? this.w / 2 : 0)) + 0.5,
            Math.floor(this.y - (this.c ? this.h / 2 : 0)) + 0.5,
            this.w * this.s - 1, this.h * this.s - 1)
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
        // Hitbox
        if (this.showHitbox) {
            this.parentCon.ctx.strokeStyle = "#f00b"
            this.drawHb()
        }
        // Sprite
        this.parentCon.ctx.drawImage(this.parentCon.imageElements[this.src],
            this.animation[0] * this.w, 0,
            this.w, this.h,
            Math.floor(this.x - (this.c ? this.w / 2 : 0)),
            Math.floor(this.y - (this.c ? this.h / 2 : 0)),
            this.w * this.s, this.h * this.s)
    }
}

class PhysicsActor extends Sprite {
    constructor(src, x, y, w, h, s, c) {
        super(src, x, y, w, h, s, c)
        this.speed = new Vec2(0, 0)
        this.locked = false
        this.hb = {top: 0, bottom: 0, left: 0, right: 0}
    }

    hbOffsets(hb) { this.hb = hb }

    getHb() {
        return [
            Math.floor(this.x - (this.c ? this.w / 2 : 0)) + 0.5 + this.hb.left,
            Math.floor(this.y - (this.c ? this.h / 2 : 0)) + 0.5 + this.hb.top,
            this.w * this.s - (1 + this.hb.left + this.hb.right), this.h * this.s - (1 + this.hb.top + this.hb.bottom)
        ]
    }

    intersects(hbe) {
        let b1 = this.getHb()
        let b2 = hbe.getHb()

        if (b1[1] + b1[3] >= b1[1]
        &&  b1[0] + b1[2] >= b2[0]
        && (b1[1] + b1[3]) - b1[3] <= (b2[1] + b2[3])
        && (b1[0] + b1[2]) - b1[2] <= (b2[0] + b2[2])) {
            return true
        }
        return false
    }

    drawHb() {
        this.parentCon.ctx.strokeRect(
            Math.floor(this.x - (this.c ? this.w / 2 : 0)) + 0.5 + this.hb.left,
            Math.floor(this.y - (this.c ? this.h / 2 : 0)) + 0.5 + this.hb.top,
            this.w * this.s - (1 + this.hb.left + this.hb.right), this.h * this.s - (1 + this.hb.top + this.hb.bottom))
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
}

class Vec2 {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    mul(v) {
        this.x *= v
        this.y *= v
    }

    add(v2) {
        this.x += v2.x
        this.y += v2.y
    }

    normalize() {
        let d = Math.sqrt(this.x * this.x + this.y * this.y)
        if (d == 0) return
        this.x /= d
        this.y /= d
    }

    normalized() {
        let d = Math.sqrt(this.x * this.x + this.y * this.y)
        if (d == 0) return new Vec2(0, 0)
        return new Vec2(this.x / d, this.y / d)
    }
}
