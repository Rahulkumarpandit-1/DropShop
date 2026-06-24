const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema({
  pincode: { type: String, required: true, unique: true, trim: true },
  estDays: { type: Number, default: 3 },
  isServiceable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Pincode", pincodeSchema);
