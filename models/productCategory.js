const mongoose = require("mongoose");

// productCategory Class
// NEEDS WORK
const productCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: {
        type: String,
    },
});

exports.ProductCategory = mongoose.model(
    "ProductCategory",
    productCategorySchema
);
