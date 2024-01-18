const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");
const User = require('../models/User')
const Book = require('../models/Book')

// GET cart by user ID

router.post('/', isAuthenticated, (req, res, next) => {
    Cart.create({
        userId: req.user._id
    })
    .then((createdCart) => {
        User.findByIdAndUpdate(req.user._id, {
            cart: createdCart._id
        }, {new: true})
        .then((updatedUser) => {
            const { _id, email, username, photo, cart } = updatedUser;

            // Create an object that will be set as the token payload
            const payload = { _id, email, username, photo, cart };
    
            // Create and sign the token
            const authToken = jwt.sign(payload, process.env.SECRET, {
              algorithm: "HS256",
              expiresIn: "6h",
            });
    
            // Send the token as the response
            res.status(200).json({ authToken });
        })
        .catch((err) => {
            res.json(err)
        })
    })
    .catch((err) => {
        res.json(err)
    })
})


router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("books");
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ADD a book to the cart
router.post("/add-book/:bookId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.bookId;

    let thisBook = await Book.findById(bookId)

    // Check if the book is already in the cart
    const existingCart = await Cart.findOne({ userId, books: bookId });
    if (existingCart) {
      return res.status(400).json({ message: "Book is already in the cart." });
    }

    // Add the book to the cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $addToSet: { books: bookId } },
      { new: true }
    )

    console.log("Updated Cart ===>", updatedCart)
    
    const populatedCart = await updatedCart.populate("books");

    populatedCart.subtotal += thisBook.price
    populatedCart.total = Number((populatedCart.subtotal * populatedCart.tax).toFixed(2))

    const finalCart = await populatedCart.save()

    console.log("This is the final cart ===>", finalCart)

    res.status(200).json(finalCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// REMOVE a book from the cart
router.post("/remove-book/:bookId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.bookId;

    let thisBook = await Book.findById(bookId)

    // Remove the book from the cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { books: bookId } },
      { new: true }
    )

    console.log("Updated Cart ===>", updatedCart)
    
    const populatedCart = await updatedCart.populate("books");

    populatedCart.subtotal -= thisBook.price
    populatedCart.total = Number((populatedCart.subtotal * populatedCart.tax).toFixed(2))

    const finalCart = await populatedCart.save()

    console.log("This is the final cart ===>", finalCart)

    res.status(200).json(finalCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// CLEAR the entire cart
router.post("/clear-cart", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // Clear the entire cart
    let clearedCart = await Cart.findOneAndUpdate({ userId }, { books: [] });

    clearedCart.subtotal = 0
    clearedCart.total = 0

    let finalCart = clearedCart.save()

    

    res.status(200).json(finalCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;