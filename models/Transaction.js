const stripe = require('stripe')('pk_test_51OXoulHXWpaM9JPdLD3XO6WnFKKEpYv2fHEjBsXXy2UDnQqMlhj1iQVS9iFkgFXd9wqfG36DFqDgLxsnK87w3F5i00rSw4K0MC')

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