const { Schema, model } = require("mongoose");

const CartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 1.08,
    },
    total: {
      type: Number,
      default: 0,
    },
    // expireAt: { type: Date, expires: "2m", default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("Cart", CartSchema);
