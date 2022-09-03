const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
class CalendarDate {
    constructor(day, month, year) {
        this.day = day;
        this.month = month;
        this.year = year;
    }
    toString(display = false) {
        if (display)
            return `${months[this.month]} ${this.day}th, ${this.year}`;
        else
            return `[${this.month},${this.day},${this.year - 2000}]`;
    }
}
class CalendarEvent {
    constructor(name, date, endDate) {
        this.name = name;
        this.date = date;
        this.endDate = endDate !== null && endDate !== void 0 ? endDate : date;
    }
    dateInRange(day, month, year) {
        if (year < this.date.year || year > this.endDate.year)
            return false;
        if (month < this.date.month || month > this.endDate.month)
            return false;
        if (day < this.date.day || day > this.endDate.day)
            return false;
        return true;
    }
    dateStartEnd(day, month, year) {
        return [
            year == this.date.year
                && month == this.date.month
                && day == this.date.day,
            year == this.endDate.year
                && month == this.endDate.month
                && day == this.endDate.day
        ];
    }
    toString(display = false) {
        if (display)
            return `CalendarEvent "${this.name}" {}`;
        else
            return `["${this.name}",${this.date},${this.endDate == this.date ? 0 : this.endDate}]`;
    }
}
class DateEvent {
    constructor(name, startsHere, endsHere, parentEvent) {
        this.name = name;
        this.startsHere = startsHere;
        this.endsHere = endsHere;
        this.parentEvent = parentEvent;
    }
    makeElement() {
        const el = document.createElement("div");
        el.className = "inlineEvent";
        if (this.startsHere)
            el.innerText = this.name, el.classList.add("start");
        if (this.endsHere)
            el.classList.add("end");
        return el;
    }
}
const events = [
    new CalendarEvent("Test!", new CalendarDate(17, 8, 2022), new CalendarDate(19, 8, 2022))
];
function getDateEvents(day, month, year) {
    const ret = [];
    for (let e = 0; e < events.length; e++) {
        if (events[e].dateInRange(day, month, year))
            ret.push(new DateEvent(events[e].name, ...events[e].dateStartEnd(day, month, year)));
    }
    return ret;
}
function makeNewEvent() {
}
