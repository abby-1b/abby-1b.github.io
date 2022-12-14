"use strict";
// Maps phrases/words to others.
const phraseMap = {};
// Holds pre-constructed RegExps (as strings) to be executed
const regs = {};
// Holds RegExps (as strings) to be executed without further processing
const straightRegs = {};
fetch("shake.json").then(r => r.text()).then(t => {
    const jsonData = JSON.parse(t);
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            phraseMap[f[i]] = t[i];
    })(jsonData.phrases1.split("\n"), jsonData.phrases2.split("\n"));
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            phraseMap[f[i]] = t[i];
    })(jsonData.words1.split("\n"), jsonData.words2.split("\n"));
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            regs["(" + f[i] + ")"] = [t[i], 0];
    })(jsonData.intraword1.split("\n"), jsonData.intraword2.split("\n"));
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            regs["( |^|[^A-Za-z])(" + f[i] + ")"] = [t[i], 1];
    })(jsonData.prefixes1.split("\n"), jsonData.prefixes2.split("\n"));
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            regs["(" + f[i] + ")(?=( |$|[^A-Za-z]))"] = [t[i], 0];
    })(jsonData.suffixes1.split("\n"), jsonData.suffixes2.split("\n"));
    console.log(regs);
    out.value = convert(inp.value);
});
function convert(dat) {
    if (Object.keys(phraseMap).length == 0)
        return "Conversions not loaded yet!";
    let i = 0;
    // Loop through phrase map
    for (const k in phraseMap) {
        if (k.length < 2)
            continue;
        let v = phraseMap[k];
        dat = dat.replace(new RegExp("( |^|[^A-Za-z])(" + k + ")( |$|[^A-Za-z])", "gi"), (...e) => {
            i++;
            const t = e[2].trim();
            const c1 = t[0].toUpperCase() == t[0], c2 = t[1].toUpperCase() == t[1];
            if (c1 && c2)
                v = v.toUpperCase();
            else if (c1 && !c2)
                v = v[0].toUpperCase() + v.slice(1);
            return e[1] + (e[2][0] == " " ? " " : "") + v + (e[2][e.length - 1] == " " ? " " : "") + e[3];
        });
    }
    // Loop through regexes
    for (const r in regs) {
        let v = regs[r];
        dat = dat.replace(new RegExp(r, "gi"), (...a) => {
            const e = a.slice(1, -2);
            i++;
            const t = e[v[1]].trim();
            const c1 = t[0].toUpperCase() == t[0], c2 = t[1].toUpperCase() == t[1];
            if (c1 && c2)
                v[0] = v[0].toUpperCase();
            else if (c1 && !c2)
                v[0] = v[0].toUpperCase() + v[0].slice(1);
            e[v[1]] = (e[v[1]][0] == " " ? " " : "") + v[0] + (e[v[1]][e.length - 1] == " " ? " " : "");
            console.log(e, a);
            return e.join("");
        });
    }
    // Loop through straight regexes
    // for (const r in straightRegs) {
    // 	let v = regs[r]
    // 	dat = dat.replace(new RegExp(r, "gi"), regs[r])
    // }
    console.log("Conversions:", i);
    return dat;
}
const inp = document.querySelector("#in");
const out = document.querySelector("#out");
let evt = 0;
inp.onkeydown = e => {
    if ((e.key.length == 1 || e.key == "Backspace") && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const e = ++evt;
        setTimeout(() => {
            if (evt == e)
                out.value = convert(inp.value);
        }, 50 + Math.sqrt(inp.value.length));
    }
};
setTimeout(() => out.value = convert(inp.value), 100);
function loadBook() {
    fetch("./outsiders.txt").then(r => r.text()).then(t => {
        inp.value = t;
        out.value = convert(inp.value);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGliLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3JjL0NvbnZlcnQudHMiLCJzcmMvSGFuZGxlLnRzIiwic3JjL0xvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLGdDQUFnQztBQUNoQyxNQUFNLFNBQVMsR0FBNEIsRUFBRSxDQUFBO0FBRTdDLDREQUE0RDtBQUM1RCxNQUFNLElBQUksR0FBc0MsRUFBRSxDQUFBO0FBRWxELHVFQUF1RTtBQUN2RSxNQUFNLFlBQVksR0FBNEIsRUFBRSxDQUFBO0FBRWhELEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDaEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQTRCLENBR3hEO0lBQUEsQ0FBQyxDQUFDLENBQVcsRUFBRSxDQUFXLEVBQUUsRUFBRTtRQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7WUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFELENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBRy9EO0lBQUEsQ0FBQyxDQUFDLENBQVcsRUFBRSxDQUFXLEVBQUUsRUFBRTtRQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7WUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzFELENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBRzNEO0lBQUEsQ0FBQyxDQUFDLENBQVcsRUFBRSxDQUFXLEVBQUUsRUFBRTtRQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7WUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN0RSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUduRTtJQUFBLENBQUMsQ0FBQyxDQUFXLEVBQUUsQ0FBVyxFQUFFLEVBQUU7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNyRixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUdqRTtJQUFBLENBQUMsQ0FBQyxDQUFXLEVBQUUsQ0FBVyxFQUFFLEVBQUU7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFD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