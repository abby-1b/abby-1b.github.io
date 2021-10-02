
// let _pixelSize = 1

function Sprite(pCon, src, x, y, w, h, centered) {
    let el = document.createElement("spr")
    el.centered = centered
    if (centered)
        el.style.transform = "translate(-50%, -50%)"
    el.sourceUrl = src
    el.style.background = `url(${src}) 0px 0px`
    el.style.width = w + "px"
    el.style.height = h + "px"
    el.style.position = "absolute"
    el.classList = "noSmooth"
    el.xp = x
    el.yp = y
    el.wv = w
    el.hv = h
    el.hb = {top: 0, bottom: 0, left: 0, right: 0}
    el.animationStart = 0
    el.animationFrame = 0
    el.animationFrames = 0
    el.animationTimer = 0
    el.curAnimationTimer = 0
    el.flipped = false
    el.loopAnimation = true
    el.lowerOnGround = false
    el.canUnCrouch = true
    el.hasAnimation = false
    el.imageCentered = false
    el.parentCon = pCon
    el.collidedWith = () => {}
    el.update = function update() {
        this.style.left = (this.xp + Math.round(this.parentCon.camPos.x)) + "px"
        this.style.top  = (this.yp + Math.round(this.parentCon.camPos.y)) + "px"
        this.style.transform = (this.centered ? "translate(-50%, -50%) " : "") + (this.flipped ? "scaleX(-1) " : "")
        if (this.hasAnimation) {
            if (this.animationFrame <= this.animationFrames && this.curAnimationTimer > 0) this.curAnimationTimer -= 1
            if (this.curAnimationTimer <= 0) {
                this.animationFrame++
                this.curAnimationTimer = this.animationTimer
            }
            if (this.animationFrame >= this.animationFrames) {
                if (this.loopAnimation) {
                    this.animationFrame -= this.animationFrames
                } else {
                    this.animationFrame = this.animationFrames - 1
                }
            }
            if (this.imageCentered) {
                this.style.background = `url(${this.sourceUrl}) calc(${(this.animationFrame + this.animationStart) * -this.wv}px + 50%) 50%`
            } else {
                this.style.background = `url(${this.sourceUrl}) ${(this.animationFrame + this.animationStart) * -this.wv}px 0px`
            }
        } else {
            this.style.background = `url(${this.sourceUrl}) ${this.imageCentered ? "50% 50%" : ""}`
        }
    }
    el.hbOffsets = function hbOffsets(hb) {
        this.hb = hb
        this.hb.top    *= this.parentCon.pixelSize
        this.hb.bottom *= this.parentCon.pixelSize
        this.hb.left   *= this.parentCon.pixelSize
        this.hb.right  *= this.parentCon.pixelSize
    }
    el.getHb = function() {
        let ret = this.getBoundingClientRect()
        return {
            left: ret.left + this.hb.left,
            right: ret.right - this.hb.right,
            top: ret.top + this.hb.top,
            bottom: ret.bottom - this.hb.bottom,
            width: ret.width - (this.hb.right + this.hb.left),
            height: ret.height - (this.hb.bottom + this.hb.top)
        }
    }
    el.intersects = function(el) {
        let b1 = this.getHb()
        let b2 = el.getHb()
        if(b1.top    + b1.height > b2.top
        && b1.left   + b1.width  > b2.left
        && b1.bottom - b1.height < b2.bottom
        && b1.right  - b1.width  < b2.right) {
            return true
        }
        return false
    }
    el.doPhysics = function(el) {
        // this.xp -= (this.getBoundingClientRect().left - el.getBoundingClientRect().right) / 2
        if (!this.lowerOnGround) this.lowerOnGround = this.lowerBar.intersects(el)
        if (this.canUnCrouch) this.canUnCrouch = !this.crouchBar.intersects(el)
        if (!this.intersects(el)) return
        let bt = this.getHb()
        let be = el.getHb()
        // console.log(this.intersects(el))
        let rd = (bt.right - be.left) / this.parentCon.pixelSize
        let ld = (be.right - bt.left) / this.parentCon.pixelSize
        let td = (bt.bottom - be.top) / this.parentCon.pixelSize
        let bd = (be.bottom - bt.top) / this.parentCon.pixelSize
        if (td < rd && td < ld && td < bd) {
            this.yp -= td
            this.speed.y = 0
            this.onGround = true
            this.collidedWith(el, "top")
        } else if (bd < rd && bd < ld) {
            this.yp += bd
            this.speed.y = 0
        } else if (ld < rd) {
            this.xp += ld
            this.speed.x = 0
        } else {
            this.xp -= rd
            this.speed.x = 0
        }
    }
    // el.src = src
    el.update()
    return el
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
        let d = Math.sqrt(this.x*this.x + this.y*this.y)
        if (d == 0) return
        this.x /= d
        this.y /= d
    }

    normalized() {
        let d = Math.sqrt(this.x*this.x + this.y*this.y)
        if (d == 0) return new Vec2(0, 0)
        return new Vec2(this.x / d, this.y / d)
    }

}

class Console {
    static prepareEnv() {
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
    }

    static lerp(a, b, v) {
        return a * (1 - v) + b * v
    }

    static map(v, ir1, ir2, or1, or2) {
        return or1 + (or2 - or1) * (v - ir1) / (ir2 - ir1)
    }

    init(fn) {
        fn()
    }

    loop(fn) {
        // Yes, these run on 45 fps. Deal with it.
        // setInterval(function(){ updateAll(); fn() }, 1000 / 45)
        this.loopFn = fn
        setInterval(this.updateAll, 1000 / 45, this) // 1000 / 45
    }
    
    constructor(w, h, s) {
        this.pixelSize = s
        this.width = Math.ceil(w / s)
        this.height = Math.ceil(h / s)
        this.el = document.createElement("div")
        this.el.style.overflow = "hidden"
        this.el.style.width  = Math.ceil(100 / s) + "%"
        this.el.style.height = Math.ceil(h / s) + "px"
        this.el.style.transformOrigin = "top left";
        this.el.style.transform = "scale(" + s + ")"
        this.el.style.transition = "filter 3s"
        this.sprites = []
        this.tiles = []
        this.camPos = new Vec2(0, 0)
        this.loopFn = () => {}
        document.body.appendChild(this.el)
        document.body.style.overflow = "hidden"
        this.keys = {}
        window.addEventListener('keydown', e => { if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now(); if (e.key == ' ') e.preventDefault() })
        window.addEventListener('keyup'  , e => { if (  e.key.toLowerCase() in this.keys ) delete this.keys[e.key.toLowerCase()] })
    }

    addSprite(spr) {
        spr.parentCon = this
        this.sprites.push(spr)
        this.el.appendChild(spr)
        return spr
    }

    addTile(til) {
        this.tiles.push(til)
        this.el.appendChild(til)
        return til
    }

    doPhysicsSprite(spr) {
        // console.log(spr)
        for (let s = 0; s < this.tiles.length; s++) {
            spr.doPhysics(this.tiles[s])
        }
    }

    refreshSprites() {
        let sprs = this.el.getElementsByClassName("spr")
        for (let s = 0; s < sprs.length; s++)
            this.el.removeChild(sprs[s])
        for (let s = 0; s < this.sprites.length; s++)
            this.el.appendChild(this.sprites[s].el)
    }

    updateAll(ths) {
        ths.loopFn()
        for (let s = 0; s < ths.tiles.length; s++)
            ths.tiles[s].update()
        for (let s = 0; s < ths.sprites.length; s++)
            ths.sprites[s].update()
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