

const { model, Schema } = require("mongoose");


const transactionSchema = new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      amount: Number,
      currency: String,
      status: String,
      paymentIntentId: String, // For Stripe paymentIntent ID
      // Other transaction-related fields
    },
    {
      timestamps: true,
    }
  );
  
  module.exports = model("Transaction", transactionSchema);