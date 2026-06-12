const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// @route   GET /api/admin/users
// @desc    Get all registered users (admin only)
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role (admin only)
router.put("/users/:id/role", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Role must be 'admin' or 'user'." });
    }

    // Safety: Prevent self-demotion to avoid locking oneself out of admin functions
    if (targetUserId === req.user.id && role !== "admin") {
      return res.status(400).json({ error: "You cannot demote yourself from admin status." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully", user: updatedUser });
  } catch (err) {
    console.error("UPDATE USER ROLE ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
