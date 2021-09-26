
let _pixelSize = 1

function Sprite(src, x, y, w, h, centered) {
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
    el.update = function update() {
        this.style.left = this.xp + "px"
        this.style.top  = this.yp + "px"
        this.curAnimationTimer -= 1
        this.style.transform = (this.centered ? "translate(-50%, -50%) " : "") + (this.flipped ? "scaleX(-1) " : "")
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
        this.style.background = `url(${this.sourceUrl}) ${(this.animationFrame + this.animationStart) * -this.wv}px 0px`
    }
    el.hbOffsets = function hbOffsets(hb) {
        this.hb = hb
        this.hb.top    *= _pixelSize
        this.hb.bottom *= _pixelSize
        this.hb.left   *= _pixelSize
        this.hb.right  *= _pixelSize
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
        
        if (!this.intersects(el)) return
        let bt = this.getHb()
        let be = el.getHb()
        // console.log(this.intersects(el))
        let rd = (bt.right - be.left) / _pixelSize
        let ld = (be.right - bt.left) / _pixelSize
        let td = (bt.bottom - be.top) / _pixelSize
        if (td < rd && td < ld) {
            this.yp -= td
            this.speed.y = 0
            this.onGround = true
        }
        else if (ld < rd) this.xp += ld
        else this.xp -= rd
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
        _pixelSize = s
        this.width = w / s
        this.height = h / s
        this.el = document.createElement("div")
        this.el.style.overflow = "hidden"
        this.el.style.width  = (100 / s) + "%"
        this.el.style.height = (h / s) + "px"
        this.el.style.transformOrigin = "top left";
        this.el.style.transform = "scale(" + s + ")"
        this.sprites = []
        this.loopFn = () => {}
        document.body.appendChild(this.el)
        this.keys = {}
        window.addEventListener('keydown', e => { if (!(e.key.toLowerCase() in this.keys)) this.keys[e.key.toLowerCase()] = Date.now(); if (e.key == ' ') e.preventDefault() })
        window.addEventListener('keyup'  , e => { if (  e.key.toLowerCase() in this.keys ) delete this.keys[e.key.toLowerCase()] })
    }

    addSprite(spr) {
        this.sprites.push(spr)
        this.el.appendChild(spr)
        return spr
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
        for (let s = 0; s < ths.sprites.length; s++) {
            ths.sprites[s].update()
        }
    }
}
