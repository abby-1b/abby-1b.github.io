` Characters `
var chars    = [];
var charMaps = [];
fetch("characters.txt").then(function(response){response.text().then(
  function(text){
    preChars = text.split("\n");
    for (var a = 0; a < preChars.length - 1; a++) {
      chars   [chars   .length] = preChars[a].split(" ")[0];
      charMaps[charMaps.length] = preChars[a].split(" ")[1];
    }

    runJSL();
  }
);});


` Canvas `
var canvas = document.getElementById("JSCanvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";

` Color Functions and Class `
class ColorClass {
  constructor(a, b=-1, c=-1) {
    if (typeof a == "string") {
      a = (a[0] == "#" ? a.substring(1) : a);
      this.r = toInt(a.substring(0, 2));
      this.g = toInt(a.substring(2, 4));
      this.b = toInt(a.substring(4, 6));
      this.hexColor = "#" + a;
      return;
    }
    if (b == -1 || c == -1) {
      b = a;
      c = a;
    }
    this.r = a;
    this.g = b;
    this.b = c;

    this.updateColors();
  }

  updateColors() {
    this.hexColor = "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
  }
}
function Color(a, b=-1, c=-1) {
  return new ColorClass(a, b, c);
}

function toInt(a) {
  return (typeof a == "string" ? parseInt(a, 16) : a);
}
function toHex(a) {
  ret = a.toString(16);
  return (ret.length == 1 ? "0" + ret : ret);
}
function pad(s, size) {
    while (s.length < size) s = "0" + s;
    return s;
}

function useColor(color) {
  color = (typeof color == "object" ? color.hexColor : color);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
}

` Shape and Character Functions `
function rect(x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

function background(color=-1) {
  cfs = ctx.fillStyle;
  css = ctx.strokeStyle;
  if (color != -1) {useColor(color)}
  rect(0, 0, 96, 96);
  ctx.fillStyle = cfs;
  ctx.strokeStyle = css;
}

function box(x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x+0.5, y+0.5, w, h);
  ctx.stroke();
}

function character(c, x, y) {
  i = chars.indexOf(c.toUpperCase());
  for (var a = 0; a < 9; a++) {
    if (charMaps[i][a] == ".") {
      rect(x + (a % 3), y + Math.floor(a / 3), 1, 1);
    }
  }
}

function text(t, x, y) {
  for (var a = 0; a < t.length; a++) {
    if (chars.includes(t[a].toUpperCase())) {
      character(t[a], x + a * 4, y);
    }
  }
}

` Buttons `
var buttonImage = document.getElementById("buttons");
buttons = 0;
getButtons = function(e) {
  console.log(e.pageX, e.pageY);
  if (e.pageX < 235) { // Directionals
    touchX = e.pageX - 123+0.1;
    touchY = e.pageY - 516+0.1;
    a = mod(((touchX < 0 ? PI : 0) + atan(touchY / touchX) + PI/4), PI2);
    if      (a < PI*0.5) { return "001000" } // Right
    else if (a < PI    ) { return "000010" } // Down
    else if (a < PI*1.5) { return "000100" } // Left
    else                 { return "000001" } // Up
  } else { // Square / Circle
    return (e.pageY < 516 ? "010000" : "100000");
  }
};

updateButtons = function(e) {
  buttons = 0;
  for (var a = 0; a < e.length; a++) {
    buttons = buttons + parseInt(getButtons(e[a]), 2);
  }
  //buttons = buttons;
}

buttonImage.ontouchstart = function(e) {
  updateButtons(e.touches);
}
buttonImage.ontouchend = function(e) {
  updateButtons(e.touches);
}
buttonImage.ontouchmove = function(e) {
  updateButtons(e.touches);
}

function isDown(i) {
  return pad(buttons.toString(2), 6)[6 - sqrt(i)] == "1";
}

` Misc `
function themeColor(color)  {
  color = (typeof color == "object" ? color.hexColor : color);
  document.body.style.backgroundColor = color;
}

` Rename Basic Functions `
mod = (n, m) => ((n % m) + m) % m;
onDelay = setTimeout
onInterval = setInterval
sin  = Math.sin;
cos  = Math.cos;
tan  = Math.tan;
sqrt = Math.sqrt;
rand = Math.random;
atan = Math.atan;
PI   = Math.PI;
PI2  = Math.PI * 2;


// ` Startup JSL `
function runJSL() {
  fetch(document.getElementsByTagName("script")[0].src).then(function(response) {response.text().then(function(data) {
    (1, eval)(data);
  });});
}
