
let con = new Console(200, "white")

let tileSet = new TileSet("Art/TestSetNew.png", 8, 8)
let tileMap = con.nObj(TileMap.from("Maps/Map1.png", tileSet, {
	TILE: [197, 204, 184]
}))
tileMap.hbOffsets({top: 3, bottom: 0, left: 0, right: 0})

let player = con.nObj(new PhysicsActor("Art/test.png", 0, 0, 8, 8))
con.follow(player, 0.1, new Vec2(30, 30))
// player.bounce = 1

con.nEvent("left", () => {})
con.nEvent("right", () => {})
con.nEvent("jump", () => {
	if (player.onGround) {
		player.speed.y = -1
	}
})
Controllers.new(player, "platformer")

player.onCollision(function(el, d) {
	if (d == "top" && player.bounce != 0) {
		console.log(player.speed.y)
		player.speed.y = -1.5
	}
})

con.init(() => {})

con.loop(() => {
	con.text(CTool.round(Math.abs(player.speed.y), 2), 1, 1)

	if (!player.locked)
        player.speed.addVec(new Vec2(
            (con.eventOngoing("right") ? 1 : 0) - (con.eventOngoing("left") ? 1 : 0), 0).normalized().multiplyRet(0.25))
})
