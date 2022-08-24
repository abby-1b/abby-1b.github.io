class Day extends Branch {
    constructor() {
        super("Day");
        this.number = 0;
        this.innerDay = new Day.DayContainer("InnerDay");
        this.has(this.innerDay);
    }
    set(n) { this.number = n, this.reload(); }
    render() { this.reload(); }
    reload() {
        this.innerDay.number = this.number;
        super.reload();
    }
}
Day.DayContainer = class DayContainer extends Branch {
    constructor() {
        super(...arguments);
        this.number = 0;
    }
    reload() {
        this.centerHorizontal("relative");
        this.element.innerText = this.number < 1 ? "_" : this.number + "";
    }
};
class Month extends Branch.Grid {
    constructor() {
        super("Month");
        this._seeingDate = new Date();
        this.setCols(7, false);
        this.setRows(6, false);
    }
    set seeingDate(d) { this._seeingDate = d, this.reload(); }
    get seeingDate() { return this._seeingDate; }
    reload() {
        this.clearChildren();
        for (let i = 0; i < this.rows * this.cols; i++) {
            const d = new Day();
            d.onClick(function (e) { console.log("Clicked!", e); });
            this.has(d);
        }
        const dateOffset = new Date(this._seeingDate.getFullYear(), this._seeingDate.getMonth(), 1).getDay();
        const monthLength = new Date(this._seeingDate.getFullYear(), this._seeingDate.getMonth() + 1, 0).getDate();
        console.log(dateOffset, monthLength);
        for (let i = 0; i < this.rows * this.cols; i++) {
            const d = (i - dateOffset + 1) > monthLength ? 0 : i - dateOffset + 1;
            this.children[i].set(d);
        }
        super.reload();
    }
}
const calendar = new Month();
calendar.center();
calendar.cellWidth = "min(14.2857vw, 100px)", calendar.cellHeight = "90px";
body.has(calendar);
body.start();
