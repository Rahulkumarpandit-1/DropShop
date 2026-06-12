const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

// GET USER'S WISHLIST
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error("GET wishlist error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE PRODUCT IN WISHLIST
router.post("/toggle", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const index = user.wishlist.indexOf(productId);
    let added = false;

    if (index > -1) {
      // Remove if already wishlisted
      user.wishlist.splice(index, 1);
    } else {
      // Add if not wishlisted
      user.wishlist.push(productId);
      added = true;
    }

    await user.save();
    res.json({ 
      message: added ? "Added to wishlist" : "Removed from wishlist", 
      wishlist: user.wishlist,
      added 
    });
  } catch (err) {
    console.error("TOGGLE wishlist error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
