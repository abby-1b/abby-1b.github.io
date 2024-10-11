
/** Runs when a project is click, directing the user to the desired website */
function clickedProject(projectElement) {
	open(projectElement.getAttribute("link"));
}

/** Makes the text within the element wiggle! */
function makeWiggle(el: HTMLElement) {
	const inner = el.innerText;
	const chars = inner.split('').map(c => c == ' ' ? '&nbsp;' : c);
	el.innerHTML =
		chars.map(c => {
			const delay = ~~(Math.random() * 400);
			const time = Math.random() * 0.5 + 0.5;
			return `<span class='wiggleChar' style='animation-duration:${time}s;animation-delay:${delay}ms'>${c}</span>`
		})
		.join('');
}

window.addEventListener('load', () => {
	const wiggleElements = document.querySelectorAll('.wiggle');
	([...wiggleElements] as HTMLElement[]).forEach(makeWiggle);
});
