document.ontouchstart = function(e){ 
  memory[memLoc["touchDown"]] = 1;
  e.preventDefault();
}
document.ontouchmove = function(e){ 
  console.log(e);
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

var memLoc = {
  "clearScreen": 0xFFFF - 1,
  "drawScreen": 0xFFFF - 2,
  "xout": 0xFFFF - 3,
  "yout": 0xFFFF - 5,
  "xin": 0xFFFF - 7,
  "yin": 0xFFFF - 9,
  "touchDown": 0xFFFF - 11
};

function clearS() {
  screen.fill(black.toString());
}
function drawS() {
  imageData.data.set(buf8);
  ctx.putImageData(imageData, 0, 0);
}

function background() {
  for (var x = 0; x < width / 8; x++) {
    for (var y = 0; y < height / 8; y++) {
      screen[(x * 8) + (y * width * 8)] = white;
    }
  }
}

function parseMemory() {
  if        (memory[memLoc["clearScreen"]] != 0) {
    console.log("CLEAR SCREEN!");
    memory[memLoc["clearScreen"]] = 0;
    clearS();
    background();
  } else if (memory[memLoc["drawScreen"]] != 0) {
    console.log("DRAW SCREEN!");
    memory[memLoc["drawScreen"]] != 0;
    drawS();
  }
}

memory[0] = 0b00011100;
memory[1] = 0xFF; memory[2] = 0xFF - 1;
memory[3] = 0x00; memory[4] = 0x01;

memory[5] = 0b00011100;
memory[6] = 0xFF; memory[7] = 0xFF - 2;
memory[8] = 0x00; memory[9] = 0x01;

memory[10] = 0xFF;
//console.log(memory.slice(10));

//memory[insP] = 255;
while (memory[insP] != 255) {
  console.log(memory.slice(insP, insP + 5));
  step();
  parseMemory();
}//*/
