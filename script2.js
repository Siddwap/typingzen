// script2.js - updated to load paragraphs from language-specific APIs
// Keeps your original UI/IDs intact and only injects language selection + Hindi font class handling

const englishUrl = "https://raw.githubusercontent.com/Siddwap/Typing/refs/heads/main/englishdata.txt";
const hindiUrl = "https://raw.githubusercontent.com/Siddwap/Typing/refs/heads/main/hindidata.txt";

// state
let apiData = []; // array of {name, data}
let currentLang = ""; // "english" or "hindi"

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

// elements
const langSelect = document.querySelector("#lang");
const dataSelect = document.querySelector("#data");
const paraBox = document.querySelector("#para");
const textarea = document.querySelector("#textarea");

// --- Language change: load appropriate API and populate paragraphs ---
langSelect.addEventListener("change", async function () {
  const lang = this.value;
  currentLang = lang;
  // clear previous
  apiData = [];
  dataSelect.innerHTML = '<option value="" disabled selected>Select Paragraph</option>';
  paraBox.innerHTML = "";
  textarea.value = "";
  textarea.disabled = true;
  textarea.style.cursor = "not-allowed";
  // remove hindi-area class by default
  paraBox.classList.remove("hindi-area");
  textarea.classList.remove("hindi-area");

  try {
    const url = lang === "hindi" ? hindiUrl : englishUrl;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Network response not ok: " + resp.status);
    const json = await resp.json();

    // store
    apiData = Array.isArray(json) ? json : [];

    // populate select with names (name shown, index as value)
    apiData.forEach((item, idx) => {
      const opt = document.createElement("option");
      opt.value = idx; // index in apiData
      opt.textContent = item.name || `Para ${idx + 1}`;
      dataSelect.appendChild(opt);
    });

    // If hindi selected, add hindi-area class to selects? (we only style para and textarea)
    if (lang === "hindi") {
      // hint: actual Devanagari input depends on user's OS/keyboard (Inscript) — we apply font styling
      paraBox.classList.add("hindi-area");
      textarea.classList.add("hindi-area");
    }
  } catch (err) {
    console.error("Failed to load data for", lang, err);
    alert("Unable to load paragraphs for the selected language. Please try again later.");
  }
});

// --- Load the chosen paragraph into the para box ---
function getData() {
  const pn = dataSelect.value;
  if (pn === "" || pn == null) {
    alert("Please select a paragraph.");
    return;
  }
  const idx = parseInt(pn, 10);
  const paraText = apiData[idx].data || "";
  toKey = paraText.split("").length;
  let arr = paraText.split(" ");
  totalWord = arr.length;

  // create spans similar to original behavior
  arr = arr.map((val) => {
    return `<span class="hilight-word">` + val + `</span>`;
  });
  paraBox.innerHTML = arr.join(" ");

  // Put a highlight on the first word to guide user
  const first = paraBox.querySelector(".hilight-word");
  if (first) {
    first.classList.add("bg-warning", "scrl");
  }
}

// provide backward-compatibility function name used in original HTML
function getDataWrapper() {
  getData();
}

// --- Backspace behavior functions (same names as original) ---
function oneWordBackspace() {
  textarea.addEventListener("keydown", (e) => {
    preventOneWordBackspace(e);
  });
}

function backspaceDisable() {
  textarea.addEventListener("keydown", (e) => {
    if (e.keyCode == 8 || e.keyCode == 46) {
      e.preventDefault();
    }
  });
}

// --- Typing logic (space detection / marking words) ---
textarea.addEventListener("keypress", (e) => {
  // keyCode deprecated but kept for compatibility; use which/charCode if needed
  if (e.keyCode == 32) { // space pressed
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
        // mark correct and move highlight
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

    if (totleEnter == totalWord - 1) {
      submit.click();
    }

    // auto-scroll paragraph to keep current word in view
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
    submit.addEventListener("click", () => {
      clearInterval(t);
    });
    document.querySelector("#textarea").addEventListener("blur", () => {
      clearInterval(t);
    });
  }, 1000);
}

document.querySelector("#textarea").addEventListener("focus", () => {
  timeCheck();
});

// --- Speed calculation ---
function speedCal() {
  gSpeed = ((rightWord + wrongWord) / takenTime) * 60;
  nSpeed = ((rightWord - wrongWord) / takenTime) * 60;
  accuracy = ((rightWord - wrongWord) * 100) / rightWord;
  if (gSpeed < 0) gSpeed = 0;
  if (nSpeed < 0) nSpeed = 0;
  if (accuracy < 0) accuracy = 0;
}

// --- Start button behavior ---
start.addEventListener("click", () => {
  // ensure language chosen and paragraph chosen
  if (!currentLang) {
    alert("Please choose a language first.");
    return;
  }
  if (!dataSelect.value) {
    alert("Please select a paragraph.");
    return;
  }

  getData();

  textarea.disabled = false;
  textarea.style.cursor = "auto";
  submit.classList.remove("disabled");
  start.classList.add("disabled");
  dataSelect.classList.add("d-none");
  document.querySelector("#backSpaceBox").classList.add("d-none");

  // ensure Hindi font class is applied when Hindi selected
  if (currentLang === "hindi") {
    paraBox.classList.add("hindi-area");
    textarea.classList.add("hindi-area");
  } else {
    paraBox.classList.remove("hindi-area");
    textarea.classList.remove("hindi-area");
  }

  // reset counters in case of restart
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

// --- Disable Copy / Paste (same as original) ---
document.onkeydown = function (e) {
  if (
    e.ctrlKey &&
    (e.keyCode === 67 ||
      e.keyCode === 86 ||
      e.keyCode === 85 ||
      e.keyCode === 117)
  ) {
    alert("not allowed");
    return false;
  } else {
    return true;
  }
};

window.addEventListener(
  "contextmenu",
  function (e) {
    e.preventDefault();
  },
  false
);

// --- prevent one word backspace logic (same as original) ---
function preventOneWordBackspace(e) {
  var text = document.querySelector("textarea").value;
  var evt = e || window.event;
  if (evt) {
    var keyCode = evt.charCode || evt.keyCode;
    if ((keyCode === 8 || keyCode === 46) && text[text.length - 1] == " ") {
      if (evt.preventDefault) {
        evt.preventDefault();
      } else {
        evt.returnValue = false;
      }
    } else {
      // allow
    }
  }
}
