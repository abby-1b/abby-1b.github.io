
let con = new Console(200, "white")

con.physics.friction.y = 1

/*

*/

// TileMap
let tileMap = con.nObj(TileMap.from("Maps/Map1.png", {
	TILE: [197, 204, 184, new TileSet("Art/TestSetNew.png", 8, 8)]
}))
tileMap.hbOffsets({top: 4, bottom: 0, left: 0, right: 0})

// Player
let player = con.nObj(new PhysicsActor("Art/player.png", 0, 0, 8, 10))
// con.follow(player, 0.1, new Vec2(30, 30))
// player.bounce = 1

con.nEvent("left", () => {})
con.nEvent("right", () => {})
con.nEvent("jump", () => {
	// if (player.onGround) {
		player.speed.y = -1
	// }
})
Controllers.new(player, "platformer")

player.onCollision(function(el, d) {
	if (d == "top" && player.bounce != 0) {
		console.log(player.speed.y)
		// player.speed.y = -1.5 * player.bounce
	}
})

con.init(() => {
	con.follow(player, 0.1, new Vec2(0, 0))
})

con.draw(() => {
	con.text(CTool.round(con.frameRate, 2), 1, 1)
	// con.text(player.speed.y, 1, 1)

	// con.rect(-con.camPos.x, -con.camPos.y, 10, 10, "red")
	// con.rect(con.width / 2, con.height / 2, 10, 10, "#0F0")
	let p = player.finalPos(true)
	con.line(-con.camPos.x, -con.camPos.y, p.x, p.y, "black")
})

con.loop(() => {
	if (!player.locked)
        player.speed.addVec(new Vec2(
            (con.eventOngoing("right") ? 1 : 0) - (con.eventOngoing("left") ? 1 : 0), 0).normalized().divideRet(10))
})
