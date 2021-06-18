
/// STORAGE

if (localStorage.getItem("system") == null) {localStorage.setItem("system", JSON.stringify({
    name: "User Name",
    clipboard: "",
    tiles: ""
}))}
if (localStorage.getItem("apps") == null) { localStorage.setItem("apps", "[]") }

let apps = JSON.parse(localStorage.getItem("apps"))
let appButtons = []

if (apps.length == 0) {
    apps.push({
        title: "Editor",
        type: 1,
        content: "editor.js",
        tile: {x: 0, y: 0}
    })
}

// App types:
//   [0] Code - An app that has its code stored in localStorage
//   [1] URL - An app that points to a script url

// App data:
//   Title - A title for the app
//   Type - See above
//   Content - If the app is URL type, this should be the script url. Otherwise, this should be the app's code.
//   Tile - Tile data for the home screen

// Adds an app to storage
function addApp(data) {
    apps.push(data)
    localStorage.setItem("apps", JSON.stringify(apps))
    return apps.length - 1
}

// Gets an app from storage
function getApp(id) {
    return _apps[id]
}

function openApp(id) {
    if (editMode) {
        apps = apps.filter(e => e != apps[id])
    }
    if (apps[id].type == 1) {
        fetch(apps[id].content).then(r => r.text().then(function(c){_runScript(c, apps[id].title)}))
    } else {
        _runScript(apps[id].content, apps[id].title)
    }
}

function beforeUnload() {
    localStorage.setItem("apps", JSON.stringify(apps))
}

let addAppButton = -1
let editMode = false
let appShrink = 0

function setup() {
    addAppButton = addButton(1, 1, Math.floor(width / 3) - 3, Math.floor(width / 3) - 3, function(t, b) {
        addApp({
            title: "New App",
            type: 0,
            content: "",
            tile: {x: 0, y: 0}
        })
    })
}

function draw() {
    fill(0)
    background()
    
    if (touch.length == 5) { window.location.reload() }

    while (appButtons.length < apps.length) {
        appButtons[appButtons.length] = addButton(0, 0, 0, 0, function(t, b) {
            openApp(appButtons.indexOf(b))
        })
    }
    
    if (editMode) {
        appShrink = (appShrink * 3 + 5) / 4
    } else {
        appShrink *= 3 / 4
    }

    let w3 = Math.floor(width / 3)

    stroke(255)
    fill(255)
    for (let a = apps.length - 1; a >= 0; a--) {
        for (let b = 0; b < apps.length; b++) {
            if (b == a) continue
            if (apps[b].tile.x == apps[a].tile.x && apps[b].tile.y == apps[a].tile.y) {
                apps[a].tile.x += 1
            }
            if (apps[a].tile.x >= 3) {
                apps[a].tile.x = 0
                apps[a].tile.y += 1
            }
        }
        let sm = appShrink
        rect(apps[a].tile.x * w3 + 1 + (Math.random() * 2 - 1) * 0.7 * editMode + sm, apps[a].tile.y * w3 + 1 + (Math.random() * 2 - 1) * 0.7 * editMode + sm, w3 - 3 - sm * 2, w3 - 3 - sm * 2)
        _buttons[appButtons[a]][0] = apps[a].tile.x * w3 + 1
        _buttons[appButtons[a]][1] = apps[a].tile.y * w3 + 1
        _buttons[appButtons[a]][2] = w3 - 3
        _buttons[appButtons[a]][3] = w3 - 3
        text(apps[a].title, apps[a].tile.x * w3 + 3 + sm, apps[a].tile.y * w3 + 3 + sm)
    }
    
    let am = ((5 - appShrink) / 5)
    stroke(220, 255, 220, 255 * am)
    let cx = (apps.length % 3) * w3
    let cy = Math.floor(apps.length / 3) * w3
    rect(cx + 1 + (w3 * (1 - am)) / 2, cy + 1 + (w3 * (1 - am)) / 2, (w3 - 3) * am, (w3 - 3) * am)
    _buttons[addAppButton][0] = cx
    _buttons[addAppButton][1] = cy
    line(cx + w3 / 2, cy + w3 / 3, cx + w3 / 2, cy + w3 - 1 - w3 / 3)
    line(cx + w3 / 3, cy + w3 / 2, cx + w3 - 1 - w3 / 3, cy + w3 / 2)

    fill(255, 50)
    for (let t = 0; t < touch.length; t++) {
        fillRect(Math.floor(touch[t].x / w3) * w3, Math.floor(touch[t].y / w3) * w3, w3, w3)
    }

    // Touch path
    stroke(255)
    fill(255)
    for (let a = 0; a < touch.length; a++) {
        if ((touch[a].x - touch[a].lx) ** 2 + (touch[a].y - touch[a].ly) ** 2 > 26) {
            let n = Math.atan2(touch[a].ly - touch[a].y, touch[a].lx - touch[a].x) + Math.PI
            let ex = touch[a].x + Math.cos(n) * 4
            let ey = touch[a].y + Math.sin(n) * 4
            n -= Math.PI / 2
            line(touch[a].lx, touch[a].ly, touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4)
            line(touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4, ex, ey)
            n += Math.PI
            line(touch[a].lx, touch[a].ly, touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4)
            line(touch[a].x + Math.cos(n) * 4, touch[a].y + Math.sin(n) * 4, ex, ey)
        } else {
            circle(touch[a].x, touch[a].y, 4)
        }
    }
}

function _editMode() {
    editMode = !editMode
}








