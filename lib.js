
let isSmall = window.innerWidth < 660
let _cssStyles = {
    "width": "%",
    "height": "%"
}

function _error(m, e) { throw "error: " + m }

class Card {
    constructor(params, smallParams) {
        for (let p in params) this[p] = params[p]
        if (isSmall && smallParams)
            for (let p in smallParams) this[p] = smallParams[p]
        this._el = document.createElement("div")
        this._el.className = "card"
        this._children = []
        this._parent = {}
    }

    _cssStyle(s, v) {
        if (s in _cssStyles) {
            this._el.style[s] = v + _cssStyles[s]
        }
    }

    addChild(c) {
        try {
            this._el.appendChild(c._el)
            c._parent = this
            this._children.push(c)
        } catch (e) {
            _error(`Something happened while adding this child. Big yikes.`, e)
        }
    }

    removeChild(c) {
        this._el.removeChild(c._el)
        this._children.splice(this._children.indexOf(c), 1)
    }

    removeSelf() {
        this._parent.removeChild(this)
    }
}

let body = new Card()
body._el = document.body
