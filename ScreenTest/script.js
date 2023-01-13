
const testing = false

const delay = ms => new Promise(res => testing ? res() : setTimeout(res, ms))

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
	if (!testing) document.body.requestFullscreen()

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
	if (!testing) dat.style.opacity = 1

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

	if (!testing) setInterval(adj, 100)

	testing ? startCanvas() : delay(500).then(startCanvas)
}

const TWO_PI = 2 * Math.PI
	, HALF_PI = 0.5 * Math.PI

const ballSize = 20
	, gravity = 0.01
	, wallBounce = 0.1 // Energy multiplier after bouncing off a wall
	, ballBounceFriction = 1 //0.2
let balls = [] // [x, y, xv, yv]
let hits = 0

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

	// for (let i = 0; i < 50; i++) addBall(width / 2, Math.random() * -ballSize)
	addBall(width / 2, height / 2)
	addBall(width / 2 - 150, height / 2 + 38)
	// balls[0][3] = 0.5
	balls[1][2] = 1.3
	// balls[balls.length - 1][3] = 1

	// const tmp = balls[0]
	// balls[0] = balls[1]
	// balls[1] = tmp

	function frame() {
		// Clear
		ctx.fillStyle = "#000"
		ctx.fillRect(0, 0, width, height)

		// Do physics
		physics()
		physics()
		physics()
		physics()

		// Draw balls
		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 3
		for (let b = 0; b < balls.length; b++) {
			ctx.beginPath()
			ctx.arc(balls[b][0], balls[b][1], ballSize, 0, TWO_PI)
			ctx.stroke()
		}

		// ctx.strokeStyle = "#f00"
		// for (let b = 0; b < balls.length; b++) {
		// 	ctx.beginPath()
		// 	ctx.moveTo(balls[b][0], balls[b][1])
		// 	ctx.lineTo(balls[b][0] + balls[b][2] * 100, balls[b][1] + balls[b][3] * 100)
		// 	ctx.stroke()
		// }

		if (hits > 0) return
		// Request next frame
		window.requestAnimationFrame(frame)
	}
	window.requestAnimationFrame(frame)

	function physics() {
		for (let b = 0; b < balls.length; b++) {
			balls[b][0] += balls[b][2]
			balls[b][1] += (balls[b][3] += gravity)

			// Loop through all balls
			for (let c = 0; c < balls.length; c++) {
				if (c == b) continue // Skip the same balls

				// If the balls are in the same position, move them randomly
				if (balls[b][0] == balls[c][0] && balls[b][1] == balls[c][1])
					balls[b][0] += Math.random() - 0.5

				// Get the relative position of the second ball
				let xr = balls[b][0] - balls[c][0],
					yr = balls[b][1] - balls[c][1]
				const d = Math.hypot(xr, yr)

				if (d < ballSize * 2) {
					let hitAngle = -Math.atan2(xr, yr) - HALF_PI,
						cos = Math.cos(hitAngle),
						sin = Math.sin(hitAngle)
					
					// Resolve the collision without accelerating. This prevents double collisions
					balls[b][0] += cos * (d - ballSize * 2) * 0.5, balls[b][1] += sin * (d - ballSize * 2) * 0.5
					balls[c][0] -= cos * (d - ballSize * 2) * 0.5, balls[c][1] -= sin * (d - ballSize * 2) * 0.5

					hitAngle = -Math.atan2(balls[b][0] - balls[c][0], balls[b][1] - balls[c][1]) - HALF_PI,
					cos = Math.cos(hitAngle)
					sin = Math.sin(hitAngle)

					// Store original movement
					const oxv = balls[c][2]
						, oyv = balls[c][3]

					// Move reference frame
					balls[c][2] = 0, balls[c][3] = 0
					balls[b][2] -= oxv, balls[b][3] -= oyv

					// console.log("Hit angle:", hitAngle)

					const initialSpeed = Math.hypot(balls[b][2], balls[b][3]) + Math.hypot(balls[c][2], balls[c][3])
						, movAngle = Math.atan2(balls[b][2], balls[b][3])

					let speedSplitB = cos * Math.cos(movAngle) + sin * Math.sin(movAngle),
						speedSplitA = speedSplitB < 0 ? speedSplitB + 1 : 1 - speedSplitB
						
					// console.log("Speed split:", speedSplitA, speedSplitB)

					// console.log("Conservation:", Math.abs(speedSplitA) + Math.abs(speedSplitB))
					speedSplitA *= ballBounceFriction * initialSpeed
					speedSplitB *= ballBounceFriction * initialSpeed

					// console.log("Speed change:", initialSpeed, speedSplitA + speedSplitB)
					
					// B is hitting C!
					balls[c][2] = cos * speedSplitA, balls[c][3] = sin * speedSplitA
					balls[b][2] = sin * speedSplitB, balls[b][3] = -cos * speedSplitB

					// console.log("Final speed:", Math.hypot(balls[b][2], balls[b][3]) + Math.hypot(balls[c][2], balls[c][3]))
					const finalSpeed = Math.hypot(balls[b][2], balls[b][3]) + Math.hypot(balls[c][2], balls[c][3])

					if (Math.abs(initialSpeed - finalSpeed) > 0.00001) {
						console.log("initialSpeed", initialSpeed)
						console.log("finalSpeed", finalSpeed)
						// hits++
						// return
					}

					// Reset reference frame
					balls[b][2] += oxv, balls[b][3] += oyv
					balls[c][2] += oxv, balls[c][3] += oyv

					// hits++
					// return
					// console.log("Collided!", hits)
				}
			}

			// Wall interactions
			if (balls[b][1] > height - ballSize) {
				balls[b][1] = height - ballSize
				balls[b][3] = -Math.abs(balls[b][3]) * wallBounce
			}
			if (balls[b][0] < ballSize) {
				balls[b][0] = ballSize
				balls[b][2] = Math.abs(balls[b][2]) * wallBounce
			}
			if (balls[b][0] > width - ballSize) {
				balls[b][0] = width - ballSize
				balls[b][2] = -Math.abs(balls[b][2]) * wallBounce
			}
			if (balls[b][1] < ballSize) {
				balls[b][1] = ballSize
				balls[b][3] = Math.abs(balls[b][3]) * wallBounce
			}
		}
	}
}

function addBall(x, y) {
	balls.push([x, y, 0, 0])
}

window.onclick = (e) => {
	addBall(e.x - 4, e.y - 4)
	balls[balls.length - 1][3] = -1
}

if (testing) el.onclick()
