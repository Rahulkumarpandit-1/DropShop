const express = require("express");
const router = express.Router();
const { checkPincode, createPincode } = require("../controllers/pincodeController");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.get("/check/:pincode", checkPincode);
router.post("/create", authMiddleware, isAdmin, createPincode);

module.exports = router;
