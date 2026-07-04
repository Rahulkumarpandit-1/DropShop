const express=require("express");
const {register, login, forgotPassword, resetPassword, sendOtp, verifyOtp, resetPasswordPhone, sendEmailOtp, verifyLoginOtp, resetPasswordEmailOtp}=require("../controllers/authController");
const router = express.Router();
const passport = require("../middleware/passport");
const { googleCallback } = require("../controllers/authController");

// existing routes...
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/reset-password-phone", resetPasswordPhone);
router.post("/reset-password-email-otp", resetPasswordEmailOtp);
console.log("googleCallback:", googleCallback); // check if function is defined
// Google routes
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/$/, "");

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${frontendUrl}/?error=auth_failed` }),
  googleCallback
);

module.exports = router;
 