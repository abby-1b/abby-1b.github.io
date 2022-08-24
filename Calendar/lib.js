class Branch {
    constructor(name) {
        this.children = [];
        this.name = name;
        this.makeElement();
        this.element.id = name;
    }
    makeElement() { this.element = document.createElement("div"); }
    render() { }
    doRender() {
        Array.from(this.element.children).forEach(c => this.element.removeChild(c));
        this.render();
        this.children.forEach(c => this.element.appendChild(c.doRender()));
        return this.element;
    }
    has(...branches) { this.children.push(...branches); branches.forEach(b => b.parent = this); return this; }
    clearChildren() {
        this.children.forEach(c => c.parent = undefined);
        this.children = [];
    }
    center(position = "absolute") { this.css({ textAlign: "center", position, transform: "translate(-50%,-50%)", top: "50%", left: "50%" }); }
    centerHorizontal(position = "absolute") { this.css({ textAlign: "center", position, transform: "translate(-50%,0)", left: "50%" }); }
    onClick(fn) { this.element.addEventListener("pointerdown", fn); }
    css(styles) { for (const k in styles)
        this.element.style[k] = styles[k]; }
    reload() { this.children.forEach(c => c.reload()); }
}
Branch.Grid = class Grid extends Branch {
    constructor() {
        super(...arguments);
        this._rows = 0;
        this._cols = 0;
        this._cellWidth = "1fr";
        this._cellHeight = "1fr";
    }
    get cellWidth() { return this._cellWidth; }
    ;
    set cellWidth(v) { this._cellWidth = v, this.reload(); }
    get cellHeight() { return this._cellHeight; }
    ;
    set cellHeight(v) { this._cellHeight = v, this.reload(); }
    get rows() { return this._rows; }
    get cols() { return this._cols; }
    makeElement() {
        super.makeElement();
        this.css({ display: "grid" });
    }
    setRows(num, reload = true) { this._rows = num, reload && this.reload(); }
    setCols(num, reload = true) { this._cols = num, reload && this.reload(); }
    addRows(num = 1) { this._rows += num, this.reload(); }
    addCols(num = 1) { this._cols += num, this.reload(); }
    reload() { this.css({ gridTemplateRows: `repeat(${this._rows},${this._cellHeight})`, gridTemplateColumns: `repeat(${this._cols},${this._cellWidth})` }), super.reload(); }
};
(() => {
    document.body.parentElement.style.width = document.body.style.width = "100vw", document.body.parentElement.style.height = document.body.style.height = "100vh";
    document.body.parentElement.style.margin = document.body.style.margin = document.body.parentElement.style.padding = document.body.style.padding = "0";
})();
const body = new (class MainBranch extends Branch {
    constructor() { super("MainBranch"); }
    render() {
        Array.from(document.body.children).forEach(c => document.body.removeChild(c));
        document.body.appendChild(this.element);
    }
    start() {
        this.doRender();
    }
})();
