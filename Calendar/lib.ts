
type CSSStyle = { alignContent?: string, alignItems?: string, alignSelf?: string, animation?: string, animationDelay?: string, animationDirection?: string, animationDuration?: string, animationFillMode?: string, animationIterationCount?: string, animationName?: string, animationPlayState?: string, animationTimingFunction?: string, backfaceVisibility?: string, background?: string, backgroundAttachment?: string, backgroundClip?: string, backgroundColor?: string, backgroundImage?: string, backgroundOrigin?: string, backgroundPosition?: string, backgroundRepeat?: string, backgroundSize?: string, border?: string, borderBottom?: string, borderBottomColor?: string, borderBottomLeftRadius?: string, borderBottomRightRadius?: string, borderBottomStyle?: string, borderBottomWidth?: string, borderCollapse?: string, borderColor?: string, borderImage?: string, borderImageOutset?: string, borderImageRepeat?: string, borderImageSlice?: string, borderImageSource?: string, borderImageWidth?: string, borderLeft?: string, borderLeftColor?: string, borderLeftStyle?: string, borderLeftWidth?: string, borderRadius?: string, borderRight?: string, borderRightColor?: string, borderRightStyle?: string, borderRightWidth?: string, borderSpacing?: string, borderStyle?: string, borderTop?: string, borderTopColor?: string, borderTopLeftRadius?: string, borderTopRightRadius?: string, borderTopStyle?: string, borderTopWidth?: string, borderWidth?: string, bottom?: string, boxShadow?: string, boxSizing?: string, captionSide?: string, clear?: string, clip?: string, color?: string, columnCount?: string, columnFill?: string, columnGap?: string, columnRule?: string, columnRuleColor?: string, columnRuleStyle?: string, columnRuleWidth?: string, columnSpan?: string, columnWidth?: string, columns?: string, content?: string, counterIncrement?: string, counterReset?: string, cursor?: string, direction?: string, display?: string, emptyCells?: string, flex?: string, flexBasis?: string, flexDirection?: string, flexFlow?: string, flexGrow?: string, flexShrink?: string, flexWrap?: string, float?: string, font?: string, fontFamily?: string, fontSize?: string, fontSizeAdjust?: string, fontStretch?: string, fontStyle?: string, fontVariant?: string, fontWeight?: string, gridTemplateRows?: string, gridTemplateColumns?: string, height?: string, justifyContent?: string, left?: string, letterSpacing?: string, lineHeight?: string, listStyle?: string, listStyleImage?: string, listStylePosition?: string, listStyleType?: string, margin?: string, marginBottom?: string, marginLeft?: string, marginRight?: string, marginTop?: string, maxHeight?: string, maxWidth?: string, minHeight?: string, minWidth?: string, opacity?: string, order?: string, outline?: string, outlineColor?: string, outlineOffset?: string, outlineStyle?: string, outlineWidth?: string, overflow?: string, overflowX?: string, overflowY?: string, padding?: string, paddingBottom?: string, paddingLeft?: string, paddingRight?: string, paddingTop?: string, pageBreakAfter?: string, pageBreakBefore?: string, pageBreakInside?: string, perspective?: string, perspectiveOrigin?: string, position?: string, quotes?: string, resize?: string, right?: string, tabSize?: string, tableLayout?: string, textAlign?: string, textAlignLast?: string, textDecoration?: string, textDecorationColor?: string, textDecorationLine?: string, textDecorationStyle?: string, textIndent?: string, textJustify?: string, textOverflow?: string, textShadow?: string, textTransform?: string, top?: string, transform?: string, transformOrigin?: string, transformStyle?: string, transition?: string, transitionDelay?: string, transitionDuration?: string, transitionProperty?: string, transitionTimingFunction?: string, verticalAlign?: string, visibility?: string, whiteSpace?: string, width?: string, wordBreak?: string, wordSpacing?: string, wordWrap?: string, zIndex?: string }

class Branch {
	name: string
	parent: Branch
	children: Branch[] = []

	element: HTMLElement

	protected makeElement() { this.element = document.createElement("div") }
	constructor(name: string) {
		this.name = name
		this.makeElement()
		this.element.id = name
	}

	public render() {}
	protected doRender(): HTMLElement {
		Array.from(this.element.children).forEach(c => this.element.removeChild(c))
		this.render()
		this.children.forEach(c => this.element.appendChild(c.doRender()))
		return this.element
	}
	has(...branches: Branch[]): this { this.children.push(...branches); branches.forEach(b => b.parent = this); return this }
	clearChildren() {
		this.children.forEach(c => c.parent = undefined)
		this.children = []
	}

	center(position = "absolute") { this.css({textAlign: "center", position, transform: "translate(-50%,-50%)", top: "50%", left: "50%"}) }
	centerHorizontal(position = "absolute") { this.css({textAlign: "center", position, transform: "translate(-50%,0)", left: "50%"}) }

	onClick(fn: (e: PointerEvent) => void) { this.element.addEventListener("pointerdown", fn) }

	css(styles: CSSStyle) { for (const k in styles) (this.element.style as unknown as {[key: string]: string})[k] = (styles as unknown as {[key: string]: string})[k] }
	reload() { this.children.forEach(c => c.reload()) }

	static Grid = class Grid extends Branch {
		protected _rows = 0
		protected _cols = 0

		private _cellWidth = "1fr"
		public get cellWidth(): string { return this._cellWidth }; public set cellWidth(v: string) { this._cellWidth = v, this.reload() }
		private _cellHeight = "1fr"
		public get cellHeight(): string { return this._cellHeight }; public set cellHeight(v: string) { this._cellHeight = v, this.reload() }
		
		public get rows(): number { return this._rows }
		public get cols(): number { return this._cols }
		
		protected makeElement() {
			super.makeElement()
			this.css({display: "grid"})
		}
		setRows(num: number, reload = true) { this._rows = num, reload && this.reload() }
		setCols(num: number, reload = true) { this._cols = num, reload && this.reload() }
		addRows(num = 1) { this._rows += num, this.reload() }
		addCols(num = 1) { this._cols += num, this.reload() }

		reload() { this.css({gridTemplateRows: `repeat(${this._rows},${this._cellHeight})`, gridTemplateColumns: `repeat(${this._cols},${this._cellWidth})`}), super.reload() }
	}
}

(() =>{
	document.body.parentElement.style.width = document.body.style.width = "100vw", document.body.parentElement.style.height = document.body.style.height = "100vh"
	document.body.parentElement.style.margin = document.body.style.margin = document.body.parentElement.style.padding = document.body.style.padding = "0"
})()

const body = new (class MainBranch extends Branch {
	constructor() { super("MainBranch") }
	render() {
		Array.from(document.body.children).forEach(c => document.body.removeChild(c))
		document.body.appendChild(this.element)
	}

	start() {
		this.doRender()
	}
})()

// body.render = function renderBody(this: Branch) {
// 	Array.from(document.body.children).forEach(c => document.body.removeChild(c))
// 	document.body.appendChild(this.element)
// 	return this.element
// }
