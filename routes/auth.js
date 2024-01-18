const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const isAuthenticated = require("../middleware/isAuthenticated");

const saltRounds = 10;

// POST  /auth/signup
// ...
router.post("/signup", (req, res, next) => {
  const { email, password, username } = req.body;

  // Check if the email or password or username is provided as an empty string
  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password" });
    return;
  }

  // Use regex to validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // Use regex to validate the password format
  // const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  // if (!passwordRegex.test(password)) {
  //   res.status(400).json({ message: 'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.' });
  //   return;
  // }

  // Check the users collection if a user with the same email already exists
  User.findOne({ email })
    .then((foundUser) => {
      // If the user with the same email already exists, send an error response
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      // If the email is unique, proceed to hash the password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Create a new user in the database
      // We return a pending promise, which allows us to chain another `then`
      User.create({ email, password: hashedPassword, username })
        .then((createdUser) => {
          // Deconstruct the newly created user object to omit the password
          // We should never expose passwords publicly
          const { email, username, photo, _id, cart } = createdUser;

          // Create a new object that doesn't expose the password
          const payload = { email, username, photo, _id, cart };

          const authToken = jwt.sign(payload, process.env.SECRET, {
            algorithm: "HS256",
            expiresIn: "6h",
          });

          // Send the token as the response
          res.status(200).json({ authToken });
        })
        .catch((error) => {
          if (error instanceof mongoose.Error.ValidationError) {
            console.log("This is the error ===>", error);
            res.status(501).json(error);
          } else if (error.code === 11000) {
            console.log("Invalid username, email or password.");
            res.status(502).json(error);
          } else {
            res.status(503).json(error);
          }
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    });
});

// POST  /auth/login
// ...
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check if email or password are provided as empty string
  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check the users collection if a user with the same email exists
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        // If the user is not found, send an error response
        res.status(401).json({ message: "Incorrect Email or Password" });
        return;
      }

      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Deconstruct the user object to omit the password
        const { _id, email, username, photo, cart } = foundUser;

        // Create an object that will be set as the token payload
        const payload = { _id, email, username, photo, cart };

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        // Send the token as the response
        res.status(200).json({ authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});
// GET  /auth/verify

router.get("/verify", isAuthenticated, (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the
  // isAuthenticated middleware and made available on `req.user`
  console.log("req.user", req.user);

  // Send back the object with user data
  // previously set as the token payload
  res.status(200).json(req.user);
});
// ...

module.exports = router;