const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");


// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 🔴 validation
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields required" });
        }

        // 🔴 check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // 🔐 hash password
        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashed
        });

        await user.save();

        res.json({ message: "User created successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 🔴 validation
        if (!email || !password) {
            return res.status(400).json({ msg: "All fields required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Wrong password" });
        }

        res.json({
            userId: user._id,
            name: user.name
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = router;