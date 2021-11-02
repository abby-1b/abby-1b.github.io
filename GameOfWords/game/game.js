
let con = new Console(200, "white")

// let player = new PhysicsActor("../Art/test.png", 0, 0, 8, 8)
// player = con.nObj(player)
// player.bounce = 0.8

let tileSet = new TileSet("../Art/TestSetNew.png", 8, 8)
let tileMap = con.nObj(new TileMap(tileSet, 6, 6, [
   0, 0, 0, 0, 0, 0,
   1, 0, 1, 0, 0, 0,
   0, 0, 1, 1, 1, 0,
   0, 0, 0, 0, 1, 0,
   0, 0, 0, 0, 0, 0,
   0, 0, 0, 0, 0, 0,
]))

con.init(() => {

})

con.loop(() => {})
