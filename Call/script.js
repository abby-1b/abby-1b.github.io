var playing = true
let audio = new Audio("audio.mp3")
let names = "Fabi,Platonic Soulmate,darling,Mari,My Dear,sweetheart <3,my luv <3,darling <3".split(",")
function play(kk) {
	playing = !playing
	console.log(playing)
	if (playing) {
                setTimeout(() => {
		        audio.play()
		        document.body.style.opacity = '1'
                }, (5 + Math.random() * 10) * 1000)
	} else {
                if (!kk) playing = true
		audio.pause()
		audio.currentTime = 0
		document.body.style.opacity = '0'
		document.querySelector("a").innerText = names[Math.round(Math.random() * 1000) % names.length]
	}
}
play(true)
