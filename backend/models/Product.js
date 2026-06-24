const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  originalPrice: Number,
  category: String,
  description: String,
  image: String,
  images: [{ type: String }],
  stock: { type: Number, default: 0, required: true },
  specs: { type: Map, of: String, default: {} },
  variants: [{
    sku: { type: String, required: true },
    price: { type: Number },
    stock: { type: Number, default: 0 },
    image: { type: String },
    attributes: { type: Map, of: String }
  }]
});

// Indexes for fast querying (prevents full collection scans)
productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);