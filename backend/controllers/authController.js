const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
exports.register = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // 🔥 check empty fields
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔥 check existing user
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User with this phone number already exists" });
    }

    // 🔥 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      phone,
      password: hashedPassword,
      role: "user"
    });

    await user.save();
    res.json({ message: "User registered successfully" });

  } catch (err) {
    console.log("REGISTER ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.login = async (req,res)=>{

  const {phone,password} = req.body;

  const user = await User.findOne({phone});

  if(!user ){
    return res.json({message:"User not found"});
  }

  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch){
    return res.json({message:"Wrong password"});
  }

  const token = jwt.sign(
   { id: user._id },
   "dropshop_jwt_secret_123",
   { expiresIn: "1d" }
  );

  res.json({
    message:"Login successful",
    token
  });

};
exports.googleCallback = async (req, res) => {
  try {
    
    const { displayName, emails, id } = req.user;
    
    const email = emails[0].value;
    let user = await User.findOne({ email });
    
    const token = jwt.sign(
  { id: user._id }, 
  process.env.JWT_SECRET || "dropshop_jwt_secret_123", // 👈 fallback
  { expiresIn: "1d" }
);
    
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  } catch (err) {
    console.log("googleCallback error:", err.message);
    console.log("full error:", err); // 👈 full error details
    res.redirect("http://localhost:5173/?error=auth_failed");
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