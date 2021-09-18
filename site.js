
let card = new Card({tag: "b", width: 10, height: 10})

body.addChild(card)

let i = 0
setInterval(function(){
    card.setContent((i++) / 100)
}, 10)
