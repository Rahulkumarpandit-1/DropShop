require("dotenv").config()
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmation } = require("../utils/sendEmail");
const { validateCouponHelper } = require("./couponController");
const { validateAddressDetails } = require("./profileController");

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

    if (!address) {
      return res.status(400).json({ error: "Address details are required." });
    }
    const validationError = validateAddressDetails(address, true);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const sanitizedAddress = {
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim().replace(/\s/g, "")
    };

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
      .map(item => {
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

        return {
          productId: item.productId._id,
          name,
          price,
          image,
          quantity: item.quantity,
          variantSku: item.variantSku || "",
          selectedAttributes: item.selectedAttributes || {}
        };
      });

    // check stock
    for (const item of cartItems) {
      if (!item.productId) continue;
      if (item.variantSku) {
        const variant = item.productId.variants?.find(v => v.sku === item.variantSku);
        if (!variant || variant.stock < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${item.productId.name} (${item.variantSku || "Variant"})` });
        }
      } else {
        if (item.productId.stock < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${item.productId.name}` });
        }
      }
    }

    // reduce stock
    for (const item of cartItems) {
      if (!item.productId) continue;
      if (item.variantSku) {
        await Product.updateOne(
          { _id: item.productId._id, "variants.sku": item.variantSku },
          { $inc: { "variants.$.stock": -item.quantity } }
        );
      } else {
        await Product.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    let total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    let discount = 0;
    if (couponCode) {
      const couponResult = await validateCouponHelper(couponCode, total);
      if (couponResult.error) {
        return res.status(400).json({ error: couponResult.error });
      }
      discount = couponResult.discount;
      total = Math.max(0, total - discount);
    }

    // save order
    const order = new Order({
      userId, items, address: sanitizedAddress, total,
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