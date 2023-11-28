TimeMe.initialize({
    currentPageName: "text-to-4d",
    idleTimeoutInSeconds: 30
});

document.getElementById("jscheck").hidden = true;

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

var submitTop = document.getElementById("submitTop");
submitTop.onclick = function(){submit();};
var submitBottom = document.getElementById("submitBottom");
submitBottom.onclick = function(){submit();};

var curNum = JSON.parse(window.localStorage.getItem("curNum"));
var oldCurNum = -2;

if (curNum !== null) {
    oldCurNum = curNum;
}
curNum = -2;

var progressElement = document.getElementById("progressBar");
var trainingProgress = 0;

var results = JSON.parse(window.localStorage.getItem("results"));

if (results === null) {
    results = [];
    results.push(
        {
            "email": "",
            "consent": false,
            "compensate": false,
            "duration": 0,
            "startTime": (new Date()).getTime(),
            "endTime": 0
        }
    );
    results.push(
        {
            "age": "",
            "gender": ""
        }
    );
    for (let i = 0; i < filenames.length; i++) {
        results.push(
            {
                "AQ0": false,
                "AQ1": false,
                "SQ0": false,
                "SQ1": false,
                "MQ0": false,
                "MQ1": false,
                "TA0": false,
                "TA1": false,
                "OP0": false,
                "OP1": false,
            }
        )
    }
    
    results.push(
        {
            "comments": ""
        }
    );
}

var promptElement = document.getElementById("prompt")

function setNextButton(status) {
    nextTop.disabled = status;
    nextBottom.disabled = status;
}

function setPrevButton(status) {
    prevTop.disabled = status;
    prevBottom.disabled = status;
}

function setSubmitButton(status) {
    submitTop.disabled = status;
    submitBottom.disabled = status;
}

function setElementState(elementId, status) {
    var element = document.getElementById(elementId);
    element.hidden = status;
}

function markInput(elementId, status) {
    if (status) {
        document.getElementById(elementId).classList.add("is-invalid");
    }
    else {
        document.getElementById(elementId).classList.remove("is-invalid");
    }
}

function validateQuestion(num) {
    if (num === -2) {
        let checkEmail = document.getElementById("email").value === "";
        let checkConsent = !document.getElementById("consent").checked;
        markInput("email", checkEmail);
        markInput("consent", checkConsent);
        return !(checkEmail || checkConsent);
    }
    if (num === -1) {
        let checkAge = isNaN(document.getElementById("age").value) || (document.getElementById("age").value === "");
        let checkGender = document.getElementById("gender").value === "";
        markInput("age", checkAge);
        markInput("gender", checkGender);
        return !(checkAge || checkGender);
    }
    if (num === filenames.length)
        return true;
    let checkAQ = !document.getElementById("AQ0").checked && !document.getElementById("AQ1").checked;
    markInput("AQ", checkAQ);
    let checkSQ = !document.getElementById("SQ0").checked && !document.getElementById("SQ1").checked;
    markInput("SQ", checkSQ);
    let checkMQ = !document.getElementById("MQ0").checked && !document.getElementById("MQ1").checked;
    markInput("MQ", checkMQ);
    let checkTA = !document.getElementById("TA0").checked && !document.getElementById("TA1").checked;
    markInput("TA", checkTA);
    let checkOP = !document.getElementById("OP0").checked && !document.getElementById("OP1").checked;
    markInput("OP", checkOP);
    return !(checkAQ || checkSQ || checkMQ || checkTA || checkOP);
}

function saveQuestion(num) {
    if (num === -1 || num === filenames.length) {
        for (let attr in results[num + 2]) {
            results[num + 2][attr] = document.getElementById(attr).value;
        }
        window.localStorage.setItem("results", JSON.stringify(results));
        return;
    }
    if (num === -2) {
        results[0]["email"] = document.getElementById("email").value;
        results[0]["consent"] = document.getElementById("consent").checked;
        window.localStorage.setItem("results", JSON.stringify(results));
        return;
    }
    for (let attr in results[num + 2]) {
        results[num + 2][attr] = document.getElementById(attr).checked;
    }
    window.localStorage.setItem("results", JSON.stringify(results));
}

function setQuestion(num) {
    window.localStorage.setItem("curNum", JSON.stringify(curNum));
    trainingProgress = Math.round(100.0 * (num + 2) / (filenames.length + 2));
    progressElement.style.width = trainingProgress + "%";
    progressElement.textContent = trainingProgress + "%";
    if (num == -2) {
        document.getElementById("email").value = results[0]["email"];
        document.getElementById("consent").checked = results[0]["consent"];
        return;
    }
    if (num == -1 || num === filenames.length) {
        for (let attr in results[num + 2]) {
            document.getElementById(attr).value = results[num + 2][attr];
        }
        return;
    }
    for (let attr in results[num + 2]) {
        document.getElementById(attr).checked = results[num + 2][attr];
    }
    markInput("AQ", false);
    markInput("SQ", false);
    markInput("MQ", false);
    markInput("TA", false);
    markInput("OP", false);
    videoTitle.textContent = "Question " + (num + 1)  + " of " + filenames.length;
    for (let i = 0; i < videoSources.length; i++) {
        videos[i].pause();
        videoSources[i].src = "assets\\" + i + "\\" + filenames[num];
        promptElement.innerHTML = "<b>Prompt:</b> " + prompts[num];
        videos[i].load()
        videos[i].play();
    }
}

function next() {
    let result = validateQuestion(curNum);
    if (!result)
        return;
    if (curNum === -2) {
        setElementState("consentQuestion", true);
        setElementState("infoQuestion", false);
        setPrevButton(false);
    }
    else if (curNum === -1) {
        setElementState("infoQuestion", true);
        setElementState("videoQuestion", false);
    }
    else if (curNum === filenames.length - 1) {
        setElementState("videoQuestion", true);
        setElementState("commentQuestion", false);
        setNextButton(true);
        setSubmitButton(false);
    }
    saveQuestion(curNum);
    curNum++;
    setQuestion(curNum);
};

function prev() {
    if (curNum === -1) {
        setElementState("consentQuestion", false);
        setElementState("infoQuestion", true);
        setPrevButton(true);
    }
    else if (curNum === 0) {
        setElementState("infoQuestion", false);
        setElementState("videoQuestion", true);
    }
    else if (curNum === filenames.length) {
        setElementState("videoQuestion", false);
        setElementState("commentQuestion", true);
        setNextButton(false);
        setSubmitButton(true);
    }
    saveQuestion(curNum);
    curNum--;
    setQuestion(curNum);
};

function submit() {
    saveQuestion(curNum);
    var commentElement = document.getElementById("commentQuestion");
    commentElement.hidden = true;
    var thanksElement = document.getElementById("thanks");
    thanksElement.hidden = false;
    setPrevButton(true);
    setSubmitButton(true);
    results[0]["duration"] = TimeMe.getTimeOnCurrentPageInSeconds();
    console.log(results)
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(results));
}

setQuestion(-2);
for (let i = -2; i < oldCurNum; i++) {
    next();
}