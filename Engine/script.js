
Console.prepareEnv()
let con = new Console(window.innerWidth, window.innerHeight, 3)

let player = con.addSprite(Sprite("Sprites/Player.png", con.width / 2, con.height / 3, 16, 16, true))
player.speed = new Vec2(0, 0)
player.animationFrames = 6
player.animationTimer = 6
player.hbOffsets({top: 0, bottom: 0, left: 6, right: 6})
player.lowerBar = con.addSprite(Sprite("Sprites/LowerBar.png", 0, 0, 4, 1, true))
player.crouchBar = con.addSprite(Sprite("Sprites/LowerBar.png", 0, 0, 4, 1, true))

con.addTile(Sprite("Tiles/SmallBrick.png", con.width / 2, con.height / 2 + 8, 256, 8, true))
con.addTile(Sprite("Tiles/SmallBrick.png", con.width / 2, con.height / 2 - 8, 8, 8, true))

con.init(() => {
    
})

let frameCount = 0

con.loop(() => {
    console.log(player.canUnCrouch)
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
        player.hbOffsets({top: 10, bottom: 0, left: 6, right: 6})
        player.speed.x *= 0.7
    } else {
        if (player.canUnCrouch) player.hbOffsets({top: 0, bottom: 0, left: 6, right: 6})
        player.speed.x *= 0.87 //0.87
    }
    if (' ' in con.keys) {
        if (player.onGround) {
            player.animationFrame = 0
            player.animationFrames = 3
            player.animationTimer = 5
            player.animationStart = 12
            player.loopAnimation = false
            player.curAnimationTimer = player.animationTimer
            player.speed.y -= 11
            player.onGround = false
        }
    }
    if (!player.onGround)
        player.speed.y += 0.9
    // if (!player.onGround)
    //     player.speed.y += (' ' in con.keys && player.onGround ? -10 : ' ' in con.keys ? 0.7 : 0.9)
    player.xp += player.speed.x * 0.3
    player.yp += player.speed.y * 0.3
    player.lowerBar.xp = player.xp
    player.lowerBar.yp = player.yp + 8
    player.crouchBar.xp = player.xp
    player.crouchBar.yp = player.yp
    if (player.onGround && (!(' ' in con.keys)) && (!('s' in con.keys))) {
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
})
