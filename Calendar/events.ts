
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/** A date consisting of a day, a month, and a year. */
class CalendarDate {
	day  : number // 1-indexed (1 = the first day of the month)
	month: number // 0-indexed (a.k.a. 0 = January)
	year : number // 1-indexed (2022 is the year 2022)

	constructor(day: number, month: number, year: number) {
		this.day = day
		this.month = month
		this.year = year
	}

	toString(display=false): string {
		if (display)
			return `${months[this.month]} ${this.day}th, ${this.year}`
		else
			return `[${this.month},${this.day},${this.year - 2000}]`
	}
}

/** An event potentially spanning multiple days, potentially starting and ending on specific hours. */
class CalendarEvent {
	name: string
	date: CalendarDate
	endDate: CalendarDate // Can be the same object as `date` above.

	constructor(name: string, date: CalendarDate, endDate?: CalendarDate) {
		this.name = name
		this.date = date
		console.log(date.toString())
		this.endDate = endDate ?? date
	}

	dateInRange(day: number, month: number, year: number): boolean {
		if (year < this.date.year || year > this.endDate.year) return false
		if (month < this.date.month || month > this.endDate.month) return false
		if (day < this.date.day || day > this.endDate.day) return false
		return true
	}

	dateStartEnd(day: number, month: number, year: number): [boolean, boolean] {
		return [
			year == this.date.year
			&& month == this.date.month
			&& day == this.date.day,
			year == this.endDate.year
			&& month == this.endDate.month
			&& day == this.endDate.day
		]
	}

	// Serialize / Deserialize
	toString(display=false) {
		if (display)
			return `CalendarEvent "${this.name}" {}` // ez
		else
			return `["${this.name}",${this.date},${
				this.endDate == this.date ? 0 : this.endDate}]`
	}
}

/** An event that is to be displayed on a date card. */
class DateEvent {
	name: string
	startsHere: boolean
	endsHere: boolean
	parentEvent: CalendarEvent

	constructor(name: string, startsHere: boolean, endsHere: boolean, parentEvent?: CalendarEvent) {
		this.name = name
		this.startsHere = startsHere
		this.endsHere = endsHere
		this.parentEvent = parentEvent
	}

	makeElement() {
		const el = document.createElement("div")
		el.className = "inlineEvent"
		if (this.startsHere)
			el.innerText = this.name, el.classList.add("start")
		if (this.endsHere) 
			el.classList.add("end")
		return el
	}
}

const events: CalendarEvent[] = [
	new CalendarEvent("Test!", new CalendarDate(17, 8, 2022), new CalendarDate(19, 8, 2022))
]

function getDateEvents(day: number, month: number, year: number): DateEvent[] {
	const ret: DateEvent[] = []
	for (let e = 0; e < events.length; e++) {
		if (events[e].dateInRange(day, month, year))
			ret.push(new DateEvent(events[e].name, ...events[e].dateStartEnd(day, month, year)))
	}
	return ret
}
