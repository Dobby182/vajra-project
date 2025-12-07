// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const nodemailer = require("nodemailer");

const path = require("path");
const bcrypt = require("bcryptjs");
const { generateOTP } = require("./utils");
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
const AddressSchema = new mongoose.Schema({
  name: String,
  line1: String,
  city: String,
  state: String,
  zip: String,
  phone: String,
});

const OrderSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  status: { type: String, default: "pending" }, // pending, success, failed
  date: { type: Date, default: Date.now },
  items: Array, // Store simplified item details
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  addresses: [AddressSchema], // Embedded array of addresses
  orders: [OrderSchema], // Embedded array of orders
  otp: String,
  otpExpires: Date,
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
    const newUser = new User({ name, email, password: hashedPassword, addresses: [] });
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

    // Return userId and name
    res.status(200).json({
      message: "Login Successful",
      userId: user._id,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐ NODEMAILER CONFIGURATION
// REPLACE WITH YOUR EMAIL CREDENTIALS
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "25mx225@psgtech.ac.in", // Updated sender email
    pass: "vfza whcx yxzm bcvl",   // App Password
  },
});

// ⭐ FORGOT PASSWORD API (Generate OTP)
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate 4-digit OTP
    // Generate 4-digit OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email
    const mailOptions = {
      from: '"Vajra Naturals" <25mx225@psgtech.ac.in>', // Sender address
      to: email,
      subject: "Password Reset OTP - Vajra Naturals",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
              <h2 style="color: #314d24;">Password Reset Request</h2>
              <p>You requested a password reset for your Vajra Naturals account.</p>
              <p>Your OTP is: <strong style="font-size: 24px; color: #2e7d32;">${otp}</strong></p>
              <p>This OTP is valid for 10 minutes.</p>
              <p>If you did not request this, please ignore this email.</p>
             </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        // Fallback to console log if email fails (e.g., auth error)
        console.log(`>>> FALLBACK OTP for ${email}: ${otp} <<<`);
        return res.status(500).json({ message: "Failed to send email, check server logs" });
      }
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "OTP sent to email" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐ RESET PASSWORD API
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐ ADD ADDRESS API
app.post("/api/add-address", async (req, res) => {
  try {
    const { userId, address } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: Check for duplicates
    const isDuplicate = user.addresses.some(
      (a) => a.line1 === address.line1 && a.zip === address.zip
    );

    if (!isDuplicate) {
      user.addresses.push(address);
      await user.save();
    }

    res.status(200).json({ message: "Address saved", addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐ GET ADDRESSES API
app.get("/api/get-addresses/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ⭐⭐⭐ CASHFREE PAYMENT API ⭐⭐⭐

// Cashfree Sandbox Keys
const APP_ID = "TEST1089794035d9088e980032bebf1004979801";
const SECRET_KEY = "cfsk_ma_test_079d62d429529c7428057b59cf50b4f6_d553dd40";

// Create Cashfree order
// Create Cashfree order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, userId, items } = req.body;
    const orderId = "ORDER_" + Date.now();

    // 1. Create Order in MongoDB (Pending)
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.orders.push({
          orderId,
          amount,
          status: "pending",
          items: items || [],
        });
        await user.save();
      }
    }

    // 2. Call Cashfree
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId || "GUEST",
          customer_email: "test@example.com",
          customer_phone: "9999999999",
        },

        order_meta: {
          return_url: `http://localhost:5000/success.html?order_id=${orderId}`,
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
      orderId: orderId,
    });
  } catch (error) {
    console.error("Create Order Error:", error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
});

// ⭐ VERIFY PAYMENT API
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find user with this order
    const user = await User.findOne({ "orders.orderId": orderId });
    if (!user) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Find the specific order
    const order = user.orders.find((o) => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // In a real app, we would call Cashfree here to verify status.
    // For this demo, since we are redirected here, we assume success.
    // Or we can check if status is already 'paid'
    if (order.status !== "Paid") {
      order.status = "Paid";
      await user.save();
    }

    res.json({ success: true, message: "Order verified" });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ⭐ GET ORDERS API
app.get("/api/get-orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ orders: user.orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
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
