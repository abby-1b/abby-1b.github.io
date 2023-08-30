
const els = [...document.querySelectorAll(".cool-letters")] as HTMLElement[]

for (const el of els) {
	el.innerHTML = el.innerText.split("")
		.map(e => e == " " ? "&nbsp;" : `<a class="cool-letter">${e}</a>`)
		.join("")
}
