const calendar = new Branch.Grid("Calendar")

type Day = {year: number, month: number, day: number}
function daysInMonth() { return new Date(2022, 0 + 1, 0) }

class DayBranch extends Branch {
	private number = -1
	constructor() { super("Day") }
	set(n: number) { this.number = n, this.reload() }
	render() { this.reload() }
	reload() { this.element.innerText = this.number + "", super.reload() }
}

calendar.addCol(7)
calendar.addRow(6)
calendar.cellWidth = "50px", calendar.cellHeight = "50px"

for (let i = 0; i < calendar.rows * calendar.cols; i++) {
	const d = new DayBranch()
	d.set(i)
	calendar.has(d)
}

body.has(calendar)
body.start()

let pos = 0
document.addEventListener("wheel", e => {
	pos += e.deltaY / 100
	for (let i = 0; i < calendar.rows * calendar.cols; i++) {
		(calendar.children[i] as DayBranch).set(i + Math.round(pos))
	}
})
