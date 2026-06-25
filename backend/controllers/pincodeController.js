const Pincode = require("../models/Pincode");

exports.checkPincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return res.status(400).json({ error: "Invalid pincode format. Must be 6 digits." });
    }

    const serviceable = await Pincode.findOne({ pincode });
    if (!serviceable) {
      return res.json({
        serviceable: true,
        estDays: 5,
        message: "Standard delivery available in 5 days."
      });
    }

    if (!serviceable.isServiceable) {
      return res.json({
        serviceable: false,
        message: "Delivery is currently unavailable for this location."
      });
    }

    res.json({
      serviceable: true,
      estDays: serviceable.estDays,
      message: `Delivery available in ${serviceable.estDays} days.`
    });
  } catch (err) {
    console.error("checkPincode error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createPincode = async (req, res) => {
  try {
    const { pincode, estDays, isServiceable } = req.body;
    const existing = await Pincode.findOne({ pincode });
    if (existing) {
      existing.estDays = estDays !== undefined ? estDays : existing.estDays;
      existing.isServiceable = isServiceable !== undefined ? isServiceable : existing.isServiceable;
      await existing.save();
      return res.json({ message: "Pincode updated successfully", pincode: existing });
    }

    const newPin = new Pincode({
      pincode,
      estDays,
      isServiceable: isServiceable !== undefined ? isServiceable : true
    });
    await newPin.save();
    res.status(201).json({ message: "Pincode added successfully", pincode: newPin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
