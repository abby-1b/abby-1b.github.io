var wt = document.getElementById("write");
var ot = document.getElementById("out")
var cd = document.getElementById("code");

var wid = wt.cols*2.55/2;

function display(inp, p=" ") { return (inp < 0 ? p+"x" : p+p)+(Math.abs(inp).toString(16).toUpperCase().padStart(2, '0')) }

var pm = [];
function setupMem() {
  pm = [];
  for (var a = 0; a < 512; a++) {
    pm[a] = 0;
  }
}

function showMem() {
  var os = "";
  for (var a = 0; a < 512; a++) {
    os += display(pm[a]);
    if (os.split("\n")[os.split("\n").length-1].length > wid-4) {
      os += "\n";
    }
  }
  wt.value = os;
  console.log("memory shown.");
}

function getClose(str, pos) {
  const rExp = /\[|\]/g;
  rExp.lastIndex = pos + 1;
  var deep = 1;
  while ((pos = rExp.exec(str))) { if (!(deep += str[pos.index] === "[" ? 1 : -1 )) { return pos.index }}
}
function getPar(str, pos) {
  const rExp = /\(|\)/g;
  rExp.lastIndex = pos + 1;
  var deep = 1;
  while ((pos = rExp.exec(str))) { if (!(deep += str[pos.index] === "(" ? 1 : -1 )) { return pos.index }}
}
function runProgram(p) {
  ot.value = "";
  setupMem();
  
  var pt = 0, ppt = 0;
  console.log("running...");
  var bs = {};
  for (var a = 0; a < p.length-1; a++) {
    if (p[a] == "[") {
      bs[a.toString()] = getClose(p, a);
      bs[bs[a.toString()]] = a;
    }
    if (p[a] == "(") {
      bs[a.toString()] = getPar(p, a);
      bs[bs[a.toString()]] = a;
    }
  }
  while (ppt < p.length) {
    if (p[ppt] == "+")                { pm[pt] ++;                                                            }
    if (p[ppt] == "-")                { pm[pt] --;                                                            }
    if (p[ppt] == ">")                { pt = ( pt + 1 ) % pm.length;                                          }
    if (p[ppt] == "<")                { pt --; pt = (pt < 0 ? pm.length : pt)                                 }
    if (p[ppt] == "%")                { ot.value += display(pm[pt], "")                                       }
    if (p[ppt] == ".")                { ot.value += String.fromCharCode(pm[pt]);                              }
    if (p[ppt] == "[" && pm[pt] == 0) { ppt = bs[ppt];                                                        }
    if (p[ppt] == "]" && pm[pt] != 0) { ppt = bs[ppt];                                                        }
    if (p[ppt] == "(")                { st =p.substring(ppt+1,bs[ppt]);pm[pt]+=parseInt(st);ppt +=st.length+1;}
    ppt ++;
  }
  console.log("ran.");
  showMem();
}

function runCode() {
  var ucc0 = cd.value, ucc1 = "";
  for (var a = 0; a < ucc0.length; a++) {
    if ("+-<>%.[]".indexOf(ucc0[a]) > -1) {
      ucc1 += ucc0[a];
    }
  }
  delete ucc0;
  var ucc2 = "";
  var ic = 0, i = "+";
  for (var a = 0; a < ucc1.length; a++) {
    if (ucc1[a] != i && ic != 0) {
      if (ic > 1) {
        ucc2 += "(" + (i == "-" ? i : "") + ic + ")"
        ic = 0;
      } else {
        po = "";
        for (var b = 0; b < ic; b++) {
          po += i;
        }
        ucc2 += po;
        ic = 0;
      }
    }
    if ((ucc1[a] == "+" || ucc1[a] == "-") && i != ucc1[a]) {
      i = ucc1[a];
      ic = 1;
    } else if (i == ucc1[a]) {
      ic ++;
    } else {
      ucc2 += ucc1[a];
    }
  }
  runProgram(ucc2);
}
runCode();
