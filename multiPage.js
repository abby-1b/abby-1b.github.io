
let pageLocation = window.location.search
if (pageLocation !== '') pageLocation = '/' + pageLocation.slice(1)

invert()

fetch(pageLocation + "/site.mdc").then(r => r.text().then(text => {
	text = mdToHtml(text)
	document.body.children[0].innerHTML = text.text
	document.title = text.meta.title
	if (text.meta.navbar) {
		
	}
	hud()
}))

function hud() {
	let darkModeButton = document.createElement("div")
	darkModeButton.className = "darkModeButton"
	darkModeButton.onpointerdown = function() {
		invert(true)
	}
	document.body.appendChild(darkModeButton)
}

function invert(change) {
	if (change) {
		let darkPreference = ((parseInt(localStorage.getItem("darkMode")) + 1) % 2) + ""
		if (darkPreference == "1") {
			setColors(true)
		} else {
			setColors(false)
		}
		localStorage.setItem("darkMode", darkPreference)
	} else {
		let darkPreference = localStorage.getItem("darkMode")
		if (darkPreference === null) {
			localStorage.setItem("darkMode", "0")
		} else if (darkPreference == "1") {
			setColors(true)
		} else {
			setColors(false)
		}
	}
}

function setColors(m) {
	if (m) {
		document.documentElement.style.setProperty("--bg", "0,0,0")
		document.documentElement.style.setProperty("--fg", "255,255,255")
		document.documentElement.style.setProperty("--green", "#dfd")
		document.documentElement.style.setProperty("--red", "#fdd")
	} else {
		document.documentElement.style.setProperty("--bg", "255,255,255")
		document.documentElement.style.setProperty("--fg", "0,0,0")
		document.documentElement.style.setProperty("--green", "#050")
		document.documentElement.style.setProperty("--red", "#500")
	}
}
