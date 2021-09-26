
Console.prepareEnv()
let con = new Console(window.innerWidth, window.innerHeight, 3)

let ctBg = con.addSprite(Sprite("Tiles/Sky.png", con.width / 2, con.height / 2, con.width, con.height, true))
ctBg.imageCentered = true

let plant = con.addSprite(Sprite("Sprites/Plant.png", con.width / 3, con.height / 3, 8, 8, false))
plant.hasAnimation = true
plant.animationTimer = 10
plant.animationFrames = 41

// Player
let player = con.addSprite(Sprite("Sprites/Player.png", con.width / 2, con.height / 3, 16, 16, true))
player.speed = new Vec2(0, 0)
player.hasAnimation = true
player.animationFrames = 6
player.animationTimer = 6
player.hbOffsets({top: 3, bottom: 0, left: 6, right: 6})
player.lowerBar = con.addSprite(Sprite("Sprites/LowerBar.png", 0, 0, 4, 1, true))
player.crouchBar = con.addSprite(Sprite("Sprites/LowerBar.png", 0, 0, 2, 5, true))
player.isCrouched = false

// con.addTile(Sprite("Tiles/SmallBrick.png", con.width / 2, con.height / 2 + 8, 256, 8, true))
// con.addTile(Sprite("Tiles/SmallBrick.png", con.width / 2, con.height / 2 - 9, 200, 8, true))

function notZero(vl) {
    return vl != 0 && vl != undefined && vl != null
}

con.init(() => {
    Console.getImagePixels("Tiles/Map1.png", (px, w, h) => {
        let did = []
        for (let p = 0; p < px.length; p += 4) {
            if (did.includes(p)) continue
            did.push(p)
            let x = ((p / 4) % w) - 8
            let y = (Math.floor((p / 4) / w)) - 8
            if (px[p + 3] == 0) {
                // Air!
            } else if (px[p + 3] != 0) {
                // Brick!
                let ch = 1
                while (notZero(px[p + h * ch * 4 + 3]))
                    did.push(p + h * (ch++) * 4)
                let s = con.addTile(Sprite("Tiles/SmallBrick.png", con.width / 2 + 8 * x, con.height / 2 + 8 * y, 8, 8 * ch, false))
                s.style.border = "1px solid red"
                s.style.opacity = "0.25"
            }
        }
        con.loop(gameLoop)
    })
})

let frameCount = 0
let gameLoop = () => {
    player.lowerOnGround = false
    con.doPhysicsSprite(player)
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
    player.xp += player.speed.x * 0.3
    player.yp += player.speed.y * 0.3
    player.lowerBar.xp = player.xp
    player.lowerBar.yp = player.yp + 8
    player.crouchBar.xp = player.xp
    player.crouchBar.yp = player.yp - 2
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
