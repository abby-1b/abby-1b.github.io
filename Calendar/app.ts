// Change day gap
// document.documentElement.style.setProperty("--dayGap", "10px")

const taskBar = document.getElementById("taskBar")
function toggleTaskBar() { if (taskBar.classList.contains("open")) { closeTaskBar() } else openTaskBar() }
function openTaskBar() { taskBar.classList.add("open") }
function closeTaskBar() { taskBar.classList.remove("open") }

function makeDay(date: number, month: number, year: number) {
	const day = document.createElement("div")
	day.className = "day"
	if (date > 0) day.innerText = `${date}`
	if (date == d.getDate()) day.classList.add("today")
	getDateEvents(date, month, year)
		.map(e => day.appendChild(e.makeElement()))
	return day
}

function makeWeek(startNum: number, startPos: number, endPos: number, month: number, year: number) {
	const week = document.createElement("div")
	week.className = "week"
	for (let i = 0; i < 7; i++) week.appendChild(makeDay((i < startPos || i >= endPos) ? 0 : i + 1 + startNum - startPos, month, year))
	return week
}

function makeMonth(date: Date = new Date()) {
	const startWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
	const endDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	let weeks = 1

	const yearNum = date.getFullYear()
	const monthNum = date.getMonth()
	const month = document.createElement("div")
	month.className = "month"

	month.appendChild(makeWeek(0, startWeekDay, 7, monthNum, yearNum))
	let on = 7 - startWeekDay
	for (let i = 1; on < endDay; i++)
		month.appendChild(makeWeek(on, 0, endDay - on, monthNum, yearNum)), on += 7, weeks++

	month.style.gridTemplateRows = "repeat(" + weeks + ",1fr)"
	return month
}

const container = document.getElementById("container")
const d = new Date()
container.appendChild(makeMonth(d))

window.onresize = () => {
	Array.from(document.getElementById("days").children).forEach((c, i) => (c as HTMLHeadingElement).innerText = (window.innerWidth < 1000 ? days[i][0] : days[i]))

	document.documentElement.style.setProperty("--dayGap", (window.innerWidth <= 800) ? "5px" : "10px")
}
(window.onresize as any)()

const keyBinds: {[key: string]: () => void} = {
	"t": () => { toggleTaskBar() }
}

window.onkeydown = (e) => {
	const k = e.key
	if (k in keyBinds) keyBinds[k]()
	else console.log(`Pressed ${k}`)
}
