const MAX_PRECISION_DIGITS = 3;
const EMPTY_CALCULATION = "";
function stringify(n) {
    const fixed = n.toFixed(MAX_PRECISION_DIGITS).replace(/,/g, ".");
    const normal = n.toString();
    return normal.length < fixed.length ? normal : fixed;
}
const CALCULATION_DELAY = 10;
let timer = CALCULATION_DELAY;
let trueCalculation = [
    EMPTY_CALCULATION,
    EMPTY_CALCULATION
];
setInterval(()=>{
    if (timer != null && timer <= 1) {
        if (trueCalculation[0].length == 0) {
            document.querySelector('#output').children[0].innerText = "";
            document.querySelector('#output').children[1].innerText = "";
        } else {
            document.querySelector('#output').children[0].innerHTML = "<a>" + trueCalculation[0].replace(/ /, "</a>&nbsp;&nbsp;<a>") + "</a>";
            document.querySelector('#output').children[1].innerHTML = "<a>" + trueCalculation[1].replace(/ /, "</a>&nbsp;&nbsp;<a>") + "</a>";
        }
        timer = null;
    } else if (timer != null) {
        timer *= 0.9;
    }
}, 10);
const elementPpmAl = document.querySelector('.input[purpose="ppmAl"] > input');
const elementCmolAlKg = document.querySelector('.input[purpose="cmolAlKg"] > input');
const elementFactor = document.querySelector('.input[purpose="factor"] > input');
let textForPpmAl = "";
let textForCmolAlKg = "";
function sliderChange(el) {
    el.nextElementSibling.innerText = parseFloat(el.value).toFixed(2);
    inputChange(el);
}
const sliders = [
    ...document.querySelectorAll('input[type="range"]')
];
sliders.map((e)=>sliderChange(e));
function inputChange(el) {
    const randDelay = CALCULATION_DELAY * (0.9 + Math.random() * 0.3);
    timer = timer == null ? randDelay : timer + randDelay;
    const elPurpose = el.parentElement.attributes.getNamedItem("purpose").value;
    let ppmAl = elementPpmAl.value == "" ? -1 : parseFloat(elementPpmAl.value);
    let cmolAlKg = elementCmolAlKg.value == "" ? -1 : parseFloat(elementCmolAlKg.value);
    let factor = elementFactor.value == "" ? -1 : parseFloat(elementFactor.value);
    document.querySelector('#output').children[0].innerHTML = document.querySelector('#output').children[1].innerHTML = "<a>" + String.fromCharCode(8226).repeat(3) + "</a>";
    if (ppmAl == -1 && cmolAlKg == -1) {
        trueCalculation = [
            EMPTY_CALCULATION,
            EMPTY_CALCULATION
        ];
        return;
    }
    if (elPurpose == "ppmAl") {
        elementCmolAlKg.value = ppmAl == -1 ? "" : stringify(ppmAl / 90);
        cmolAlKg = ppmAl == -1 ? -1 : parseFloat(elementCmolAlKg.value);
    } else if (elPurpose == "cmolAlKg") {
        elementPpmAl.value = cmolAlKg == -1 ? "" : stringify(cmolAlKg * 90);
        ppmAl = cmolAlKg == -1 ? -1 : parseFloat(elementPpmAl.value);
    }
    if (ppmAl == -1 && cmolAlKg == -1) {
        trueCalculation = [
            EMPTY_CALCULATION,
            EMPTY_CALCULATION
        ];
        return;
    }
    const THA_TO_LBFTSQ_CONSTANT = 20.481606212;
    const tHa = factor * cmolAlKg;
    const lbFtSq = tHa * THA_TO_LBFTSQ_CONSTANT;
    trueCalculation = [
        stringify(tHa) + ` ${textForPpmAl}`,
        stringify(lbFtSq) + ` ${textForCmolAlKg}\xb2`, 
    ];
}
const changeLanguageButton = document.querySelector("#switch-button");
changeLanguageButton.addEventListener('click', ()=>{
    if (lang == "es") {
        window.location.href = window.location.origin + window.location.pathname + "?lang=en";
    } else {
        window.location.href = window.location.origin + window.location.pathname + "?lang=es";
    }
});
const translationTargets = [
    (t1)=>document.title = t1,
    (t2)=>changeLanguageButton.value = t2,
    (t3)=>document.querySelector('#title>h1').innerHTML = t3,
    (t4)=>document.querySelector('[purpose="ppmAl"]>h2').innerHTML = t4,
    (t5)=>document.querySelector('[purpose="cmolAlKg"]>h2').innerHTML = t5,
    (t6)=>document.querySelector('[purpose="factor"]>h2').innerHTML = t6,
    (t7)=>textForPpmAl = t7,
    (t8)=>textForCmolAlKg = t8, 
];
const searchParams = new URLSearchParams(window.location.search);
let lang = (searchParams.get("lang") ?? "en").toLowerCase();
if (!(lang in translations)) {
    lang = "en";
}
const t = translations[lang];
for(let i = 0; i < t.length; i++){
    translationTargets[i](t[i]);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNhbGMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiXG5kZWNsYXJlIGxldCB0cmFuc2xhdGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcblxuLyoqIEhvdyBtYW55IGRlY2ltYWwgZGlnaXRzIHRvIGtlZXAgKi9cbmNvbnN0IE1BWF9QUkVDSVNJT05fRElHSVRTID0gMztcblxuLyoqIFdoYXQgdG8gZGlzcGxheSB3aGVuIGEgY2FsY3VsYXRpb24gcmV0dXJucyBub3RoaW5nLiAqL1xuY29uc3QgRU1QVFlfQ0FMQ1VMQVRJT04gPSBcIlwiO1xuXG4vKiogQ29udmVydHMgYSBudW1iZXIgdG8gYSBzdHJpbmcsIGJ1dCBrZWVwaW5nIGl0IHByZXR0eS4gKi9cbmZ1bmN0aW9uIHN0cmluZ2lmeShuOiBudW1iZXIpOiBzdHJpbmcge1xuXHRjb25zdCBmaXhlZCA9IG4udG9GaXhlZChNQVhfUFJFQ0lTSU9OX0RJR0lUUykucmVwbGFjZSgvLC9nLCBcIi5cIik7XG5cdGNvbnN0IG5vcm1hbCA9IG4udG9TdHJpbmcoKTtcblx0cmV0dXJuIG5vcm1hbC5sZW5ndGggPCBmaXhlZC5sZW5ndGggPyBub3JtYWwgOiBmaXhlZDtcbn1cblxuLyoqIFNlZSBiZWxvdy4gKi9cbmNvbnN0IENBTENVTEFUSU9OX0RFTEFZID0gMTA7XG5cbi8qXG5EZWxheWluZyB0aGUgY2FsY3VsYXRpb24gZ2l2ZXMgdGhlIHVzZXIgdGltZSB0byBub3RpY2UgdGhhdCB0aGVpciBjaGFuZ2UgaXNcbmJlaW5nIGFjY291bnRlZCBmb3IuIFdpdGhvdXQgdGhpcyBzaW1wbGUgdGltZW91dCwgdGhlIHVzZXIgbWlnaHQgdGhpbmsgXCJPaCwgaXNcbml0IG5vdCB3b3JraW5nPyBJdCdzIGdvaW5nIHRvbyBmYXN0IVwiXG5JdCBnaXZlcyB0aGUgaW1wcmVzc2lvbiB0aGF0IHNvbWV0aGluZyBoZWF2aWVyIGlzIGJlaW5nIGRvbmUgb24gdGhlIGJhY2tlbmQsXG5zb21lIGluZ2VuaW91cyBjYWxjdWxhdGlvbiB0aGF0IGNhbiBzb2x2ZSBhbGwgdGhlaXIgcHJvYmxlbXMuXG5JZiB1c2VycyBjb21wbGFpbiB0aGF0IGl0J3MgdG9vIHNsb3csIGxvd2VyIHRoZSBkZWxheSBhYm92ZS4gSWYgdGhlIGFwcCBpc1xuZmxvb2RlZCB3aXRoIGlzc3VlcyBhYm91dCBzbG93IGludGVybmV0IG9yIGEgYmFkIGNhbGN1bGF0b3IsIGxvd2VyIHRoZSBkZWxheVxuYWJvdmU7IGJ1dCBuZXZlciBtYWtlIGl0IHplcm8uIEl0J3MgYWxsIGFib3V0IG1ha2luZyB0aGUgdXNlciBmZWVsIHNhZmVyIGtub3dpbmdcbnRoYXQgdGhlaXIgY2FsY3VsYXRpb25zIHRha2UgdGltZSBhbmQgZWZmb3J0LlxuKi9cbmxldCB0aW1lcjogbnVtYmVyIHwgbnVsbCA9IENBTENVTEFUSU9OX0RFTEFZO1xubGV0IHRydWVDYWxjdWxhdGlvbjogWyBzdHJpbmcsIHN0cmluZyBdID0gWyBFTVBUWV9DQUxDVUxBVElPTiwgRU1QVFlfQ0FMQ1VMQVRJT04gXTtcbnNldEludGVydmFsKCgpID0+IHtcblx0aWYgKHRpbWVyICE9IG51bGwgJiYgdGltZXIgPD0gMSkge1xuXHRcdGlmICh0cnVlQ2FsY3VsYXRpb25bMF0ubGVuZ3RoID09IDApIHtcblx0XHRcdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3V0cHV0JykhLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50KS5pbm5lclRleHQgPSBcIlwiO1xuXHRcdFx0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvdXRwdXQnKSEuY2hpbGRyZW5bMV0gYXMgSFRNTERpdkVsZW1lbnQpLmlubmVyVGV4dCA9IFwiXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3V0cHV0JykhLmNoaWxkcmVuWzBdIGFzIEhUTUxEaXZFbGVtZW50KS5pbm5lckhUTUwgPSBcIjxhPlwiICsgdHJ1ZUNhbGN1bGF0aW9uWzBdLnJlcGxhY2UoLyAvLCBcIjwvYT4mbmJzcDsmbmJzcDs8YT5cIikgKyBcIjwvYT5cIjtcblx0XHRcdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjb3V0cHV0JykhLmNoaWxkcmVuWzFdIGFzIEhUTUxEaXZFbGVtZW50KS5pbm5lckhUTUwgPSBcIjxhPlwiICsgdHJ1ZUNhbGN1bGF0aW9uWzFdLnJlcGxhY2UoLyAvLCBcIjwvYT4mbmJzcDsmbmJzcDs8YT5cIikgKyBcIjwvYT5cIjtcblx0XHR9XG5cdFx0dGltZXIgPSBudWxsO1xuXHR9IGVsc2UgaWYgKHRpbWVyICE9IG51bGwpIHtcblx0XHR0aW1lciAqPSAwLjk7XG5cdH1cbn0sIDEwKVxuXG4vLyBHZXQgdGhlIG91dHB1dCB0ZXh0Ym94ZXNcblxuLy8gR2V0IHRoZSBpbnB1dCBlbGVtZW50c1xuY29uc3QgZWxlbWVudFBwbUFsOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmlucHV0W3B1cnBvc2U9XCJwcG1BbFwiXSA+IGlucHV0JykhO1xuY29uc3QgZWxlbWVudENtb2xBbEtnOiBIVE1MSW5wdXRFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmlucHV0W3B1cnBvc2U9XCJjbW9sQWxLZ1wiXSA+IGlucHV0JykhO1xuY29uc3QgZWxlbWVudEZhY3RvcjogSFRNTElucHV0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnB1dFtwdXJwb3NlPVwiZmFjdG9yXCJdID4gaW5wdXQnKSE7XG5cbi8vIFRoZSB0ZXh0IGZvciB0aGUgdW5pdHNcbmxldCB0ZXh0Rm9yUHBtQWwgPSBcIlwiO1xubGV0IHRleHRGb3JDbW9sQWxLZyA9IFwiXCI7XG5cbi8qKiBDYWxsZWQgd2hlbiBhbnkgc2xpZGVyIGlzIGNoYW5nZWQgKi9cbmZ1bmN0aW9uIHNsaWRlckNoYW5nZShlbDogSFRNTElucHV0RWxlbWVudCkge1xuXHQoZWwubmV4dEVsZW1lbnRTaWJsaW5nIGFzIEhUTUxEaXZFbGVtZW50KS5pbm5lclRleHQgPSBwYXJzZUZsb2F0KGVsLnZhbHVlKS50b0ZpeGVkKDIpO1xuXHRpbnB1dENoYW5nZShlbCk7XG59XG5cbi8vIEluaXRpYXRlIHRoZSBzbGlkZXJzXG5jb25zdCBzbGlkZXJzID0gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJyYW5nZVwiXScpXTtcbnNsaWRlcnMubWFwKGUgPT4gc2xpZGVyQ2hhbmdlKGUgYXMgSFRNTElucHV0RWxlbWVudCkpO1xuXG4vKiogQ2FsbGVkIHdoZW4gYW55IGlucHV0IGlzIGNoYW5nZWQgKGluY2x1ZGluZyBzbGlkZXJzKSAqL1xuZnVuY3Rpb24gaW5wdXRDaGFuZ2UoZWw6IEhUTUxJbnB1dEVsZW1lbnQpIHtcblx0Ly8gUmFuZG9taXplIHRoZSBkZWxheVxuXHRjb25zdCByYW5kRGVsYXkgPSBDQUxDVUxBVElPTl9ERUxBWSAqICgwLjkgKyBNYXRoLnJhbmRvbSgpICogMC4zKTtcblx0dGltZXIgPSB0aW1lciA9PSBudWxsID8gcmFuZERlbGF5IDogdGltZXIgKyByYW5kRGVsYXk7XG5cblx0Ly8gR2V0IHRoZSBlbGVtZW50IHRoYXQgd2UncmUgY2hhbmdpbmcgKGJ5IHB1cnBvc2UpXG5cdGNvbnN0IGVsUHVycG9zZSA9IGVsLnBhcmVudEVsZW1lbnQhLmF0dHJpYnV0ZXMuZ2V0TmFtZWRJdGVtKFwicHVycG9zZVwiKSEudmFsdWU7XG5cdFxuXHQvLyBHZXQgdGhlIEFsIHBwbVxuXHRsZXQgcHBtQWwgPSBlbGVtZW50UHBtQWwudmFsdWUgPT0gXCJcIiA/IC0xIDogcGFyc2VGbG9hdChlbGVtZW50UHBtQWwudmFsdWUpO1xuXHRcblx0Ly8gR2V0IHRoZSBBbC9rZyBjbW9sIG9mIHNvaWxcblx0bGV0IGNtb2xBbEtnID0gZWxlbWVudENtb2xBbEtnLnZhbHVlID09IFwiXCIgPyAtMSA6IHBhcnNlRmxvYXQoZWxlbWVudENtb2xBbEtnLnZhbHVlKTtcblxuXHQvLyBHZXQgdGhlIGZhY3RvclxuXHRsZXQgZmFjdG9yID0gZWxlbWVudEZhY3Rvci52YWx1ZSA9PSBcIlwiID8gLTEgOiBwYXJzZUZsb2F0KGVsZW1lbnRGYWN0b3IudmFsdWUpO1xuXG5cdC8vIFB1dCB0aGUgcHJvY2Vzc2luZyBkb3RzLi4uXG5cdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNvdXRwdXQnKSEuY2hpbGRyZW5bMF0uaW5uZXJIVE1MID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI291dHB1dCcpIS5jaGlsZHJlblsxXS5pbm5lckhUTUwgPSBcblx0XHRcIjxhPlwiICsgU3RyaW5nLmZyb21DaGFyQ29kZSg4MjI2KS5yZXBlYXQoMykgKyBcIjwvYT5cIjtcblxuXHRpZiAocHBtQWwgPT0gLTEgJiYgY21vbEFsS2cgPT0gLTEpIHtcblx0XHR0cnVlQ2FsY3VsYXRpb24gPSBbIEVNUFRZX0NBTENVTEFUSU9OLCBFTVBUWV9DQUxDVUxBVElPTiBdO1xuXHRcdHJldHVybjtcblx0fVxuXHRcblx0aWYgKGVsUHVycG9zZSA9PSBcInBwbUFsXCIpIHtcblx0XHRlbGVtZW50Q21vbEFsS2cudmFsdWUgPSBwcG1BbCA9PSAtMSA/IFwiXCIgOiBzdHJpbmdpZnkocHBtQWwgLyA5MCk7XG5cdFx0Y21vbEFsS2cgPSBwcG1BbCA9PSAtMSA/IC0xIDogcGFyc2VGbG9hdChlbGVtZW50Q21vbEFsS2cudmFsdWUpO1xuXHR9IGVsc2UgaWYgKGVsUHVycG9zZSA9PSBcImNtb2xBbEtnXCIpIHtcblx0XHRlbGVtZW50UHBtQWwudmFsdWUgPSBjbW9sQWxLZyA9PSAtMSA/IFwiXCIgOiBzdHJpbmdpZnkoY21vbEFsS2cgKiA5MCk7XG5cdFx0cHBtQWwgPSBjbW9sQWxLZyA9PSAtMSA/IC0xIDogcGFyc2VGbG9hdChlbGVtZW50UHBtQWwudmFsdWUpO1xuXHR9XG5cblx0aWYgKHBwbUFsID09IC0xICYmIGNtb2xBbEtnID09IC0xKSB7XG5cdFx0dHJ1ZUNhbGN1bGF0aW9uID0gWyBFTVBUWV9DQUxDVUxBVElPTiwgRU1QVFlfQ0FMQ1VMQVRJT04gXTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBDYUNPMyAodC9oYSkgPSBGYWN0b3IgeCBjbW9sIEFsL2tnIG9mIHNvaWxcblx0Ly8gKHBwbSBBbCkgb3IgKG1nL2tnIEFsKSAvIDkwID0gY21vbCBBbC9rZyBvZiBzb2lsXG5cblx0Y29uc3QgVEhBX1RPX0xCRlRTUV9DT05TVEFOVCA9IDIwLjQ4MTYwNjIxMjtcblx0Y29uc3QgdEhhID0gZmFjdG9yICogY21vbEFsS2c7XG5cdGNvbnN0IGxiRnRTcSA9IHRIYSAqIFRIQV9UT19MQkZUU1FfQ09OU1RBTlQ7XG5cblx0dHJ1ZUNhbGN1bGF0aW9uID0gW1xuXHRcdHN0cmluZ2lmeSggdEhhICkgKyBgICR7dGV4dEZvclBwbUFsfWAsXG5cdFx0c3RyaW5naWZ5KCBsYkZ0U3EgKSArIGAgJHt0ZXh0Rm9yQ21vbEFsS2d9XFx4YjJgLFxuXHRdO1xufVxuXG4vLyBHZXQgdGhlIFwiU3dpdGNoIExhbmd1YWdlXCIgYnV0b25cbmNvbnN0IGNoYW5nZUxhbmd1YWdlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzd2l0Y2gtYnV0dG9uXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG5jaGFuZ2VMYW5ndWFnZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0aWYgKGxhbmcgPT0gXCJlc1wiKSB7XG5cdFx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgXCI/bGFuZz1lblwiO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIFwiP2xhbmc9ZXNcIjtcblx0fVxufSk7XG5cbi8vIFRyYW5zbGF0aW9uIHRhcmdldHNcbmNvbnN0IHRyYW5zbGF0aW9uVGFyZ2V0czogQXJyYXk8KHQ6IHN0cmluZykgPT4gdm9pZD4gPSBbXG5cdHQgPT4gZG9jdW1lbnQudGl0bGUgPSB0LFxuXHR0ID0+IGNoYW5nZUxhbmd1YWdlQnV0dG9uLnZhbHVlID0gdCxcblx0dCA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGl0bGU+aDEnKSEuaW5uZXJIVE1MID0gdCxcblx0dCA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbcHVycG9zZT1cInBwbUFsXCJdPmgyJykhLmlubmVySFRNTCA9IHQsXG5cdHQgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW3B1cnBvc2U9XCJjbW9sQWxLZ1wiXT5oMicpIS5pbm5lckhUTUwgPSB0LFxuXHR0ID0+IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1twdXJwb3NlPVwiZmFjdG9yXCJdPmgyJykhLmlubmVySFRNTCA9IHQsXG5cdHQgPT4gdGV4dEZvclBwbUFsID0gdCxcblx0dCA9PiB0ZXh0Rm9yQ21vbEFsS2cgPSB0LFxuXTtcblxuLy8gVHJhbnNsYXRlICh3aGVuIFVSTCBwb2ludHMgdG8gdHJhbnNsYXRlZCB2ZXJzaW9uKVxuY29uc3Qgc2VhcmNoUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbmxldCBsYW5nID0gKHNlYXJjaFBhcmFtcy5nZXQoXCJsYW5nXCIpID8/IFwiZW5cIikudG9Mb3dlckNhc2UoKTtcbmlmICghKGxhbmcgaW4gdHJhbnNsYXRpb25zKSkgeyBsYW5nID0gXCJlblwiOyB9XG5cbi8vIFRyYW5zbGF0ZSB0byB0aGUgbGFuZ3VhZ2UhXG5jb25zdCB0ID0gdHJhbnNsYXRpb25zW2xhbmddO1xuZm9yIChsZXQgaSA9IDA7IGkgPCB0Lmxlbmd0aDsgaSsrKSB7XG5cdHRyYW5zbGF0aW9uVGFyZ2V0c1tpXSh0W2ldKTtcbn1cbiJdLCJuYW1lcyI6WyJNQVhfUFJFQ0lTSU9OX0RJR0lUUyIsIkVNUFRZX0NBTENVTEFUSU9OIiwic3RyaW5naWZ5IiwibiIsImZpeGVkIiwidG9GaXhlZCIsInJlcGxhY2UiLCJub3JtYWwiLCJ0b1N0cmluZyIsImxlbmd0aCIsIkNBTENVTEFUSU9OX0RFTEFZIiwidGltZXIiLCJ0cnVlQ2FsY3VsYXRpb24iLCJzZXRJbnRlcnZhbCIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNoaWxkcmVuIiwiaW5uZXJUZXh0IiwiaW5uZXJIVE1MIiwiZWxlbWVudFBwbUFsIiwiZWxlbWVudENtb2xBbEtnIiwiZWxlbWVudEZhY3RvciIsInRleHRGb3JQcG1BbCIsInRleHRGb3JDbW9sQWxLZyIsInNsaWRlckNoYW5nZSIsImVsIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwicGFyc2VGbG9hdCIsInZhbHVlIiwiaW5wdXRDaGFuZ2UiLCJzbGlkZXJzIiwicXVlcnlTZWxlY3RvckFsbCIsIm1hcCIsImUiLCJyYW5kRGVsYXkiLCJNYXRoIiwicmFuZG9tIiwiZWxQdXJwb3NlIiwicGFyZW50RWxlbWVudCIsImF0dHJpYnV0ZXMiLCJnZXROYW1lZEl0ZW0iLCJwcG1BbCIsImNtb2xBbEtnIiwiZmFjdG9yIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwicmVwZWF0IiwiVEhBX1RPX0xCRlRTUV9DT05TVEFOVCIsInRIYSIsImxiRnRTcSIsImNoYW5nZUxhbmd1YWdlQnV0dG9uIiwiYWRkRXZlbnRMaXN0ZW5lciIsImxhbmciLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJvcmlnaW4iLCJwYXRobmFtZSIsInRyYW5zbGF0aW9uVGFyZ2V0cyIsInQiLCJ0aXRsZSIsInNlYXJjaFBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsImdldCIsInRvTG93ZXJDYXNlIiwidHJhbnNsYXRpb25zIiwiaSJdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTUEsb0JBQW9CLEdBQUcsQ0FBQyxBQUFDO0FBRy9CLE1BQU1DLGlCQUFpQixHQUFHLEVBQUUsQUFBQztBQUc3QixTQUFTQyxTQUFTLENBQUNDLENBQVMsRUFBVTtJQUNyQyxNQUFNQyxLQUFLLEdBQUdELENBQUMsQ0FBQ0UsT0FBTyxDQUFDTCxvQkFBb0IsQ0FBQyxDQUFDTSxPQUFPLE9BQU8sR0FBRyxDQUFDLEFBQUM7SUFDakUs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