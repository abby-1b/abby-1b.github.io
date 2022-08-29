class CalendarDate {
}
class CalendarEvent {
}
class DateEvent {
    constructor(name, startsHere, endsHere) {
        this.name = name;
        this.startsHere = startsHere;
        this.endsHere = endsHere;
    }
    makeElement() {
        const el = document.createElement("div");
        el.className = "inlineEvent";
        if (this.startsHere)
            el.innerText = this.name, el.classList.add("start");
        else if (this.endsHere)
            el.classList.add("end");
        return el;
    }
}
const events = [];
function getDateEvents(day, month, year) {
    const ret = [];
    if (day == 17) {
        ret.push(new DateEvent("TEST!", true, false));
    }
    else if (day == 18) {
        ret.push(new DateEvent("TEST!", false, false));
    }
    else if (day == 19) {
        ret.push(new DateEvent("TEST!", false, false));
    }
    else if (day == 20) {
        ret.push(new DateEvent("TEST!", false, false));
    }
    else if (day == 21) {
        ret.push(new DateEvent("TEST!", false, false));
    }
    else if (day == 22) {
        ret.push(new DateEvent("TEST!", false, true));
    }
    return ret;
}
