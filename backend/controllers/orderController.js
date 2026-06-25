const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const { sendOrderConfirmation, sendOrderStatusUpdateEmail } = require("../utils/sendEmail");
const { validateCouponHelper } = require("./couponController");
const { validateAddressDetails } = require("./profileController");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, itemId, couponCode } = req.body;

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

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ error: "Cart is empty" });

    const cartItems = itemId
      ? cart.items.filter(item => item._id.toString() === itemId)
      : cart.items;

    // build items
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

    // 1️⃣ save order first
    const order = new Order({ 
      userId, 
      items, 
      address: sanitizedAddress, 
      total, 
      couponCode: couponCode || "", 
      discount 
    });
    await order.save();

    // 2️⃣ clear cart after order saved
    if (itemId) {
      await Cart.updateOne({ userId }, { $pull: { items: { _id: itemId } } });
    } else {
      await Cart.updateOne({ userId }, { $set: { items: [] } });
    }

    // 3️⃣ send email after order saved
    try {
      const user = await User.findById(userId);
      if (user?.email) {
        await sendOrderConfirmation(user.email, order);
        console.log("Email sent to:", user.email);
      }
    } catch (emailErr) {
      console.log("Email error:", emailErr.message); // don't fail order if email fails
    }

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.log("placeOrder error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL ORDERS FOR USER
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.log("getOrders error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({
      orderId: order._id,
      currentStatus: order.trackingStatus,
      estimatedDelivery: order.estimatedDelivery,
      history: order.trackingHistory||[],
      address: order.address,
      items: order.items,
      paymentMethod: order.paymentMethod,
      total: order.total
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.AdminUpdateStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    // 1. Validate status
    const validStatuses = ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    // 2. Build update object
    const updateData = {
      trackingStatus: status,
      $push: {
        trackingHistory: {
          status,
          message: message || `Order ${status}`,
          timestamp: new Date(),
        },
      },
    };

    // 3. Auto-set ETA only when status is Shipped
    if (status === "Shipped") {
      const eta = new Date();
      eta.setDate(eta.getDate() + 5);
      updateData.estimatedDelivery = eta;
    }

    // 4. Single DB call
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      updateData,
      { new: true }
    );

    // 5. Check if order exists
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Send email notification asynchronously
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        sendOrderStatusUpdateEmail(user.email, order, status, message || `Your order status has been updated to ${status}.`).catch(emailErr => {
          console.error("Failed to send order status update email:", emailErr.message);
        });
      }
    } catch (emailErr) {
      console.log("Failed to fetch user for email notification:", emailErr.message);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.log("getAllOrdersAdmin error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id;
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "Placed" && order.status !== "Confirmed") {
      return res.status(400).json({ error: "Order cannot be cancelled at this stage" });
    }

    // Restock product inventory
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = "Cancelled";
    order.trackingStatus = "Cancelled";
    order.trackingHistory.push({
      status: "Cancelled",
      message: "Order cancelled by user",
      timestamp: new Date()
    });

    await order.save();

    // Send email notification asynchronously
    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        sendOrderStatusUpdateEmail(user.email, order, "Cancelled", "Your order has been successfully cancelled.").catch(emailErr => {
          console.error("Failed to send order status update email for cancellation:", emailErr.message);
        });
      }
    } catch (emailErr) {
      console.log("Failed to fetch user for email notification on cancellation:", emailErr.message);
    }

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("cancelOrder error:", err.message);
    res.status(500).json({ error: err.message });
  }
};