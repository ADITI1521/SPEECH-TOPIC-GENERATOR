const mongoose = require("mongoose");

const speechSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    hints: {
        type: String
    },
    audio: {                    // ✅ FIX 3: audio field was missing from original model
        data: Buffer,
        contentType: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Speech", speechSchema);