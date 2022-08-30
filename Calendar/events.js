const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
class CalendarDate {
    constructor(day, month, year) {
        this.day = day;
        this.month = month;
        this.year = year;
    }
    toString() {
        return `${months[this.month]} ${this.day}th, ${this.year}`;
    }
}
class CalendarEvent {
    constructor(name, date, endDate) {
        this.name = name;
        this.date = date;
        console.log(date.toString());
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
    new CalendarEvent("Test!", new CalendarDate(17, 7, 2022), new CalendarDate(19, 7, 2022))
];
function getDateEvents(day, month, year) {
    const ret = [];
    for (let e = 0; e < events.length; e++) {
        if (events[e].dateInRange(day, month, year)) {
            ret.push(new DateEvent(events[e].name, true, true));
        }
    }
    return ret;
}
