const express=require("express");
const {register,login, forgotPassword, resetPassword}=require("../controllers/authController");
const router = express.Router();
const passport = require("../middleware/passport");
const { googleCallback } = require("../controllers/authController");

// existing routes...
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
console.log("googleCallback:", googleCallback); // check if function is defined
// Google routes
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/?error=auth_failed" }),
  googleCallback
);

module.exports = router;
 