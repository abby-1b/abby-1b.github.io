/*
    This file converts the latest markdown files found
    on the CTA GitHub repository to standard HTML using
    the Showdown converter.
        https://github.com/showdownjs/showdown
*/

// Gets the website position argument
let pos = window.location.search
while (['?', '='].includes(pos[0])) pos = pos.slice(1)

// Goes to the home address
if (pos == "") location.replace(window.location + "?home")

// CSS for dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log("Dark!")
}

// CTA repository URL
let repo = "https://raw.githubusercontent.com/CodeIGuess/CTA/main/"

// The converter
let converter = new showdown.Converter()

// Mappings from URLs to CTA repository files.
pos = {
    "home": "README.md"
}[pos]

// MarkDown Div
let mdd = document.getElementById("mdd")

// Gets markdown file
fetch(repo + pos)
    .then(response => response.text())
    .then(data => {
        mdd.innerHTML = converter.makeHtml(data)
    })

