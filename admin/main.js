var videoTitle = document.getElementById("videoTitle");

var videos = [
    document.getElementById("video0"),
    document.getElementById("video1"),
];
var videoSources = [
    document.getElementById("videoSource0"),
    document.getElementById("videoSource1"),
];

var nextTop = document.getElementById("nextTop");
nextTop.onclick = function(){next();};
var nextBottom = document.getElementById("nextBottom");
nextBottom.onclick = function(){next();};

var prevTop = document.getElementById("prevTop");
prevTop.onclick = function(){prev();};
var prevBottom = document.getElementById("prevBottom");
prevBottom.onclick = function(){prev();};

var submitButton = document.getElementById("submitFile");
submitButton.onclick = function(){submit();};

var progressElement = document.getElementById("progressBar");
var trainingProgress = 0;

var curNum = 0;

var promptElement = document.getElementById("prompt");

var gtData = null;
var gtResponses = null;
var gtAnalysis = null;

var table = document.getElementById("table");
initTable()

function initTable() {
    let methods = versions.slice(1, versions.length);
    for (let i = 1; i < methods.length; i++) {
        let row = table.rows.item(1).cloneNode(true);
        table.appendChild(row);
    }
    for (let i = 0; i < methods.length; i++) {
        table.rows.item(i+1).cells.item(0).textContent = methods[i];
    }
}

function fillTable() {
    let metrics = ["aq", "sq", "mq", "ta", "op"];
    let methods = versions.slice(1, versions.length);
    for (let i = 0; i < methods.length; i++) {
        for (let j = 0; j < metrics.length; j++) {
            let cell = table.rows.item(i+1).cells.item(j+1);
            cell.textContent = gtAnalysis["comparisons"][methods[i]][metrics[j]]["ratio"].toFixed(2) + ", " + gtAnalysis["comparisons"][methods[i]][metrics[j]]["chisq"].toFixed(4);
        }
    }
}

function copyTable() {
    var copyText = "";
    navigator.clipboard.writeText(copyText);
    console.log("Copied the text: " + copyText);
}

function setNextButton(status) {
    nextTop.disabled = status;
    nextBottom.disabled = status;
}

function setPrevButton(status) {
    prevTop.disabled = status;
    prevBottom.disabled = status;
}

function setElementState(elementId, status) {
    var element = document.getElementById(elementId);
    element.hidden = status;
}

function setQuestion(num) {
    trainingProgress = Math.round(100.0 * (num + 1) / (filenames.length));
    progressElement.style.width = trainingProgress + "%";
    progressElement.textContent = trainingProgress + "%";
    videoTitle.textContent = "Question " + (num + 1)  + " of " + filenames.length;
    for (let i = 0; i < videoSources.length; i++) {
        videos[i].pause();
        videoSources[i].src = "..\\assets\\" + i + "\\" + filenames[num];
        promptElement.innerHTML = "<b>Prompt:</b> " + prompts[num];
        videos[i].load()
        videos[i].play();
    }
    let metrics = ["aq", "sq", "mq", "ta", "op"];
    for (let m of metrics) {
        let cnt0 = 0;
        let cnt1 = 0;
        for (let k = 0; k < gtResponses.length; k++) {
            if (gtResponses[k][m][num].toString() === "0")
                cnt0++;
            if (gtResponses[k][m][num].toString() === "1")
                cnt1++;
        }
        document.getElementById(m.toUpperCase() + "0").textContent = cnt0.toString();
        document.getElementById(m.toUpperCase() + "1").textContent = cnt1.toString();
    }
    document.getElementById("gtVideo0").textContent = gtData[num]["order"][0];
    document.getElementById("gtVideo1").textContent = gtData[num]["order"][1];

}

function next() {
    if (curNum === 0) {
        setPrevButton(false);
    }
    if (curNum === filenames.length - 2) {
        setNextButton(true);
    }
    curNum++;
    setQuestion(curNum);
};

function prev() {
    if (curNum === 1) {
        setPrevButton(true);
    }
    if (curNum === filenames.length-1) {
        setNextButton(false);
    }
    curNum--;
    setQuestion(curNum);
};


function submit() {
    var file = document.getElementById("file").files[0];
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            gtData = JSON.parse(reader.result);
            console.log(gtData);
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/results", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(gtData));
            xhr.onreadystatechange = function() { 
                // If the request completed, close the extension popup
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var results = JSON.parse(xhr.responseText);
                        gtResponses = results["responses"];
                        gtAnalysis = results["analysis"];
                        start();
                    }
                }
            };
        },
        false,
    );
    
    if (file) {
        reader.readAsText(file);
    }
}

function start() {
    document.getElementById("detailed").hidden = false;
    fillTable();
    setQuestion(curNum);
}