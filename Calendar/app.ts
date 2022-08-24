
class Day extends Branch {
	private number = 0

	static DayContainer = class DayContainer extends Branch {
		number = 0
		reload() {
			this.centerHorizontal("relative")
			this.element.innerText = this.number < 1 ? "_" : this.number + ""
		}
	}
	innerDay = new Day.DayContainer("InnerDay")

	constructor() { super("Day"); this.has(this.innerDay) }

	set(n: number) { this.number = n, this.reload() }
	render() { this.reload() }
	reload() {
		this.innerDay.number = this.number
		super.reload()
	}
}

class Month extends Branch.Grid {
	_seeingDate: Date = new Date()
	set seeingDate(d: Date) { this._seeingDate = d, this.reload() }
	get seeingDate() { return this._seeingDate }

	constructor() {
		super("Month")
		this.setCols(7, false)
		this.setRows(6, false)
	}

	reload() {
		this.clearChildren()
		for (let i = 0; i < this.rows * this.cols; i++) {
			const d = new Day()
			d.onClick((e: PointerEvent) =>{ console.log("Clicked!", e) })
			this.has(d)
		}

		const dateOffset = new Date(this._seeingDate.getFullYear(), this._seeingDate.getMonth(), 1).getDay()
		const monthLength = new Date(this._seeingDate.getFullYear(), this._seeingDate.getMonth() + 1, 0).getDate()
		console.log(dateOffset, monthLength)
		for (let i = 0; i < this.rows * this.cols; i++) {
			const d = (i - dateOffset + 1) > monthLength ? 0 : i - dateOffset + 1
			;(this.children[i] as any).set(d)
		}
		super.reload()
	}
}

const calendar = new Month()
calendar.center()
calendar.cellWidth = "min(14.2857vw, 100px)", calendar.cellHeight = "90px"

// for (let i = 0; i < calendar.rows * calendar.cols; i++) calendar.has(new DayBranch())

// let pos = 0
// document.addEventListener("wheel", e => {
// 	pos += (e.deltaY / 300)
// })

body.has(calendar)
body.start()
