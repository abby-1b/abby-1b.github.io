function makeDay(date) {
    const day = document.createElement("div");
    day.className = "day";
    if (date > 0) {
        day.innerText = date + "";
    }
    return day;
}
function makeWeek(startNum = 1, startPos = 0, endPos = 7) {
    const week = document.createElement("div");
    week.className = "week";
    for (let i = 0; i < 7; i++)
        week.appendChild(makeDay((i < startPos || i >= endPos) ? 0 : i + 1 + startNum - startPos));
    return week;
}
function makeMonth(date = new Date()) {
    const startWeekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const endDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    console.log(startWeekDay, endDay);
    let weeks = 1;
    const month = document.createElement("div");
    month.className = "month";
    month.appendChild(makeWeek(0, startWeekDay));
    let on = 7 - startWeekDay;
    for (let i = 1; on < endDay; i++) {
        month.appendChild(makeWeek(on, 0, endDay - on));
        on += 7;
        weeks++;
    }
    month.style.gridTemplateRows = "repeat(" + weeks + ",1fr)";
    return month;
}
const container = document.getElementById("container");
container.appendChild(makeMonth(new Date(new Date().getFullYear())));
window.onresize = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    Array.from(document.getElementById("days").children).forEach((c, i) => c.innerText = (window.innerWidth < 800 ? days[i][0] : days[i]));
    console.log("Done!");
};
window.onresize();
