let currentCategory = "random";

// ================= TOPICS =================

const topics = {
    debate: [
        "Should homework be banned?",
        "Should college education be free?",
        "Should social media be regulated?",
        "Is artificial intelligence dangerous?"
    ],
    fun: [
        "If animals could talk, which would be the rudest?",
        "If you were invisible for a day what would you do?",
        "Would you rather live on Mars or underwater?",
        "If you could have any superpower what would it be?"
    ],
    tech: [
        "Is technology making people lazy?",
        "Will robots replace human jobs?",
        "Is artificial intelligence helpful or harmful?",
        "Is social media addiction a real problem?"
    ],
    social: [
        "Does money bring happiness?",
        "Is climate change the biggest global threat?",
        "Does technology make people lonely?",
        "Should animals be used for testing?"
    ],
    random: [
        "What motivates you the most?",
        "Describe your dream life.",
        "What does success mean to you?",
        "What is the most important skill to learn?"
    ]
};

// ================= CATEGORY =================

function setCategory(category) {
    currentCategory = category;
    document.getElementById("topic").innerText = "Category: " + category;
}

// ================= SPIN TOPIC =================

function spinTopics() {
    let topicList = topics[currentCategory];
    let topicBox = document.getElementById("topic");

    let spin = setInterval(() => {
        let randomIndex = Math.floor(Math.random() * topicList.length);
        topicBox.innerText = topicList[randomIndex];
    }, 120);

    setTimeout(() => {
        clearInterval(spin);
        let finalIndex = Math.floor(Math.random() * topicList.length);
        let selectedTopic = topicList[finalIndex];
        topicBox.innerText = selectedTopic;
        localStorage.setItem("speechTopic", selectedTopic);
    }, 2000);
}

// ================= NAVIGATION =================

function goToTimer() {
    window.location.href = "timer.html";
}

function goProfile() {
    window.location.href = "profile.html";
}

// ================= TIMER =================

let time = 60;
let timer = null;

window.onload = function () {
    let timerElement = document.getElementById("timer");

    if (timerElement) {
        let topic = localStorage.getItem("speechTopic");
        if (!topic) topic = "No topic selected";

        let topicElement = document.getElementById("selectedTopic");
        if (topicElement) topicElement.innerText = topic;

        updateTimer();
        startTimer();
    }
};

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        time--;
        updateTimer();

        if (time <= 0) {
            clearInterval(timer);
            timer = null;
            alert("⏰ Time's up!");
        }
    }, 1000);
}

function updateTimer() {
    let timerElement = document.getElementById("timer");
    if (!timerElement) return;

    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    if (seconds < 10) seconds = "0" + seconds;
    timerElement.innerText = minutes + ":" + seconds;
}

function pauseTimer() {
    clearInterval(timer);
    timer = null;
}

function restartTimer() {
    clearInterval(timer);
    timer = null;
    time = 60;
    updateTimer();
    startTimer();
}

// ================= RECORDING =================

let mediaRecorder;
let audioChunks = [];
let audioBlob = null;

async function startRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        alert("Already recording!");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        audioBlob = null;

        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            const audioURL = URL.createObjectURL(audioBlob);
            document.getElementById("audioPlayback").src = audioURL;
        };

        mediaRecorder.start();
        alert("Recording started 🎤");

    } catch (err) {
        console.error(err);
        alert("Microphone access denied!");
    }
}

function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state !== "recording") {
        alert("No active recording!");
        return;
    }
    mediaRecorder.stop();
    alert("Recording stopped ⏹");
}

// ================= SAVE HINTS ONLY =================
// ✅ NEW: saves just the hints text to MongoDB without needing audio

async function saveHints() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const topic = document.getElementById("selectedTopic")?.innerText.trim();
    const hints = document.querySelector(".big-hints")?.value.trim();

    if (!topic || topic === "No topic selected") {
        alert("No topic found. Please go back and spin a topic first.");
        return;
    }

    if (!hints) {
        alert("Please write some hints before saving.");
        return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("topic", topic);
    formData.append("hints", hints);
    // no audio attached — just saving hints

    try {
        const response = await fetch("http://localhost:5001/api/speech/save", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert("Hints saved successfully! ✅");
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Save hints failed:", error);
        alert("❌ Cannot connect to server.\n\nMake sure your backend is running:\ncd your-backend-folder && node server.js");
    }
}

// ================= SAVE FULL SPEECH =================

async function saveSpeech() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    const topic = document.getElementById("selectedTopic")?.innerText.trim();
    const hints = document.querySelector(".big-hints")?.value.trim();

    if (!topic || topic === "No topic selected") {
        alert("No topic found. Please go back and spin a topic first.");
        return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("topic", topic);
    formData.append("hints", hints || "");

    if (audioBlob) {
        formData.append("speech", audioBlob, "recording.webm");
    } else {
        alert("No recording found. Please record your speech first.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5001/api/speech/save", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert("Speech and hints saved successfully! ✅");
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Save speech failed:", error);
        alert("❌ Cannot connect to server.\n\nMake sure your backend is running:\ncd your-backend-folder && node server.js");
    }
}