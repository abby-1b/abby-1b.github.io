
/** A date consisting of a day, a month, and a year. */
class CalendarDate {
	day  : number // 1-indexed (1 = the first day of the month)
	month: number // 0-indexed (a.k.a. 0 = January)
	year : number // 1-indexed (2022 is the year 2022)
}

/** An event potentially spanning multiple days, potentially starting and ending on specific hours. */
class CalendarEvent {
	date: CalendarDate
	multiDay: boolean
	endDate?: CalendarDate
}

class DateEvent {
	name: string
	startsHere: boolean
	endsHere: boolean

	constructor(name: string, startsHere: boolean, endsHere: boolean) {
		this.name = name
		this.startsHere = startsHere
		this.endsHere = endsHere
	}

	makeElement() {
		const el = document.createElement("div")
		el.className = "inlineEvent"
		if (this.startsHere)
			el.innerText = this.name, el.classList.add("start")
		else if (this.endsHere) 
			el.classList.add("end")
		return el
	}
}

const events: CalendarEvent[] = []

function getDateEvents(day: number, month: number, year: number): DateEvent[] {
	const ret: DateEvent[] = []
	if (day == 17) {
		ret.push(new DateEvent("TEST!", true, false))
	} else if (day == 18) {
		ret.push(new DateEvent("TEST!", false, false))
	} else if (day == 19) {
		ret.push(new DateEvent("TEST!", false, false))
	} else if (day == 20) {
		ret.push(new DateEvent("TEST!", false, false))
	} else if (day == 21) {
		ret.push(new DateEvent("TEST!", false, false))
	} else if (day == 22) {
		ret.push(new DateEvent("TEST!", false, true))
	}
	return ret
}
