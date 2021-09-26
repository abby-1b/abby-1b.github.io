
Console.prepareEnv()
let con = new Console(window.innerWidth, window.innerHeight, 3)

let ctBg = con.addSprite(Sprite(con, "Tiles/Sky.png", con.width / 2 - 2, con.height / 2 - 2, con.width + 4, con.height + 4, true))
ctBg.imageCentered = true
ctBg.hasAnimation = true
ctBg.animationStart = 0
ctBg.animationFrames = 1
ctBg.animationTimer = 0

// let plant = con.addSprite(Sprite(con, "Sprites/Plant.png", con.width / 3, con.height / 3, 8, 8, false))
// plant.hasAnimation = true
// plant.animationTimer = 10
// plant.animationFrames = 41

// Player
let player = con.addSprite(Sprite(con, "Sprites/Player.png", con.width / 2, con.height / 2, 16, 16, true))
player.speed = new Vec2(0, 0)
player.hasAnimation = true
player.animationFrames = 6
player.animationTimer = 6
player.hbOffsets({top: 3, bottom: 0, left: 6, right: 6})
player.lowerBar = con.addSprite(Sprite(con, "Sprites/LowerBar.png", 0, 0, 4, 1, true))
player.crouchBar = con.addSprite(Sprite(con, "Sprites/LowerBar.png", 0, 0, 2, 5, true))
player.isCrouched = false

player.collidedWith = function(el, d) {
    if (el.sourceUrl == "Tiles/Bounce.png" && d == "top") {
        player.speed.y = -21

        player.isCrouched = false
        player.animationFrame = 0
        player.animationFrames = 3
        player.animationTimer = 10
        player.animationStart = 12
        player.loopAnimation = false
        player.curAnimationTimer = player.animationTimer
        player.onGround = false
    }
}

con.init(() => {
    Console.getImagePixels("Tiles/Map1.png", (px, w, h) => {
        function isBrick(vl) { return vl == 247 }
        function isBounce(vl) { return vl == 31 }
        let m = {
            BRICK: ["Tiles/SmallBrick.png"],
            BOUNCE: ["Tiles/Bounce.png"]
        }
        let bars = []
        let did = []
        for (let p = 0; p < px.length; p += 4) {
            if (did.includes(p)) continue
            did.push(p)
            let x = ((p / 4) % w) - 8
            let y = (Math.floor((p / 4) / w)) - 8
            if (px[p + 3] == 0) {
                // Air!
            } else if (isBrick(px[p])) {
                // Brick!
                let ch = 1
                while (isBrick(px[p + w * ch * 4]))
                    did.push(p + w * (ch++) * 4)
                bars.push([x, y, 1, ch, "BRICK"])
            } else if (isBounce(px[p])) {
                // Bounce!
                let ch = 1
                while (isBounce(px[p + w * ch * 4]))
                    did.push(p + w * (ch++) * 4)
                bars.push([x, y, 1, ch, "BOUNCE"])
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
            let ss = 8
            let s = con.addTile(Sprite(con, m[bars[b][4]][0], con.width / 2 + ss * bars[b][0], con.height / 2 + ss * bars[b][1], ss * bars[b][2], ss * bars[b][3], false))
            // s.style.border = "1px solid red"
            // s.style.opacity = "0.25"
        }
        con.loop(gameLoop)
    })
})

let frameCount = 0
let gameLoop = () => {
    con.camPos.x = -player.xp + con.width / 2
    con.camPos.y = -player.yp + con.height / 2
    ctBg.xp = -con.camPos.x + con.width / 2
    ctBg.yp = -con.camPos.y + con.height / 2
    ctBg.animationStart = player.xp / 1000
    player.lowerOnGround = false
    for (let a = 0; a < 2; a++) {
        con.doPhysicsSprite(player)
        player.xp += player.speed.x * (0.3 / 2)
        player.yp += player.speed.y * (0.3 / 2)
        player.lowerBar.xp = player.xp
        player.lowerBar.yp = player.yp + 8
        player.crouchBar.xp = player.xp
        player.crouchBar.yp = player.yp - 2
    }
    if (player.onGround && !player.lowerOnGround) player.onGround = false
    player.speed.add(new Vec2(
        ('d' in con.keys ? 1 : 0) - ('a' in con.keys ? 1 : 0), 0).normalized())
    if ('s' in con.keys && player.onGround) {
        if (player.animationStart != 17) {
            player.animationStart = 17
            player.curAnimationTimer = 4
            player.animationFrame = 0
            player.animationFrames = 2
            player.animationTimer = 4
            player.loopAnimation = false
        }
        player.isCrouched = true
        player.hbOffsets({top: 10, bottom: 0, left: 6, right: 6})
        player.speed.x *= 0.7
    } else {
        if (player.canUnCrouch) {
            player.hbOffsets({top: 3, bottom: 0, left: 6, right: 6})
            player.isCrouched = false
        }
        if (!player.canUnCrouch) player.speed.x *= 0.7
        else player.speed.x *= 0.87 //0.87
    }
    if (' ' in con.keys) {
        if (player.onGround && player.canUnCrouch) {
            player.isCrouched = false
            player.animationFrame = 0
            player.animationFrames = 3
            player.animationTimer = 5
            player.animationStart = 12
            player.loopAnimation = false
            player.curAnimationTimer = player.animationTimer
            player.speed.y -= 9
            player.onGround = false
        }
    }
    if (!player.onGround)
        player.speed.y += 0.6
    if (player.canUnCrouch && player.onGround && (!(' ' in con.keys)) && (!('s' in con.keys))) {
        player.loopAnimation = true
        player.animationFrames = 6
        if (Math.abs(player.speed.x) > 1) {
            player.animationStart = 6
            player.animationTimer = 3
        } else {
            player.animationStart = 0
            player.animationTimer = 6
        }
    }
    if ((!player.loopAnimation) && player.animationStart == 12 && player.speed.y > 0) {
        player.animationStart = 15
        player.animationFrame = 0
        player.animationFrames = 2
        player.animationTimes = 5
        player.curAnimationTimer = player.animationTimer
    }
    player.flipped = player.speed.x < 0
    player.canUnCrouch = true
    frameCount++
}
