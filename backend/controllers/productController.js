const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit=25;
    const skip=(page-1)*limit;
    const products = await Product.find().skip(skip).limit(limit);
     const total = await Product.countDocuments();
     res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
  }     
);}catch (err) {
    console.log("getProducts error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

const addProduct = async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json({ message: "Product added successfully" });
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };