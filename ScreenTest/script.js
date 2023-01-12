
const delay = ms => new Promise(res => setTimeout(res, ms))
// const delay = () => new Promise(res => res())

const el = document.querySelector("#mainButton")
	, dat = document.querySelector("#data")
	, divs = [...document.querySelectorAll(".feeler")]
const animWait = 2000

el.style.setProperty("--animTime", ".5s")

divs[0].style.setProperty("--color", "255,0,0")
divs[1].style.setProperty("--color", "0,0,255")
divs[2].style.setProperty("--color", "0,255,0")

el.classList.add("anim")

el.onclick = async () => {
	// document.body.requestFullscreen()

	el.style.width = "0"
	el.style.height = "0"

	doAnimation()
}

async function doAnimation() {
	divs[0].style.height = "100.1vh"
	await delay(animWait / 2)
	divs[1].style.width = "100.1vw"
	await delay(animWait)

	divs[2].style.width = "100.1vw"
	divs[2].style.height = "100.1vh"

	await delay(animWait / 2)

	document.documentElement.style.setProperty("--bgOpacity", "1")
	divs[0].style.width = "100.1vw"
	divs[1].style.height = "100.1vh"

	await delay(animWait)

	divs[0].style.opacity = 0
	divs[1].style.opacity = 0
	divs[2].style.opacity = 0
	document.body.style.backgroundColor = "black"

	document.body.classList.add("border")

	showData()
}

async function showData() {
	dat.innerText = `${window.innerWidth} x ${window.innerHeight}`
	dat.style.opacity = 1

	dat.style.setProperty("--animTime", ".1s")

	let c = 0.5,
		d = (window.innerWidth - 8) * 0.9

	const adj = () => {
		dat.innerText = `${window.innerWidth} \xD7 ${window.innerHeight}`
		w = dat.getBoundingClientRect().width
		c *= d / w
		dat.style.fontSize = c + "em"
	}
	adj()

	setInterval(adj, 100)

	delay(500).then(startCanvas)
}

const ballSize = 20
	, gravity = 1
let balls = [] // [x, y, xv, yv]

function startCanvas() {
	const cnv = document.querySelector("canvas")
		, ctx = cnv.getContext("2d")
	let {width, height} = cnv.getBoundingClientRect()
	window.onresize = () => {
		let d = cnv.getBoundingClientRect()
		cnv.width = width = d.width
		cnv.height = height = d.height
	}
	cnv.width = width
	cnv.height = height

	// for (let i = 0; i < 10; i++) addBall(width / 2, 0)
	// addBall(width / 2, 0)

	function frame() {
		// Clear
		ctx.fillStyle = "#000"
		ctx.fillRect(0, 0, width, height)

		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 3
		for (let b = 0; b < balls.length; b++) {
			ctx.beginPath()
			ctx.arc(balls[b][0], balls[b][1], ballSize, 0, 2 * Math.PI)
			ctx.stroke()

			balls[b][0] += balls[b][2]
			balls[b][1] += (balls[b][3] += gravity)

			for (let c = 0; c < balls.length; c++) {
				if (c == b) continue
				const d = Math.hypot(balls[b][0] - balls[c][0], balls[b][1] - balls[c][1])
				if (balls[b][0] == balls[c][0]) balls[b][0] += Math.random() - 0.5
				if (balls[b][1] == balls[c][1]) balls[b][1] += Math.random() - 0.5
				if (d < ballSize * 2) {
					balls[b][0] += 1
				}
			}

			if (balls[b][1] > height - ballSize) {
				balls[b][1] = height - ballSize
				balls[b][3] = 0
			}
			if (balls[b][0] < ballSize) {
				balls[b][0] = ballSize
				balls[b][2] = 0
			}
			if (balls[b][0] > width - ballSize) {
				balls[b][0] = width - ballSize
				balls[b][2] = 0
			}
		}

		window.requestAnimationFrame(frame)
	}
	window.requestAnimationFrame(frame)
}

function addBall(x, y) {
	balls.push([x, y, 0, 0])
}

// el.onclick()
