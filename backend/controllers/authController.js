const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Check if user exists
    const userExists = await User.exists({ phone });

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous OTPs for this phone number, then insert the new one
    await Otp.deleteMany({ phone });
    const newOtp = new Otp({ phone, code });
    await newOtp.save();

    console.log(`[OTP Verification] Generated OTP ${code} for phone ${phone} (User exists: ${!!userExists})`);

    const isProd = process.env.NODE_ENV === "production";
    res.json({
      message: "OTP sent successfully",
      exists: !!userExists,
      ...(isProd ? {} : { code })
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, phone, otp } = req.body;

    if (!name || !phone || !otp) {
      return res.status(400).json({ message: "Name, phone number, and OTP are required" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ phone, code: otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete verified OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check existing user
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    // Auto-generate a secure random password to satisfy schema requirement
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = new User({
      name,
      phone,
      password: hashedPassword,
      role: "user"
    });

    await user.save();

    // Log user in automatically on registration by returning JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dropshop_jwt_secret_123",
      { expiresIn: "1d" }
    );

    res.json({ message: "User registered successfully", token });

  } catch (err) {
    console.log("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ phone, code: otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete verified OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dropshop_jwt_secret_123",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.googleCallback = async (req, res) => {
  try {
    const { displayName, emails, id } = req.user;
    const email = emails[0].value;
    let user = await User.findOne({ email });
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || "dropshop_jwt_secret_123",
      { expiresIn: "1d" }
    );
    
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/$/, "");
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (err) {
    console.log("googleCallback error:", err.message);
    console.log("full error:", err);
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/$/, "");
    res.redirect(`${frontendUrl}/?error=auth_failed`);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist" });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");

    // Save token and expiry (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(user.email, token);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Find user by token and verify it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    // Clear token fields
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been successfully updated" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};