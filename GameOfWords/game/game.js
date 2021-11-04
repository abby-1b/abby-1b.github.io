
let con = new Console(200, "white")

let player = con.nObj(new PhysicsActor("Art/test.png", 0, 0, 8, 8))
player.bounce = 0.8

con.follow(player, 0.1, new Vec2(0, 0))

let tileSet = new TileSet("Art/TestSetNew.png", 8, 8)
let tileMap = con.nObj(TileMap.from("Maps/Map1.png", tileSet, {
	TILE: [197, 204, 184]
}))

con.init(() => {

})

con.loop(() => {
	
})

// This is some autotiling stuff. Ignore it.
// const UP = 1
// const DOWN = 2
// const LEFT = 4
// const RIGHT = 8
// const ULEFT = 16
// const URIGHT = 32
// const DLEFT = 64
// const DRIGHT = 128
