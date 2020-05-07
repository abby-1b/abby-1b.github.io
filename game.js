// JSL Scripting Language

themeColor(black);

background(black);

var slimeSprite = new Sprite("8;b#-;2#10f;4#-;2#00f;2#10f;2#00f;2#-;2#10f;11f;34f;2#10f;-;10e;2#10f;2#11f;34f;10f;4#10e;10f;2#11f;a#10e;-;6#10e;-");
var shadow = new Sprite("12;57#-;6#000;4#-;a#000;-;c#000;-;a#000;4#-;6#000;3#-");

function draw() {
  background(Color("3e7"));

  //ss.draw(2, 2, 1);
  useOpacity(25);
  shadow.drawCenter(hWidth, hHeight, 0.9);

  useOpacity(255);
  slimeSprite.drawCenter(hWidth, hHeight, 1);
}
