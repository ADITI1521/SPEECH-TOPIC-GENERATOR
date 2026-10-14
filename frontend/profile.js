function goHome() {
    window.location.href = "index.html";
}

const userId = localStorage.getItem("userId");

if (!userId) {
    alert("Please login first");
    window.location.href = "login.html";
}

// ================= FETCH ALL SPEECHES =================
fetch(`http://localhost:5001/api/speech/${userId}`)
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("history");

        if (!data.success || !data.speeches || data.speeches.length === 0) {
            container.innerHTML = "<p>No speeches yet.</p>";
            return;
        }

        data.speeches.forEach(item => {
            const div = document.createElement("div");

            div.style.background = "white";
            div.style.color = "black";
            div.style.padding = "15px";
            div.style.margin = "10px 0";
            div.style.borderRadius = "10px";

            div.innerHTML = `
                <h3>🎤 ${item.topic}</h3>
                <p><strong>Hints:</strong> ${item.hints || "No hints added"}</p>
                <small>🕒 ${new Date(item.date).toLocaleString()}</small>
                <br><br>

                <!-- Audio player -->
                <audio id="audio-${item._id}" controls style="width:100%; margin-top:8px;"></audio>

                <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
                    <!-- Load & Play button -->
                    <button onclick="loadAudio('${item._id}', '${item.topic}')"
                        style="background:#1e6f5c; color:white; padding:8px 16px; border:none; border-radius:8px; cursor:pointer;">
                        ▶ Load & Play
                    </button>

                    <!-- ✅ Download as audio file button -->
                    <button onclick="downloadAudio('${item._id}', '${item.topic}')"
                        style="background:#2e7d32; color:white; padding:8px 16px; border:none; border-radius:8px; cursor:pointer;">
                        ⬇ Download Audio
                    </button>
                </div>
            `;

            container.appendChild(div);
        });
    })
    .catch(err => {
        console.error(err);
        document.getElementById("history").innerHTML =
            "<p>❌ Could not load speeches. Is the server running?</p>";
    });

// ================= LOAD & PLAY AUDIO =================
function loadAudio(speechId, topic) {
    const audioEl = document.getElementById(`audio-${speechId}`);

    // Already loaded — just play
    if (audioEl.src && audioEl.src !== window.location.href) {
        audioEl.play();
        return;
    }

    fetch(`http://localhost:5001/api/speech/audio/${speechId}`)
        .then(res => {
            if (!res.ok) throw new Error("Audio not found");
            return res.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            audioEl.src = url;
            audioEl.play();
        })
        .catch(err => {
            console.error(err);
            alert("❌ No recording found for this speech.");
        });
}

// ================= DOWNLOAD AUDIO AS .webm FILE =================
function downloadAudio(speechId, topic) {
    fetch(`http://localhost:5001/api/speech/audio/${speechId}`)
        .then(res => {
            if (!res.ok) throw new Error("Audio not found");
            return res.blob();
        })
        .then(blob => {
            // Create a download link and click it automatically
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            // File name = topic text, spaces replaced with underscores
            const fileName = topic.replace(/\s+/g, "_") + ".webm";

            a.href = url;
            a.download = fileName;   // ✅ saves as topic_name.webm
            document.body.appendChild(a);
            a.click();

            // Cleanup
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.error(err);
            alert("❌ No recording found for this speech.");
        });
}