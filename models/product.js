const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
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
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory",
        required: true,
    },
});

exports.Product = mongoose.model("Product", productSchema);
