const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/sendEmail");
const crypto = require("crypto");

const sanitizePhoneNumber = (phone) => {
  if (!phone) return "";
  let clean = phone.toString().replace(/\D/g, ""); // Keep only digits
  if (clean.length > 10) {
    if (clean.startsWith("91") && clean.length === 12) {
      clean = clean.substring(2);
    } else if (clean.length === 11 && clean.startsWith("0")) {
      clean = clean.substring(1);
    }
  }
  return clean;
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    // Check if user exists
    const userExists = await User.exists({ phone: cleanPhone });

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any previous OTPs for this phone number, then insert the new one
    await Otp.deleteMany({ phone: cleanPhone });
    const newOtp = new Otp({ phone: cleanPhone, code });
    await newOtp.save();

    console.log(`[OTP Verification] Generated OTP ${code} for phone ${cleanPhone} (User exists: ${!!userExists})`);

    let smsError = null;
    let smsSent = false;

    // Send real text message if FAST2SMS_API_KEY is configured
    if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY !== "your_fast2sms_api_key_here") {
      try {
        const smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&route=otp&variables_values=${code}&numbers=${cleanPhone}`;
        const smsRes = await fetch(smsUrl);
        const smsData = await smsRes.json();
        console.log("[Fast2SMS API Response]:", smsData);
        if (!smsRes.ok || smsData.return === false || smsData.status_code) {
          smsError = smsData.message || (smsData.status_code ? `Fast2SMS Error Code ${smsData.status_code}` : "Failed to deliver SMS");
        } else {
          smsSent = true;
        }
      } catch (smsErr) {
        console.error("Fast2SMS OTP delivery failed:", smsErr.message);
        smsError = smsErr.message;
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    
    // If the SMS delivery failed, always expose the OTP code so the developer/tester is not blocked
    const shouldReturnCode = !isProd || smsError;

    res.json({
      message: smsError ? `OTP generated, but SMS failed: ${smsError}` : "OTP sent successfully",
      exists: !!userExists,
      smsError,
      ...(shouldReturnCode ? { code } : {})
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, phone, password, otp } = req.body;

    if (!name || !phone || !password || !otp) {
      return res.status(400).json({ message: "Name, phone number, password, and OTP are required" });
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ phone: cleanPhone, code: otp });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete verified OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check existing user
    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      phone: cleanPhone,
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
    const { phone, password, otp } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    if (otp) {
      // OTP-based Login
      const otpRecord = await Otp.findOne({ phone: cleanPhone, code: otp });
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Delete verified OTP
      await Otp.deleteOne({ _id: otpRecord._id });

      const user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        return res.status(400).json({ message: "User not found. Please register first." });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "dropshop_jwt_secret_123",
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login successful",
        token
      });
    } else if (password) {
      // Password-based Login
      const user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        return res.status(400).json({ message: "User not found. Please register first." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "dropshop_jwt_secret_123",
        { expiresIn: "1d" }
      );

      return res.json({
        message: "Login successful",
        token
      });
    } else {
      return res.status(400).json({ message: "Password or OTP is required" });
    }
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