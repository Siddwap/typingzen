window.addEventListener('contextmenu', e => e.preventDefault(), false);

document.onkeydown = function(e) {
    if (e.ctrlKey && (e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 85 || e.keyCode === 117)) {
        alert('Not allowed');
        return false;
    }
    return true;
};

//////////////////////////////////////////////////////////////////////////////
// GLOBAL VARIABLES
let currentLanguage = null;
let paragraphsData = [];

//////////////////////////////////////////////////////////////////////////////

// Load paragraph data dynamically based on language
async function loadParagraphs(language) {
    const apiUrl = language === "hindi" 
        ? "https://raw.githubusercontent.com/Siddwap/Typingzen/refs/heads/main/hindidata.txt"
        : "https://raw.githubusercontent.com/Siddwap/Typingzen/refs/heads/main/englishdata.txt";

    try {
        const res = await fetch(apiUrl);
        paragraphsData = await res.json();

        const select = document.getElementById("data");
        select.innerHTML = `<option disabled selected>Select Paragraph</option>`;
        paragraphsData.forEach((item, i) => {
            const opt = document.createElement("option");
            opt.value = item.data;
            opt.textContent = item.name;
            select.appendChild(opt);
        });
        select.disabled = false;

        if (language === "hindi") {
            document.getElementById("message").classList.add("hindi-text");
            document.getElementById("text").classList.add("hindi-typing");
        } else {
            document.getElementById("message").classList.remove("hindi-text");
            document.getElementById("text").classList.remove("hindi-typing");
        }
    } catch (err) {
        alert("Error loading data from API!");
        console.error(err);
    }
}

//////////////////////////////////////////////////////////////////////////////

// When user selects a paragraph
function getData() {
    const para = document.getElementById("data").value;
    document.getElementById("message").innerHTML = para;
    document.getElementById("data").style.display = "none";
}

//////////////////////////////////////////////////////////////////////////////
var len = 0;
var tm = 900;

function timerWatch() {
    let mm = parseInt(tm / 60);
    let hh = parseInt(mm / 60);
    mm = mm % 60;
    if (hh <= 9) hh = "0" + hh;
    if (mm <= 9) mm = "0" + mm;
    let ss = tm % 60;
    if (ss <= 9) ss = "0" + ss;
    tm = tm - 1;
    if (tm <= 0) {
        document.getElementById("start-btn").click();
    } else {
        document.getElementById("timer").innerHTML = "Time Left " + hh + ":" + mm + ":" + ss;
    }
    setTimeout("timerWatch()", 1000);
}

////////////////////////////////////////////////////////////////////

function openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

////////////////////////////////////////////////////////////////////

function heightlite() {
    const para = document.getElementById("data").value;
    const pass = para.split(" ");
    const len = pass.length;
    let msg = "";
    const typ = document.getElementById("text").value;
    const typPara = typ.split(" ").filter(w => w);
    const typLen = typPara.length - 1;
    if (typLen >= 0) msg = "<font color='#0000EE'>";
    for (let w = 0; w < len; w++) {
        msg += " " + pass[w];
        if (typLen === w) msg += "</font>";
    }
    document.getElementById("message").innerHTML = msg;
}

////////////////////////////////////////////////////////////////////

$(document).ready(function() {
    let button = document.getElementById("start-btn");
    let text = document.getElementById("text");
    let message = document.getElementById("message");
    let startTime;

    text.disabled = true;

    // Handle language selection
    $("#language").on("change", function() {
        currentLanguage = this.value;
        loadParagraphs(currentLanguage);
    });

    const start = () => { startTime = new Date().getTime(); };

    const end = () => {
        let endTime = new Date().getTime();
        let timeTaken = (endTime - startTime - 800) / 1000;
        let mm = parseInt(timeTaken / 60);
        let hh = parseInt(mm / 60);
        mm = mm % 60;
        if (hh <= 9) hh = "0" + hh;
        if (mm <= 9) mm = "0" + mm;
        let ss = parseInt(timeTaken % 60);
        if (ss <= 9) ss = "0" + ss;

        let tkeyStroks = message.innerText.length;
        let totalWords = message.innerText.split(" ").length;
        let wordsCount = text.value.trim().length > 0 ? text.value.split(" ").length : 0;

        let gspeed = Math.round(((60 / timeTaken) * wordsCount));
        let correctWords = accuracy(text.value, message.innerText);
        let wrongWords = wordsCount - correctWords;
        let nspeed = Math.round(((60 / timeTaken) * correctWords));
        let ukeyStroks = text.value.length;
        let paraNo = $("#data option:selected").text();

        let langLabel = currentLanguage === "hindi" ? "Hindi" : "English";

        $("#main1").html(`
            <h3>Test Submitted Successfully. Here Are Your Details:</h3><br>
            <div align="justify" id="dispPara" style=" width:95%; line-height:25px; font-size:16px; padding: 8px; border:1px solid gray; margin: 8px; cursor: no-drop;">
                ${text.value}</div>
            <br>
            <table border="1" style="border:3px solid black; width:60%; font-size:25px; background-color:#e8e4e4;">
                <tr><td>Test Name</td><td>${paraNo}</td></tr>
                <tr><td>Test Language</td><td>${langLabel}</td></tr>
                <tr><td>Gross Speed</td><td>${gspeed} WPM</td></tr>
                <tr><td>Net Speed</td><td>${nspeed} WPM</td></tr>
                <tr><td>Accuracy</td><td>${Math.round((correctWords / wordsCount) * 100)}%</td></tr>
                <tr><td>Time Taken By You</td><td>${mm}:${ss}</td></tr>
                <tr><td>Total Words</td><td>${totalWords}</td></tr>
                <tr><td>Words Typed</td><td>${wordsCount}</td></tr>
                <tr><td>Correct Words</td><td>${correctWords}</td></tr>
                <tr><td>Wrong Words</td><td>${wrongWords}</td></tr>
                <tr><td>Total KeyStrokes</td><td>${tkeyStroks}</td></tr>
                <tr><td>Typed KeyStrokes</td><td>${ukeyStroks}</td></tr>
            </table>
            <br><br>
            <a href="index.html">Press F5 To Refresh The Page Or Click Here To Go Back</a>
        `);
        $("#text").prop("disabled", true);
    };

    const accuracy = (str, message) => {
        let msgArr = message.split(" ");
        let count = 0;
        str.trim().split(" ").forEach(item => {
            if (msgArr.indexOf(item) > -1) count++;
        });
        return count;
    };

    button.addEventListener('click', function() {
        if (this.innerText === "Start") {
            if (!currentLanguage) {
                alert("Please select a language first!");
                return;
            }
            if ($("#data").val() === null) {
                alert("Please select a paragraph!");
                return;
            }
            $("textarea").val("");
            this.innerText = "Submit";
            $("#result").fadeOut();
            $("#text").prop("disabled", false);
            start();
            timerWatch();
            openFullscreen();
            getData();
        } else {
            $("#result").fadeIn();
            $(this).html("Start");
            end();
        }
    });
});
