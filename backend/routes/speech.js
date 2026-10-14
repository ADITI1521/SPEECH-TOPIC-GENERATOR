const express = require("express");
const router = express.Router();
const multer = require("multer");
const Speech = require("../models/speech"); // ✅ FIX 1: correct import path

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// ================= SAVE SPEECH =================
router.post("/save", upload.single("speech"), async (req, res) => {
    try {
        const { userId, topic, hints } = req.body;

        if (!userId || !topic) {
            return res.status(400).json({ success: false, message: "userId and topic are required" });
        }

        const newSpeech = new Speech({
            userId,
            topic,
            hints,
            audio: req.file                    // ✅ FIX 2: audio is now actually saved
                ? { data: req.file.buffer, contentType: req.file.mimetype }
                : undefined
        });

        await newSpeech.save();

        res.json({
            success: true,
            message: "Speech and hints saved successfully!",
            speechId: newSpeech._id
        });

    } catch (err) {
        console.error("SERVER ERROR:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================= GET ALL SPEECHES FOR A USER =================
router.get("/:userId", async (req, res) => {
    try {
        const speeches = await Speech.find({ userId: req.params.userId })
            .select("-audio")        // exclude audio blob from list response
            .sort({ date: -1 });

        res.json({ success: true, speeches });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ================= STREAM AUDIO FOR ONE SPEECH =================
router.get("/audio/:speechId", async (req, res) => {
    try {
        const speech = await Speech.findById(req.params.speechId);

        if (!speech || !speech.audio?.data) {
            return res.status(404).json({ success: false, message: "Audio not found" });
        }

        res.set("Content-Type", speech.audio.contentType);
        res.send(speech.audio.data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;