var playing = true
let audio = new Audio("audio.mp3")
let names = "Fabi,Platonic Soulmate,darling,worm girl :D,Mari,My Dear,sweetheart <3".split(",")
function play() {
	playing = !playing
	console.log(playing)
	if (playing) {
		audio.play()
		document.body.style.opacity = '1'
	} else {
		audio.pause()
		audio.currentTime = 0
		document.body.style.opacity = '0'
		document.querySelector("a").innerText = names[Math.round(Math.random() * 1000) % names.length]
	}
}
play()