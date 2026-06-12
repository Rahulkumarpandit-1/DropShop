const express=require("express");
const router=express.Router();
const Product=require("../models/Product")

const authMiddleware = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {getProducts,addProduct,updateProduct,deleteProduct}=require("../controllers/productController");

router.get("/products",getProducts);
router.post("/products", authMiddleware, isAdmin, addProduct);
router.put("/products/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/products/:id", authMiddleware, isAdmin, deleteProduct);
// Make sure this is AFTER your existing routes
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports=router;