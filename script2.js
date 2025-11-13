// script2.js - updated to fetch from live API using language + date
const apiBase = "https://typingdata.testingsd9.workers.dev";

let apiData = [];
let currentLang = "";
let langCode = null;

let start = document.querySelector("#start");
let submit = document.querySelector("#submit");
let minute = document.querySelector("#minute");
let second = document.querySelector("#second");
let progress = document.querySelector("#progress");

let givenTime = 900;
let totalTime = givenTime;
let takenTime = 0;
let gSpeed = 0;
let nSpeed = 0;
let accuracy = 0;
let rightWord = 0;
let wrongWord = 0;
let totalWord = 0;
let toKey = 0;

const langSelect = document.querySelector("#lang");
const datePicker = document.querySelector("#datePicker");
const dataSelect = document.querySelector("#data");
const paraBox = document.querySelector("#para");
const textarea = document.querySelector("#textarea");

// --- Language select ---
langSelect.addEventListener("change", function () {
  currentLang = this.value;
  langCode = currentLang === "hindi" ? 3 : 1;
  apiData = [];
  dataSelect.innerHTML = '<option value="" disabled selected>Select Paragraph</option>';
  paraBox.innerHTML = "";
  textarea.value = "";
  textarea.disabled = true;
  textarea.style.cursor = "not-allowed";
  paraBox.classList.remove("hindi-area");
  textarea.classList.remove("hindi-area");

  if (currentLang === "hindi") {
    paraBox.classList.add("hindi-area");
    textarea.classList.add("hindi-area");
  }
});

