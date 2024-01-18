var express = require("express");
var router = express.Router();

const jwt = require("jsonwebtoken");

var stripe = require("stripe")(process.env.STRIPE);

const Cart = require("../models/Cart");
const Book = require('../models/Book');
const User = require('../models/User')
const Transaction = require("../models/Transaction");

const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/checkout/:cartId", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.user._id;

    console.log("This is the userId", userId)
    const cart = await Cart.findById(req.params.cartId).populate("books");
    console.log("this is the found cart", cart)
    if (!cart || cart.books.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const calcTotal = Number((cart.total * 100).toFixed(2));

    console.log("CalcTotal", calcTotal)

    const lineItems = [{
      price_data: {
        currency: "usd",
        unit_amount: calcTotal,
        product_data: {
          name: "Santiago's Bookstore Purchase",
        },
      },
      quantity: 1,
    }];

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.REACT_APP_URI}/success`,
      cancel_url: `${process.env.REACT_APP_URI}/cancel`,
    });



    // const transaction = new Transaction({
    //   user: userId,
    //   amount: total,
    //   currency: "usd",
    //   status: "pending",
    // //   paymentIntentId: session.payment_intent,
    // });
    // await transaction.save();

    // cart.books = [];
    // cart.subtotal = 0;
    // cart.total = 0;
    // await cart.save();

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/success/:cartId", isAuthenticated, async (req, res, next) => {

  try {
    let thisCart = await Cart.findById(req.params.cartId)
    let populatedCart = await thisCart.populate({path: 'books', populate: {path: "seller"}})
    let bookPromises = populatedCart.books.map((book) => {
      return Book.findByIdAndUpdate(book._id, {sold: true}, {new: true}).populate('seller')
    })

    let soldBooks = await Promise.all(bookPromises)

    console.log(soldBooks)

    let deletedCart = await Cart.findByIdAndDelete(req.params.cartId)

    console.log(deletedCart)

    let newUserCart = await Cart.create({userId: req.user._id})

    let updatedUser = await User.findByIdAndUpdate(req.user._id, {cart: newUserCart._id}, {new: true})

    const { _id, email, username, photo, cart} = updatedUser;

    // Create an object that will be set as the token payload
    const payload = { _id, email, username, photo, cart};

    // Create and sign the token
    const authToken = jwt.sign(payload, process.env.SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    console.log("this is the token +++++>", authToken)

    // Send the token as the response
    res.status(200).json({ authToken });


  } catch(err) {
    console.log(err)
    res.json(err)
  }
})

module.exports = router;