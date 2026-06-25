const express = require("express");
const router = express.Router();
const { placeOrder, getOrders, trackOrder, AdminUpdateStatus, getAllOrdersAdmin, cancelOrder } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// ✅ admin routes FIRST
router.get("/admin/orders", authMiddleware, isAdmin, getAllOrdersAdmin);
router.patch("/admin/:orderId/tracking", authMiddleware, isAdmin, AdminUpdateStatus);

// ✅ specific routes
router.get("/:orderId/tracking", trackOrder);
router.post("/:orderId/cancel", authMiddleware, cancelOrder);

// generic routes AFTER
router.post("/place", authMiddleware, placeOrder);
router.get("/", authMiddleware, getOrders);

module.exports = router;