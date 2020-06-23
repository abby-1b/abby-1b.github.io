var help = `
All instructions (not including arguments) are 8 bits long.

The upper four (4) bits of an instruction ([1010]1010)
are used for the instruction itself.

The second lowest two (2) bits of an instruction (1010[11]00)
are used to determine the size of arguments.

Example (everything inside of parenthesis is not program text): 
  (Instruction) b0000 (Arg1 length) b10 (Arg2 length) b01 (Arg1)0x00 (Arg1)0x10 (Arg2)0x01
Without comments:
  0x09 0x00 0x10 0x01


MOV:   0x0
Moves a value from one address0 to address1.
  (Eg: "mov x00000 x00000")

SET:   0x1
Sets address0 to number1.
  (Eg: "set x00000 xFF")

ADD:   0x2
Adds address0 to address1
  (Eg: "add x00000 x00000")

SUB:   0x3
Substracts address0 from address1
  (Eg: "add x00000 x00000")

MULT:  0x4
Multiplies address0 by address1
  (Eg: "mult x00000 x00000")

DIV:   0x5
Divides address0 by address1
  (Eg: "div x00000 x00000")

SHFTL: 0x6
Shifts address0 left by address1
  (Eg: "shftl x00000 x00000")

SHFTR: 0x7
Shifts address0 right by address1
  (Eg: "shftr x00000 x00000")

JMP:   0x8
Sets the instruction pointer to address0
  (Eg: "jmp x00000")

JMPZ:  0x9
Sets the instruction pointer to address0 IF address1 is zero.
  (Eg: "jmpz x00000 x00000")

JMPNZ: 0xA
Sets the instruction pointer to address0 IF address1 NOT is zero.
  (Eg: "jmpnz x00000 x00000")`;

//var allIns = ["mov", "set", "add", "sub", "mult", "div", "shiftl", "shiftr", "jmp", "jmpz", "jmpnz"];

//Instruction exec
var instructions = [
  function(a0,a1) { memory[a1] = memory[a0]; return 1; },
  function(a0,n1) { memory[a0] = n1; return 1; },
  function(a0,a1) { memory[a1] += memory[a0]; return 1; },
  function(a0,a1) { memory[a1] -= memory[a0]; return 1; },
  function(a0,a1) { memory[a1] *= memory[a0]; return 1; },
  function(a0,a1) { memory[a1] /= memory[a0]; return 1; },
  function(a0,a1) { memory[a0] = memory[a0] << a1; return 1; },
  function(a0,a1) { memory[a0] = memory[a0] >> a1; return 1; },
  function(a0,a1) { insP = a0; return 0; },
  function(a0,a1) { if (a1 == 0) { insP = a0; return 0; } return 1; },
  function(a0,a1) { if (a1 != 0) { insP = a0; return 0; } return 1; },
  function(a0,a1) { return 1; },
  function(a0,a1) { return 1; },
  function(a0,a1) { return 1; },
  function(a0,a1) { return 1; },
  function(a0,a1) { console.log("END!"); keepRunning = false; }
];

// Setup Memory
var memoryBuffer = new ArrayBuffer(65536);
var memory = new Uint8Array(memoryBuffer);
var insP = 0;

function joinBits(ls) {
  return ls.reduce((total, arg, idx) => total + (arg << ((ls.length - 1 - idx) * 8)), 0);
}

function step() {
  var arg1 = insP + ((memory[insP] & 8) >> 3) + 2,
      arg2 = joinBits(memory.slice(insP + arg1, arg1 + ((memory[insP] & 4) >> 2) + 1)),
      arg1 = joinBits(memory.slice(insP + 1, arg1));

  // Use function output to increment pointer
  if ((instructions[ memory[insP] >> 4 ])(arg1, arg2)) {
    insP += ((memory[insP] & 4) >> 2) + ((memory[insP] & 8) >> 3) + 3;
  }
}
