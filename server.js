// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const path = require("path");
const bcrypt = require("bcryptjs");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, images, etc.) from project root
app.use(express.static(path.join(__dirname)));

// ⭐ CONNECT TO MONGODB
const MONGO_URI = "mongodb://localhost:27017/vajraDB";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    console.log("Connected to MongoDB at:", MONGO_URI);
  })
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ⭐ USER SCHEMA
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("users", UserSchema);



// ⭐ REGISTER API
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
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

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login Successful" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐⭐⭐ CASHFREE PAYMENT API ⭐⭐⭐

// Cashfree Sandbox Keys
const APP_ID = "TEST1089794035d9088e980032bebf1004979801";
const SECRET_KEY = "cfsk_ma_test_079d62d429529c7428057b59cf50b4f6_d553dd40";

// Create Cashfree order
app.post("/create-order", async (req, res) => {
  try {
    const amount = req.body.amount;

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: "ORDER_" + Date.now(),
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "CUST_001",
          customer_email: "test@example.com",
          customer_phone: "9999999999",
        },

        order_meta: {
          return_url: "http://localhost:5000/success.html",
          notify_url: "",
        },
      },
      {
        headers: {
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      paymentSessionId: response.data.payment_session_id,
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// ⭐ FAILURE PAGE REDIRECT
app.get("/payment-failed", (req, res) => {
  res.sendFile(__dirname + "/failure.html");
});

// ⭐ START SERVER
const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
