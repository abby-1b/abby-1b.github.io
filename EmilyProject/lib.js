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
            regs[f[i]] = t[i];
    })(jsonData.intraword1.split("\n"), jsonData.intraword2.split("\n"));
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            regs["(?<=( |^|[^A-Za-z]))" + f[i]] = t[i];
    })(jsonData.prefixes1.split("\n"), jsonData.prefixes2.split("\n"));
    ((f, t) => {
        for (let i = 0; i < f.length; i++)
            regs[f[i] + "(?=( |$|[^A-Za-z]))"] = t[i];
    })(jsonData.suffixes1.split("\n"), jsonData.suffixes2.split("\n"));
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
        dat = dat.replace(new RegExp("(?<=( |^|[^A-Za-z]))" + k + "(?=( |$|[^A-Za-z]))", "gi"), e => {
            i++;
            const t = e.trim();
            const c1 = t[0].toUpperCase() == t[0], c2 = t[1].toUpperCase() == t[1];
            if (c1 && c2)
                v = v.toUpperCase();
            else if (c1 && !c2)
                v = v[0].toUpperCase() + v.slice(1);
            return (e[0] == " " ? " " : "") + v + (e[e.length - 1] == " " ? " " : "");
        });
    }
    // Loop through regexes
    for (const r in regs) {
        let v = regs[r];
        dat = dat.replace(new RegExp(r, "gi"), e => {
            i++;
            const t = e.trim();
            const c1 = t[0].toUpperCase() == t[0], c2 = t[1].toUpperCase() == t[1];
            if (c1 && c2)
                v = v.toUpperCase();
            else if (c1 && !c2)
                v = v[0].toUpperCase() + v.slice(1);
            return (e[0] == " " ? " " : "") + v + (e[e.length - 1] == " " ? " " : "");
        });
    }
    // Loop through straight regexes
    for (const r in straightRegs) {
        let v = regs[r];
        dat = dat.replace(new RegExp(r, "gi"), regs[r]);
    }
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