// --- When user chooses date, fetch API based on language + date ---
datePicker.addEventListener("change", async function () {
  const dateVal = this.value;
  if (!currentLang || !langCode) {
    alert("Please select a language first.");
    datePicker.value = "";
    return;
  }
  if (!dateVal) return;

  dataSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';

  try {
    const url = `${apiBase}?language=${langCode}&created_at=${dateVal}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Network error: " + resp.status);
    const json = await resp.json();
    apiData = Array.isArray(json) ? json : [];

    dataSelect.innerHTML = '<option value="" disabled selected>Select Paragraph</option>';

    apiData.forEach((item, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      let diffClass = "";
      if (item.difficulty === "H") diffClass = "diff-H";
      else if (item.difficulty === "M") diffClass = "diff-M";
      else diffClass = "diff-E";
      opt.innerHTML = `<span class="${diffClass}">${item.difficulty}</span> ${item.title}`;
      dataSelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load data. Please try again later.");
  }
});

// --- Load chosen paragraph ---
function getData() {
  const pn = dataSelect.value;
  if (pn === "" || pn == null) {
    alert("Please select a paragraph.");
    return;
  }
  const idx = parseInt(pn, 10);
  const paraText = apiData[idx].passage_text || "";
  toKey = paraText.split("").length;
  let arr = paraText.split(" ");
  totalWord = arr.length;
  arr = arr.map((val) => `<span class="hilight-word">${val}</span>`);
  paraBox.innerHTML = arr.join(" ");
  const first = paraBox.querySelector(".hilight-word");
  if (first) first.classList.add("bg-warning", "scrl");
}
function getDataWrapper() { getData(); }

// --- Backspace behavior ---
function oneWordBackspace() {
  textarea.addEventListener("keydown", (e) => {
    preventOneWordBackspace(e);
  });
}
function backspaceDisable() {
  textarea.addEventListener("keydown", (e) => {
    if (e.keyCode == 8 || e.keyCode == 46) e.preventDefault();
  });
}

// --- Typing logic ---
textarea.addEventListener("keypress", (e) => {
  if (e.keyCode == 32) {
    let hilight = document.querySelectorAll(".hilight-word");
    let para = document.querySelector("#para").innerText;
    let paraArr = para.split(" ");
    let text = document.querySelector("#textarea").value;
    let textArr = text.split(" ");
    let temp1 = [];
    let temp2 = [];
    for (let i = 0; i < textArr.length; i++) {
      if (paraArr[i] == textArr[i]) {
        temp1.push(textArr[i]);
        rightWord = temp1.length;
        if (hilight[i]) hilight[i].classList.add("text-success");
        if (hilight[i + 1]) hilight[i + 1].classList.add("bg-warning", "scrl");
        if (hilight[i]) hilight[i].classList.remove("bg-warning", "scrl");
      } else {
        temp2.push(textArr[i]);
        wrongWord = temp2.length;
        if (hilight[i]) hilight[i].classList.add("text-danger");
        if (hilight[i + 1]) hilight[i + 1].classList.add("bg-warning", "scrl");
        if (hilight[i]) hilight[i].classList.remove("bg-warning", "scrl");
      }
    }
    let totleEnter = textArr.length;
    let p = parseInt((totleEnter * 100) / totalWord);
    document.querySelector("#progress").style.width = p + "%";
    document.querySelector("#progress").innerText = p + "%";
    if (totleEnter == totalWord - 1) submit.click();
    const scrEl = document.querySelector(".scrl");
    if (scrEl) {
      let scrTp = scrEl.offsetTop - document.querySelector("#para").offsetTop;
      document.querySelector("#para").scroll(0, scrTp);
    }
  }
});

// --- Timer ---
function timeCheck() {
  let t = setInterval(() => {
    let min = parseInt(givenTime / 60);
    let sec = givenTime % 60;
    if (sec < 10) sec = "0" + sec;
    if (min < 10) min = "0" + min;
    document.querySelector("#minute").innerText = min;
    document.querySelector("#second").innerText = sec;
    givenTime--;
    takenTime++;
    if (givenTime == 0) {
      clearInterval(t);
      submit.click();
    }
    submit.addEventListener("click", () => clearInterval(t));
    document.querySelector("#textarea").addEventListener("blur", () => clearInterval(t));
  }, 1000);
}
document.querySelector("#textarea").addEventListener("focus", () => timeCheck());

// --- Speed calculation ---
function speedCal() {
  gSpeed = ((rightWord + wrongWord) / takenTime) * 60;
  nSpeed = ((rightWord - wrongWord) / takenTime) * 60;
  accuracy = ((rightWord - wrongWord) * 100) / rightWord;
  if (gSpeed < 0) gSpeed = 0;
  if (nSpeed < 0) nSpeed = 0;
  if (accuracy < 0) accuracy = 0;
}

// --- Start button ---
start.addEventListener("click", () => {
  if (!currentLang) return alert("Please choose a language first.");
  if (!dataSelect.value) return alert("Please select a paragraph.");
  getData();
  textarea.disabled = false;
  textarea.style.cursor = "auto";
  submit.classList.remove("disabled");
  start.classList.add("disabled");
  dataSelect.classList.add("d-none");
  document.querySelector("#backSpaceBox").classList.add("d-none");
  if (currentLang === "hindi") {
    paraBox.classList.add("hindi-area");
    textarea.classList.add("hindi-area");
  } else {
    paraBox.classList.remove("hindi-area");
    textarea.classList.remove("hindi-area");
  }
  givenTime = totalTime;
  takenTime = 0;
  rightWord = 0;
  wrongWord = 0;
  progress.style.width = "0%";
  progress.innerText = "0%";
});

// --- Submit button ---
submit.addEventListener("click", () => {
  speedCal();
  let takenMin = parseInt(takenTime / 60);
  let takenSec = takenTime % 60;
  if (takenSec < 10) takenSec = "0" + takenSec;
  if (takenMin < 10) takenMin = "0" + takenMin;
  document.querySelector("#gSpeed").innerText = parseInt(gSpeed);
  document.querySelector("#nSpeed").innerText = parseInt(nSpeed);
  document.querySelector("#acu").innerText = parseInt(accuracy);
  document.querySelector("#toWord").innerText = totalWord;
  document.querySelector("#wWord").innerText = wrongWord;
  document.querySelector("#toKey").innerText = toKey;
  document.querySelector("#tyWord").innerText = rightWord + wrongWord;
  document.querySelector("#toTime").innerText = totalTime / 60;
  document.querySelector("#taTime").innerText = takenMin + ":" + takenSec;
  document.querySelector("#result").classList.remove("d-none");
  document.querySelector("#main").classList.add("d-none");
  document.querySelector("#start").classList.add("d-none");
});

// --- Disable Copy / Paste ---
document.onkeydown = function (e) {
  if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 117)) {
    alert("not allowed");
    return false;
  } else return true;
};
window.addEventListener("contextmenu", (e) => e.preventDefault(), false);

// --- prevent one word backspace ---
function preventOneWordBackspace(e) {
  var text = document.querySelector("textarea").value;
  var evt = e || window.event;
  if (evt) {
    var keyCode = evt.charCode || evt.keyCode;
    if ((keyCode === 8 || keyCode === 46) && text[text.length - 1] == " ") {
      evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
    }
  }
}
