var express = require("express");
var router = express.Router();

const isAuthenticated = require("../middleware/isAuthenticated");

const Book = require("../models/Book");

router.post("/", isAuthenticated, (req, res, next) => {
  const { title, description, author, format, pages, genres, image, price, condition, sold, sent } = req.body;

  Book.create({
    title,
    author,
    description,
    format,
    pages,
    genres,
    image,
    price,
    condition,
    sold,
    sent,
    seller: req.user._id,
  })
  .then((createBook) => {
    console.log("New Book ==>", createBook)
    res.json(createBook)

  })
  .catch((err) => {
    console.log(err)
    res.json(err)
  })
})


router.get('/', (req, res, next) => {

    Book.find({ sold: false
        // , inCart: false 
    })
    .populate('seller')
    .then((foundBook) => {
        console.log("Found Book ==>", foundBook)
        res.json(err)
    })
    .catch((err) => {
        console.log(err)
        res.json(err)
    })

})

router.get('/all-books-ever', (req, res, next) => {

    Book.find()
    .populate('seller')
    .then((foundBook) => {
        console.log("Found Book ==>", foundBook)
        res.json(err)
    })
    .catch((err) => {
        console.log(err)
        res.json(err)
    })

})

router.get('/:bookId', (req, res, next) => {
    const {bookId} = req.params
    

    Book.findById(bookId)
    .populate('seller')
    .then(book => res.status(200).json(book))
    .catch(error => res.json(error));
})

router.put('/:bookId', isAuthenticated, (req, res, next) => {
    const {bookId} =req.params


    Book.findByIdAndUpdate(bookId, req.body, {new: true})
    .then((toPopulate) => toPopulate.populate('seller'))
    .then(updatedBook => res.json(updatedBook))
    .catch(error => res.json(error));


})

router.delete('/:bookId', isAuthenticated, (req, res, next) => {
    const {bookId} = req.params


    Book.findByIdAndDelete(bookId)
    .then(() => res.json({message: `Book with ${bookId} is removed successfully.`}))
    .catch(error => res.json(error))
})





module.exports = router;

// title: { type: String, required: true },
// author: { type: String, required: true },
// description: { type: String },
// fortmat: { type: String },
// pages: { type: Number, required: true },
// genres: { type: String, required: true },
// image: { type: String, required: true },
// price: { type: Number, required: true },
// condition: { type: String },
// sold: { type: Boolean, default: false },
// sent: { type: Boolean, default: false },
// seller: { type: Schema.Types.ObjectId, ref: "User" },
