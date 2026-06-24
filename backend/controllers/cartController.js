const Product = require("../models/Product");
const Cart = require("../models/Cart");

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantSku, selectedAttributes } = req.body;
    const userId = req.user.id;
   
    if(!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    let cart = await Cart.findOne({ userId });
    if(!cart) {
      cart = new Cart({
         userId,
         items: [{ productId, variantSku: variantSku || "", selectedAttributes: selectedAttributes || {}, quantity: 1 }],
        });
        await cart.save();
        return res.json({ message: "Product added to cart successfully" });
    }
    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId.toString() && 
      (item.variantSku || "") === (variantSku || "")
    );
    if(existingItem){
      existingItem.quantity += 1;
    }else{
      cart.items.push({ productId, variantSku: variantSku || "", selectedAttributes: selectedAttributes || {}, quantity: 1 });
    }
    await cart.save();
    return res.json({ message: "Product added to cart successfully" ,cart});
  } catch (err) {
    console.log("addToCart error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || !cart.items || cart.items.length === 0){
      return res.json({ message: "Cart is empty",items:[] });
    }
    const formattedCart = cart.items
      .filter(item => item.productId) // 🔥 remove null products
      .map((item) => {
        const variant = item.productId.variants?.find(v => v.sku === item.variantSku);
        
        let displayAttributes = "";
        if (item.selectedAttributes && item.selectedAttributes instanceof Map) {
          displayAttributes = Array.from(item.selectedAttributes.entries())
            .map(([k, v]) => `${k}: ${v}`).join(", ");
        } else if (item.selectedAttributes && typeof item.selectedAttributes === "object") {
          displayAttributes = Object.entries(item.selectedAttributes)
            .map(([k, v]) => `${k}: ${v}`).join(", ");
        }

        const name = variant && displayAttributes
          ? `${item.productId.name} (${displayAttributes})`
          : item.productId.name;
        const price = variant?.price !== undefined ? variant.price : item.productId.price;
        const image = variant?.image || item.productId.image;
        const stock = variant?.stock !== undefined ? variant.stock : item.productId.stock;

        return {
          _id: item._id,
          quantity: item.quantity,
          productId: item.productId._id,
          name,
          price,
          image,
          stock,
          variantSku: item.variantSku || "",
          selectedAttributes: item.selectedAttributes || {}
        };
      });
    res.json({items:formattedCart});
  } catch (err) {
    console.log("getCart error:", err.message);
    res.status(500).json({ error: err.message });
  }
};// INCREMENT
exports.incrementItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
   
     const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    // 👇 check stock before incrementing
    const product = item.productId;

    if (item.quantity >= product.stock) {
      return res.status(400).json({ 
        error: `Only ${product.stock} items available in stock` 
      });
    }
    const result = await Cart.updateOne(
      { userId, "items._id": itemId },
      { $inc: { "items.$.quantity": 1 } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const updatedCart = await Cart.findOne({ userId })
      .populate("items.productId");
    res.json({ items: updatedCart.items });

  } catch (err) {
    console.log("incrementItem error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
// DECREMENT
exports.decrementItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId, "items._id": itemId });
    if (!cart) return res.status(404).json({ error: "Item not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.quantity <= 1) {
      await Cart.updateOne(
        { userId, "items._id": itemId },
        { $pull: { items: { _id: itemId } } }
      );
    } else {
      await Cart.updateOne(
        { userId, "items._id": itemId },
        { $inc: { "items.$.quantity": -1 } }
      );
    }

    res.json({ message: "Decremented" });

  } catch (err) {
    console.log("decrementItem error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
// REMOVE
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const result = await Cart.updateOne(
      { userId, "items._id": itemId },
      { $pull: { items: { _id: itemId } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Removed" });

  } catch (err) {
    console.log("removeItem error:", err.message);
    res.status(500).json({ error: err.message });
  }
};