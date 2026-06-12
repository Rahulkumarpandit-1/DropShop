const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{                                        // ✅ matches controller
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    image: String,
    quantity: Number,
  }],
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  total: Number,
   paymentMethod: { type: String, default: "COD" },
  paymentId: { type: String, default: "" }, // 👈 add this
  status: { type: String, default: "Placed" },

trackingStatus: {
    type: String,
    enum: ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Placed"
  },
  trackingHistory: [
    {
      status: String,
      message: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  estimatedDelivery: Date,
  couponCode: { type: String, default: "" },
  discount: { type: Number, default: 0 },
}, 
{ timestamps: true });

module.exports = mongoose.model("Order", orderSchema);