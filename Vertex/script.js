document.ontouchstart = function(e){ 
  e.preventDefault(); 
}

var canvas = document.getElementById("screen");
var ctx = canvas.getContext("2d");

var width  = canvas.width;
var height = canvas.height;

var black = -16777216;
var white = -1;

var imageData = ctx.getImageData(0, 0, width, height);
var buf = new ArrayBuffer(imageData.data.length);
var buf8 = new Uint8ClampedArray(buf);
var screen = new Uint32Array(buf);

function clearS() {
  buf8.fill("-1");
}
function drawS() {
  imageData.data.set(buf8);
  ctx.putImageData(imageData, 0, 0);
}

for (var x = 0; x < width / 8; x++) {
  for (var y = 0; y < height / 8; y++) {
    screen[(x * 8) + (y * width * 8)] = black;
  }
}
drawS();
