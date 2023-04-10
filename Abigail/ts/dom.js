"use strict";
const choicesStrings = [
    "Waiting for initial consideration",
    "Waiting for reconsideration",
    "Waiting for appeal (Administrative law judge)",
    "Waiting for appeal (Appeals council)"
];
const questions = [];
class Question {
    constructor(options) {
        this.afterOptions = [];
        this.checked = false;
        this.options = options;
        this.id = questions.length;
        questions.push(this);
        this.render();
    }
    /// Adds a question to go after this one.
    /// Meant to be called in a chain.
    after(options) {
        this.afterOptions.push(options);
        return this;
    }
    /// Renders the current question as an element.
    render() {
        var _a;
        const holder = document.querySelector("#question-holder");
        this.el = document.createElement("div");
        this.el.className = "card";
        if (this.options.choices) {
            this.el.innerHTML = `
                ${this.options.q}<br>
                <select name="mult" id="multchoie">
                    <option value='none'>Pick one</option>
                    ${this.options.choices.map(c => "<option value='" + c + "'>" + c + "</option>").join("")}
                </select>
            `;
        }
        else {
            this.el.innerHTML = `
                <label class="cb-container">${this.options.q}
                    <input type="checkbox">
                    <span class="cb-checkmark"></span>
                </label>
                <red>${(_a = this.options.notChecked) !== null && _a !== void 0 ? _a : ""}</red>
            `;
        }
        this.el.style.transform = "scaleY(0)";
        this.el.style.transition = ".2s transform";
        setTimeout(() => {
            this.el.style.transform = "scaleY(1.0)";
        }, 200);
        this.el.onpointerup = () => setTimeout(() => this.changed(), 50);
        if (this.options) {
            this.el.children[1].onchange = () => setTimeout(() => this.changed(), 50);
        }
        holder.appendChild(this.el);
    }
    /// Runs whenever a change happens
    /// to the question's inputs.
    changed() {
        if (!this.options.choices) {
            this.checked = this.el.children[0].children[0].checked;
            if (this == questions[0] && !this.checked)
                return;
            try {
                calculatePercentage();
            }
            catch (e) {
            }
        }
        else {
            const picked = this.el.children[1].value;
            if (picked == "none")
                return;
        }
        if (this.afterOptions.length != 0) {
            const q = new Question(this.afterOptions.shift());
            for (let i = 0; i < this.afterOptions.length; i++)
                q.after(this.afterOptions[i]);
            this.afterOptions = [];
            return;
        }
        if (this.options.spawnsConditions) {
            for (let i = 0; i < conditions.length; i++) {
                setTimeout(() => {
                    new Question({
                        q: `Do you have ${conditions[i]}?`,
                        isCondition: true
                    });
                }, i * 100);
            }
            this.options.spawnsConditions = false;
        }
    }
    /// Runs whenever there's a change, but is meant
    /// to be called by the question's parent.
    update(viable) {
        if (viable) {
            this.el.style.opacity = "1";
            this.el.style.filter = "";
        }
        else {
            this.el.style.opacity = "0.4";
            this.el.style.filter = "saturate(0.4)";
            return;
        }
        questions[this.id + 1].update(viable);
    }
}
function calculatePercentage() {
    let stage = choicesStrings.indexOf(questions[1].el.children[1].value);
    let areChecked = [];
    for (let q = 3; q < questions.length; q++) {
        if (questions[q].checked)
            areChecked.push(q - 3);
    }
    let p = getPercent(areChecked);
    p *= stageChances[stage];
    p *= questions[2].el.children[1].value == "Male" ? 0.54 : 0.68;
    if (areChecked.length == 0)
        p = 1;
    document.querySelector("#percent").innerText = (Math.round((1 - p) * 1000) * 0.1 + "").slice(0, 4) + "%";
}
function getPercent(checked) {
    console.log(checked);
    if (checked.length == 0)
        return 1;
    let t = 0;
    for (let i = 0; i < checked.length; i++) {
        t += conditionPercentages[checked[i]];
    }
    return t / checked.length;
}
window.addEventListener("load", () => {
    const q = new Question({
        q: "Did you meet the technical requirements?",
        notChecked: "You need to meet the technical requirements to be considered."
    }).after({
        q: "What stage are you on?",
        choices: choicesStrings
    }).after({
        q: "What's your sex?",
        choices: [
            "Male",
            "Female"
        ],
        spawnsConditions: true
    });
});