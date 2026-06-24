const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          variantSku: {
            type: String,
            default: ""
          },
          selectedAttributes: {
            type: Map,
            of: String,
            default: {}
          },
          quantity: {
            type: Number,
            default: 1,
          },
        },
      ],
      default: [], 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);