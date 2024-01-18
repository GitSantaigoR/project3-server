const { model, Schema } = require("mongoose");

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    format: { type: String },
    pages: { type: Number
        // , required: true 
    },
    genres: { type: String
        // , required: true 
    },
    image: { type: String
        // , required: true 
    },
    price: { type: Number
        // , required: true 
    },
    condition: { type: String },
    sold: { type: Boolean, default: false },
    // inCart: { type: Boolean, default: false },
    sent: { type: Boolean, default: false },
    seller: { type: Schema.Types.ObjectId, ref: "User" },
    // inCart: { type: Schema.Types.ObjectId, ref: "Cart" }
  },

  {
    timestamps: true,
  }
);

module.exports = model("Book", bookSchema);
