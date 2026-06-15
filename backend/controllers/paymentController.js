require("dotenv").config()
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmation } = require("../utils/sendEmail");

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

// STEP 1 — Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay is not configured on the server." });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.log("createOrder error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// STEP 2 — Verify payment and save order
exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      address,
      itemId,
      couponCode
    } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay is not configured on the server." });
    }

    // verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // get cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    // filter by itemId if provided
    const cartItems = itemId
      ? cart.items.filter(item => item._id.toString() === itemId.toString())
      : cart.items;

    const items = cartItems
      .filter(item => item.productId)
      .map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        image: item.productId.image,
        quantity: item.quantity,
      }));

    // check stock
    for (const item of cartItems) {
      if (!item.productId) continue;
      if (item.productId.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${item.productId.name}` });
      }
    }

    // reduce stock
    for (const item of cartItems) {
      if (!item.productId) continue;
      await Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    let total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discount = 0;
    if (couponCode) {
      const code = couponCode.toUpperCase();
      if (code === "DEAL20") {
        discount = total * 0.2;
      } else if (code === "WELCOME10") {
        discount = total * 0.1;
      }
      total = Math.max(0, total - discount);
    }

    // save order
    const order = new Order({
      userId, items, address, total,
      paymentMethod: "Razorpay",
      paymentId: razorpay_payment_id,
      status: "Placed",
      couponCode: couponCode || "",
      discount
    });
    await order.save();

    // clear cart
    if (itemId) {
      await Cart.updateOne({ userId }, { $pull: { items: { _id: itemId } } });
    } else {
      await Cart.updateOne({ userId }, { $set: { items: [] } });
    }

    // send email confirmation
    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendOrderConfirmation(user.email, order);
        console.log("Payment order confirmation email sent to:", user.email);
      }
    } catch (emailErr) {
      console.log("Email sending error:", emailErr.message);
    }

    res.json({ message: "Payment successful", order });
  } catch (err) {
    console.log("verifyPayment error:", err.message);
    res.status(500).json({ error: err.message });
  }
};