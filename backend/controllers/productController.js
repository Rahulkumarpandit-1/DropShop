const Product = require("../models/Product");
const Order = require("../models/Order");

const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;
    const products = await Product.find().skip(skip).limit(limit);
    const total = await Product.countDocuments();
    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
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

const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    // Aggregation to sum quantities per productId
    const orderedProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalOrdered: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: limit }
    ]);

    const productIds = orderedProducts.map(item => item._id).filter(id => id != null);

    let trending = [];
    if (productIds.length > 0) {
      trending = await Product.find({ _id: { $in: productIds } });
      // Keep aggregation sorted order
      trending.sort((a, b) => {
        return productIds.indexOf(a._id.toString()) - productIds.indexOf(b._id.toString());
      });
    }

    // Fallback if there aren't enough ordered products to fill the limit
    if (trending.length < limit) {
      const fillLimit = limit - trending.length;
      const extraProducts = await Product.find({ _id: { $nin: productIds } }).limit(fillLimit);
      trending = [...trending, ...extraProducts];
    }

    res.json(trending);
  } catch (err) {
    console.error("getTrendingProducts error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, addProduct, updateProduct, deleteProduct, getTrendingProducts };