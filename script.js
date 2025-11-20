window.addEventListener('contextmenu', e => e.preventDefault(), false);

let currentLanguage = null;
let currentDate = null;
let passages = [];

// STEP 1: Select Language
document.getElementById("language").addEventListener("change", function () {
  currentLanguage = this.value;
  document.getElementById("datePicker").disabled = false;

  if (currentLanguage === "3") {
    document.getElementById("message").classList.add("hindi-text");
    document.getElementById("text").classList.add("hindi-typing");
  } else {
    document.getElementById("message").classList.remove("hindi-text");
    document.getElementById("text").classList.remove("hindi-typing");
  }
});

// STEP 2: Select Date → Fetch Data
document.getElementById("datePicker").addEventListener("change", async function () {
  currentDate = this.value;
  const dataSelect = document.getElementById("data");
  dataSelect.innerHTML = `<option disabled selected>Loading passages...</option>`;
  dataSelect.disabled = true;

  if (!currentLanguage) {
    alert("Please select a language first!");
    return;
  }

  try {
    const apiUrl = `https://typingdata.testingsd9.workers.dev?language=${currentLanguage}&created_at=${currentDate}`;
    const res = await fetch(apiUrl);
    passages = await res.json();

    if (!Array.isArray(passages) || passages.length === 0) {
      dataSelect.innerHTML = `<option disabled selected>No passages found for this date.</option>`;
      return;
    }

    dataSelect.innerHTML = `<option disabled selected>Select Paragraph</option>`;
    passages.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.passage_text;

      let color = "black";
      if (item.difficulty === "H") color = "red";
      if (item.difficulty === "M") color = "blue";
      if (item.difficulty === "E") color = "green";

      opt.textContent = `(${item.difficulty}) ${item.title}`;
      opt.style.color = color;
      dataSelect.appendChild(opt);
    });

    dataSelect.disabled = false;
  } catch (err) {
    console.error(err);
    alert("Error fetching data from API!");
  }
});

function convertToStraightQuotes(str) {
  return str
    .replace(/[“”]/g, '"')  // double curly → straight
    .replace(/[‘’]/g, "'"); // single curly → straight
}

function fixNukta(str) {
  return str
    .replace(/ड़/g, "ड़")
    .replace(/ढ़/g, "ढ़")
    .replace(/ड़्/g, "ड़")
    .replace(/ढ़्/g, "ढ़");
}



// STEP 3: Load Passage Text
document.getElementById("data").addEventListener("change", function () {
  const passageTxt = this.value;
  const nuktaText = convertToStraightQuotes(passageTxt)
  const passage = fixNukta(nuktaText)
  document.getElementById("message").innerHTML = passage;
});

// Prevent Ctrl+C/V/U
document.onkeydown = function (e) {
  if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 117)) {
    alert('Not allowed');
    return false;
  } else {
    return true;
  }
};

// TIMER AND MAIN TEST LOGIC
var len = 0;
var flag = true;
var tm = 900;

function timerWatch() {
  var mm = parseInt(tm / 60);
  var hh = parseInt(mm / 60);
  mm = mm % 60;
  if (hh <= 9) hh = "0" + hh;
  if (mm <= 9) mm = "0" + mm;
  var ss = tm % 60;
  if (ss <= 9) ss = "0" + ss;
  tm = tm - 1;
  if (tm <= 0) {
    document.getElementById("start-btn").click();
  } else {
    document.getElementById("timer").innerHTML = "Time Left " + hh + ":" + mm + ":" + ss;
  }
  setTimeout("timerWatch()", 1000);
}

var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function heightlite() {
  // helper: escape HTML so Devanagari/punctuation are safe to inject
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }

  // get passage text from the select (value contains passage_text)
  var paraRaw = document.getElementById("data").value || "";
  // remove zero-width joiner/ non-joiner that may confuse splitting
  var paraClean = paraRaw.replace(/\u200C|\u200D/g, "").trim();

  if (!paraClean) {
    document.getElementById("message").innerHTML = "";
    return;
  }

  // split on any unicode whitespace to be robust
  var pass = paraClean.split(/\s+/u);
  var len = pass.length;

  // get typed text and normalize similarly
  var typRaw = document.getElementById("text").value || "";
  var typClean = typRaw.replace(/\u200C|\u200D/g, "").trim();
  var typPara = typClean ? typClean.split(/\s+/u).filter(Boolean) : [];
  var typLen = typPara.length - 1;

  // build output with the current word wrapped in a blue span
  var out = "";
  for (var i = 0; i < len; i++) {
    var wordEscaped = escapeHtml(pass[i]);
    if (i === typLen && typLen >= 0) {
      out += " " + "<span style='color:#0000EE'>" + wordEscaped + "</span>";
    } else {
      out += " " + wordEscaped;
    }
  }

  document.getElementById("message").innerHTML = out.trim();
}


$(document).ready(function () {
  let button = document.getElementById("start-btn");
  let text = document.getElementById("text");
  let message = document.getElementById("message");
  let result = document.getElementById("result");
  let startTime, endTime;

  text.disabled = true;

  const start = () => {
    let date = new Date();
    startTime = date.getTime();
  }

  const end = () => {
    let date = new Date();
    let endTime = date.getTime();
    let timeTaken = (endTime - startTime - 800) / 1000;
    let mm = parseInt(timeTaken / 60);
    let hh = parseInt(mm / 60);
    mm = mm % 60;
    if (hh <= 9) hh = "0" + hh;
    if (mm <= 9) mm = "0" + mm;
    let ss = parseInt(timeTaken % 60);
    if (ss <= 9) ss = "0" + ss;

    let tkeyStroks = message.innerText.length;
    let totalWords = (message.innerText.split(" ")).length;
    let wordsCount = (text.value.trim()).length > 0 ? (text.value.split(" ")).length : 0;
    let gspeed = Math.round(((60 / timeTaken) * wordsCount));
    let correctWords = accuracy(text.value, message.innerText);
    let wrongWords = wordsCount - correctWords;
    let nspeed = Math.round(((60 / timeTaken) * correctWords));
    let ukeyStroks = text.value.length;
    let message1 = text.value;
    let e = document.getElementById("data");
    let paraNo = e.options[e.selectedIndex].text;

    $("#main1").html(`
      <h3>Test Submitted Successfully. Here Are Your Details:</h3><br>
      <div align="justify" id="dispPara" style="width:95%; line-height:25px; font-size:16px; padding:8px; border:1px solid gray; margin:8px; cursor:no-drop;">${message1}</div><br>
      <table border="1" style="border:3px solid black; width:60%; font-size:25px; background-color:#e8e4e4;">
      <tr><td>Test Name</td><td>${paraNo}</td></tr>
      <tr><td>Test Language</td><td>${currentLanguage === "3" ? "Hindi" : "English"}</td></tr>
      <tr><td>Gross Speed</td><td>${gspeed} WPM</td></tr>
      <tr><td>Net Speed</td><td>${nspeed} WPM</td></tr>
      <tr><td>Accuracy</td><td>${Math.round((correctWords / wordsCount) * 100)}%</td></tr>
      <tr><td>Time Taken</td><td>${mm}:${ss}</td></tr>
      <tr><td>Total Words</td><td>${totalWords}</td></tr>
      <tr><td>Words Typed</td><td>${wordsCount}</td></tr>
      <tr><td>Correct Words</td><td>${correctWords}</td></tr>
      <tr><td>Wrong Words</td><td>${wrongWords}</td></tr>
      <tr><td>Total KeyStrokes</td><td>${tkeyStroks}</td></tr>
      <tr><td>Typed KeyStrokes</td><td>${ukeyStroks}</td></tr>
      </table><br><br>
      <a href="index.html">Press F5 to refresh or click here to start again.</a>
    `);
    $("#text").prop("disabled", true);
  }

  const accuracy = (str, message) => {
    message = (message.split(" "));
    let count = 0;
    str.trim().split(" ").forEach(function (item) {
      if (message.indexOf(item) > -1)
        count++;
    });
    return count;
  }

  button.addEventListener('click', function () {
    if (this.innerText === "Start") {
      // hide selectors when test starts
      $("#optionsBar select").prop("disabled", true);
      $("#optionsBar").fadeOut(400);
      $("#message, #text").css({ width: "100%" });

      $("textarea").val("");
      this.innerText = "Submit";
      $("#result").fadeOut();
      $("#text").prop("disabled", false);
      start();
      timerWatch();
      openFullscreen();
    } else {
      $("#result").fadeIn();
      $(this).html("Start");
      end();
    }
  });
});
