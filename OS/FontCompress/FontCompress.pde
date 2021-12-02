
boolean fast = true;

PImage fnt;

int lon = 0;

String output = "";

void setup() {
  size(700, 800);
  fnt = loadImage("../font.png");
  noSmooth();
  
  if (fast) {
    frameRate(1000);
  } else {
    frameRate(1);
  }
}


void draw() {
  background(255);
  scale(width / fnt.width);
  image(fnt, 0, 0);
  
  stroke(255, 0, 0);
  noFill();
  rect((lon % 8) * 4 - 0.5, (lon / 8) * 4 - 0.5, 5, 5);
  
  String lb = "";
  for (int a = 0; a < 3 * 4; a++) {
    if (alpha(fnt.get(a % 3 + ((lon % 8) * 4), a / 3 + ((lon / 8) * 4))) > 100) {
      lb += "1";
    } else {
      lb += "0";
    }
  }
  char c1 = (char)(unbinary(lb.substring(0, 6)) + 32);
  char c2 = (char)(unbinary(lb.substring(6   )) + 32);
  output += str(c1) + str(c2);
  println(c1, c2, "  :  ", unbinary(lb.substring(0, 6)), unbinary(lb.substring(6)));
  
  lon++;
  if (lon > 8 * 9 - 1) {
    
    println();
    println(output);
    
    String[] spl;
    spl = output.split("\\\\");
    output = join(spl, "\\\\");
    spl = output.split("\"");
    output = join(spl, "\\\"");
    
    print("{");
    print(output);
    println("}");
    
    noLoop();
  }
}
