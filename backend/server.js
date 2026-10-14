const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Use single port
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 🔗 MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/offthecuff")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// ================= ROUTES =================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/speech", require("./routes/speech"));

// health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;