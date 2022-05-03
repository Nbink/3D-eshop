const mongoose = require("mongoose");

// product Class
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    richDescription: {
        type: String,
    },
    image: {
        type: String,
        default: "",
    },
    images: [
        {
            type: String,
        },
    ],
    price: {
        type: Number,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    countInStock: {
        type: Number,
        default: 0,
        required: true,
    },
    category: {
        // Allows for reference to category by id
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
});

exports.Product = mongoose.model("Product", productSchema);
