
console.log("ASDLJKADSLKJADSKL")

// Map the letters to symbols
const letterMapping = {
	"l": "1",
	"i": "!",
	"z": "2",
	"e": "3",
	"a": "4",
	"s": "5$",
	"b": "8",
	"g": "9",
	"_": " ~-",
	"-": "~",
	"o": "0"
}

const acceptedElements = [ "a", "p", "h1" ]

// Get the list of elements from the page
const els = ([...document.querySelectorAll("*")] as HTMLElement[])
	.filter(e => acceptedElements.includes(e.tagName.toLowerCase()))
	.filter(e => [...e.children].filter(c => c.tagName.toLowerCase() != "br").length == 0)

let elIdx = 0
for (const el of els) {
	(el as any).realInner = el.innerText
	el.style.transition = ""
	el.style.opacity = '0'
	el.style.transition = "opacity .5s"
	setTimeout(() => {
		el.style.opacity = '1'
	}, (elIdx++) * 100)
}

setInterval(() => {
	for (const el of els) {
		if (Math.random() > 0.1) continue
		el.innerHTML = (el as unknown as { realInner: string })
			.realInner.replace(/./g, e => {
				const lc = e.toLowerCase()
				if (!(lc in letterMapping) || Math.random() < 0.98) return e
				return "<weird>" + letterMapping[lc][
					Math.floor(letterMapping[lc].length * Math.random())
				] + "</weird>"
			})
	}
}, 100)
