const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  originalPrice: Number,
  category: String,
  description: String,
  image: String,
  stock: { type: Number, default:0, required: true },
  specs: { type: Map, of: String, default: {} },
});

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);