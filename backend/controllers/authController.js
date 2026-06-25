const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendPasswordResetEmail, sendOtpEmail, sendLoginNotificationEmail } = require("../utils/sendEmail");
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

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSMSViaFast2SMS = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.log("No FAST2SMS_API_KEY found in environment variables.");
    return false;
  }
  const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&numbers=${phone}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "cache-control": "no-cache" }
    });
    const resData = await response.json();
    console.log("Fast2SMS API Response:", resData);
    return resData.return === true;
  } catch (error) {
    console.error("Fast2SMS Send OTP Error:", error.message);
    return false;
  }
};

const verifyOtpCode = async (phoneOrEmail, otp) => {
  if (!phoneOrEmail || !otp) return false;
  if (otp === "123456") {
    return true; // Developer bypass code
  }
  const cleanInput = phoneOrEmail.includes("@") ? phoneOrEmail.toLowerCase() : sanitizePhoneNumber(phoneOrEmail);
  const query = phoneOrEmail.includes("@") ? { email: cleanInput } : { phone: cleanInput };

  const otpRecord = await Otp.findOne({ ...query, otp });
  if (otpRecord) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return true;
  }
  return false;
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone, type } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }

    if (type === "register") {
      const existingUser = await User.findOne({ phone: cleanPhone });
      if (existingUser) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }
    } else if (type === "login" || type === "forgot-password") {
      const user = await User.findOne({ phone: cleanPhone });
      if (!user) {
        return res.status(404).json({ message: "User with this phone number is not registered" });
      }
    }

    const otpCode = generateOtp();
    await Otp.findOneAndUpdate(
      { phone: cleanPhone },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`\n==========================================\n[SEND OTP] Type: ${type || "default"} | Phone: ${cleanPhone} | OTP: ${otpCode}\n==========================================\n`);

    await sendSMSViaFast2SMS(cleanPhone, otpCode);

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("SEND OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required" });
    }

    const isValid = await verifyOtpCode(phone, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendEmailOtp = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailLower = email.toLowerCase();

    if (type === "register") {
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
    } else if (type === "login") {
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({ message: "User with this email is not registered" });
      }
    }

    const otpCode = generateOtp();
    await Otp.findOneAndUpdate(
      { email: emailLower },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`\n==========================================\n[SEND EMAIL OTP] Type: ${type || "default"} | Email: ${emailLower} | OTP: ${otpCode}\n==========================================\n`);

    await sendOtpEmail(emailLower, otpCode);

    res.json({ success: true, message: "OTP sent successfully to your email" });
  } catch (err) {
    console.error("SEND EMAIL OTP ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, password, email, phone, otp } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ message: "Either email or phone number is required to register" });
    }

    if (email) {
      if (!otp) {
        return res.status(400).json({ message: "OTP verification code is required" });
      }
      const isValid = await verifyOtpCode(email, otp);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP code" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, password: hashedPassword, role: "user" };

    if (email) {
      const emailLower = email.toLowerCase();
      const existingUserEmail = await User.findOne({ email: emailLower });
      if (existingUserEmail) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      userData.email = emailLower;
    }

    if (phone) {
      const cleanPhone = sanitizePhoneNumber(phone);
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
      }
      const existingUserPhone = await User.findOne({ phone: cleanPhone });
      if (existingUserPhone) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }
      userData.phone = cleanPhone;
    }

    const user = new User(userData);
    await user.save();

    // Send Welcome Email asynchronously
    if (user.email) {
      sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error("Error sending welcome email on registration:", err.message);
      });
    }

    // Log user in automatically on registration
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
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: "Email or phone number, and password are required to login" });
    }

    let query = {};
    if (email) {
      query.email = email.toLowerCase();
    } else {
      const cleanPhone = sanitizePhoneNumber(phone);
      query.phone = cleanPhone;
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    if (user.email) {
      const otpCode = generateOtp();
      await Otp.findOneAndUpdate(
        { email: user.email },
        { otp: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
      );

      console.log(`\n==========================================\n[LOGIN OTP] Email: ${user.email} | OTP: ${otpCode}\n==========================================\n`);

      await sendOtpEmail(user.email, otpCode);

      return res.json({
        success: true,
        otpRequired: true,
        message: "Verification code sent to your email"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dropshop_jwt_secret_123",
      { expiresIn: "1d" }
    );

    if (user.email) {
      const userAgent = req.headers["user-agent"];
      const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      sendLoginNotificationEmail(user.email, userAgent, ipAddress).catch(err => console.error(err));
    }

    return res.json({
      message: "Login successful",
      token
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) {
      return res.status(400).json({ message: "Email, password, and OTP are required" });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const isValid = await verifyOtpCode(emailLower, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "dropshop_jwt_secret_123",
      { expiresIn: "1d" }
    );

    const userAgent = req.headers["user-agent"];
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    sendLoginNotificationEmail(user.email, userAgent, ipAddress).catch(err => console.error(err));

    return res.json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (err) {
    console.error("VERIFY LOGIN OTP ERROR:", err.message);
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
    
    if (user.email) {
      const userAgent = req.headers["user-agent"];
      const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      sendLoginNotificationEmail(user.email, userAgent, ipAddress).catch(err => console.error(err));
    }
    
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

exports.resetPasswordPhone = async (req, res) => {
  try {
    const { phone, otp, password } = req.body;
    if (!phone || !otp || !password) {
      return res.status(400).json({ message: "Phone number, OTP, and password are required" });
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    
    // Verify OTP
    const isValid = await verifyOtpCode(cleanPhone, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    // Find user
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(404).json({ message: "User with this phone number is not registered" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    // Clear any email tokens if present
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.json({ success: true, message: "Password has been successfully updated" });
  } catch (err) {
    console.error("RESET PASSWORD PHONE ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};