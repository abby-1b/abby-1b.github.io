const calendar = new Branch.Grid("Calendar");
class Day extends Branch {
    constructor() {
        super("Day");
        this.number = -1;
    }
    set(n) { this.number = n, this.reload(); }
    render() {
        this.reload();
    }
    reload() { this.element.innerText = this.number + "", super.reload(); }
}
calendar.addCol(7);
calendar.addRow(4);
calendar.cellWidth = "50px";
calendar.cellHeight = "50px";
for (let i = 0; i < calendar.rows * calendar.cols; i++) {
    calendar.has(new Day());
}
body.has(calendar);
body.start();
