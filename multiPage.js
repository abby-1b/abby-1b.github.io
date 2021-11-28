invert()
hud()

// background-image:url('BannerSmall.png')

function openPage(pageLocation) {
	if (pageLocation[0] == "?" || pageLocation === "") {
		if (pageLocation !== '') pageLocation = '/' + pageLocation.slice(1)
		let normalPageLocation = pageLocation + ""
		pageLocation += "/site.mdc"
		fetch(pageLocation).then(r => r.text().then(text => {
			text = mdToHtml(text)
			document.getElementById("content").innerHTML = text.text
			document.title = text.meta.title || "Code (I Guess)"
			// document.getElementById("bannerImage").style.backgroundImage = "url('" + text.meta.banner + "')"
			document.getElementById("bannerImage").src = normalPageLocation + "/" + text.meta.banner
			if (text.meta.navbar) {
				// Enable navbar here
			}
		}))
	} else {
		if (pageLocation.startsWith("http")) {
			window.location.href = pageLocation
		} else {
			window.location.href += pageLocation
		}
	}
}
openPage(window.location.search)

function openURL(url) {
	openPage(url)
	window.history.pushState('page2', document.title, url);
}

window.onpopstate = function(e) {
	console.log(e)
	openPage(window.location.search)
}

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
			localStorage.setItem("darkMode", "1")
			setColors(true)
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
		document.documentElement.style.setProperty("--accentSeeThrough", "0.8")
	} else {
		document.documentElement.style.setProperty("--bg", "255,255,255")
		document.documentElement.style.setProperty("--fg", "0,0,0")
		document.documentElement.style.setProperty("--green", "#050")
		document.documentElement.style.setProperty("--red", "#500")
		document.documentElement.style.setProperty("--accentSeeThrough", "0.6")
	}
}