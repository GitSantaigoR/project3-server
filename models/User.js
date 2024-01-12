const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    username: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    photo: {
        type: String,
        default: 'https://cvhrma.org/wp-content/uploads/2015/07/default-profile-photo.jpg'
    },
    firstName: String,
    lastName: String,
    streetAddress: String,
    city: String,
    state: String,
    zip: Number,
    soldTransactions: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
    boughtTransactions: [{type: Schema.Types.ObjectId, ref: "Transaction"}],
    booksListed: [{type: Schema.Types.ObjectId, ref: "Book"}],
    booksSold:  [{type: Schema.Types.ObjectId, ref: "Book"}],
    cart: {type: Schema.Types.ObjectId, ref: "Cart"}
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
