const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const { validateCoupon, createCoupon } = require("../controllers/couponController");

router.post("/validate", authMiddleware, validateCoupon);
router.post("/create", authMiddleware, isAdmin, createCoupon);

module.exports = router;
