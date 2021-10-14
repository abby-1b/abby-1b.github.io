// Custom MarkDown library for JS
// It's supposed to be light-weight, use a lot of regular
// expressions, and have a few extra features. We'll see.

// Here are the extra features:
//   - Checkmark boxes

function mdToHtml(t) {
	let cmIconToClass = {
		" ": "unchecked",
		"x": "checked",
		"!": "important",
		"?": "question"
	}
	let m = ""
	// Metadata
	t = t.replace(/\{(\n|.)*?\}\n{1,}/gm, e => { m = JSON.parse(e); return "" })
	// Headers (#)
		.replace(/^(\s*)(#{1,6} )(?=.*$)/gm, e => "<h" + e.trim().length + ">")
		.replace(/^<h[0-9]>.*/gm, e => e + "</" + e.split(">")[0].slice(1) + ">")
		
	// Bullet lists
		.replace(/^(\s*?)~(\s|)/gm, "<li>")

	// Checklists
		.replace(/^(\s*?)\[.\](\s|)/gm, e => "<li class='" + cmIconToClass[e.trim()[1]] + "'>")
		.replace(/^<li >.*/gm, e => e + "</li>")

	// Add / Remove lists
		.replace(/^(\s*?)[+|-](\s|)/gm, e => e.trim() == "+" ? "<li class='added'>" : "<li class='removed'>")

	// Closes all list items
		.replace(/^<li.*/gm, e => e + "</li>")
	
	// Links
		.replace(/\[.*?]\(.*?\)/gm, e => "<a onclick=\"openURL('" + e.split("](")[1].slice(0,-1) + "')\">" + e.split("](")[0].slice(1) + "</a>")

	// Bold, italics, combinations of <
		.replace(/\*\*[^*]*?\*\*/gm, e => "<b>" + e.slice(2, -2) + "</b>")
		.replace(/\*[^*]*?\*/gm, e => "<i>" + e.slice(1, -1) + "</i>")
		.replace(/_.*?_/gm, e => "<i>" + e.slice(1, -1) + "</i>")
	
	// Monospace
		.replace(/\`[^\`]{1,}\`(?!`)/gm, e => "<m>" + e.slice(1, -1) + "</m>")
		.replace(/```.*$/gm, "```")
		.replace(/```(.|\n)*?```/gm, e => "<div class='spacer'></div><m class='block'>" + e.slice(3, -3).trim().replace(/\n/g, "<div class='spacer'></div>") + "</m>")

	// Superscript
		.replace(/\^\d{1,}/g, e => "<sup>" + e.slice(1) + "</sup>")
	
	// Spacers (newlines, basically)
		.replace(/\n\n/gm, "\n<div class='spacer'></div>")

	// Removes all the unused things
		.replace(/\n\</g, "<")
		.replace(/>\n/g, ">")
	return {text: t, meta: m}
}
