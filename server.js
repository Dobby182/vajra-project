// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ⭐ CONNECT TO MONGODB
mongoose
  .connect("mongodb://localhost:27017/vajraDB")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

// ⭐ USER SCHEMA
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = mongoose.model("users", UserSchema);

// ⭐ TEST API
app.get("/api/test", (req, res) => {
  res.json({ message: "API Working Fine" });
});

// ⭐ REGISTER API
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(200).json({ message: "Registration Successful" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐ LOGIN API
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐ START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
