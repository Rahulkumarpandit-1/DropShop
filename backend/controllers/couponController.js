const Coupon = require("../models/Coupon");

// Helper function to validate coupon and return discount details
exports.validateCouponHelper = async (code, cartTotal) => {
  if (!code) return { discount: 0, error: null };
  
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) {
    return { discount: 0, error: "Invalid coupon code" };
  }
  
  if (!coupon.isActive) {
    return { discount: 0, error: "Coupon is inactive" };
  }
  
  if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
    return { discount: 0, error: "Coupon has expired" };
  }
  
  if (cartTotal < coupon.minCartValue) {
    return { discount: 0, error: `Minimum purchase of ₹${coupon.minCartValue} required` };
  }
  
  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = cartTotal * (coupon.discountValue / 100);
  } else if (coupon.discountType === "flat") {
    discount = coupon.discountValue;
  }
  
  discount = Math.min(discount, cartTotal); // Discount cannot exceed total
  
  return { discount, error: null, coupon };
};

// API Endpoint to validate a coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }
    if (cartTotal === undefined || typeof cartTotal !== "number") {
      return res.status(400).json({ error: "Valid cart total is required" });
    }
    
    const result = await exports.validateCouponHelper(code, cartTotal);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      valid: true,
      code: result.coupon.code,
      discount: result.discount,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue
    });
  } catch (err) {
    console.error("validateCoupon error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Admin endpoint to create a coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartValue, expirationDate, isActive } = req.body;
    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }
    
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minCartValue,
      expirationDate: new Date(expirationDate),
      isActive: isActive !== undefined ? isActive : true
    });
    
    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
