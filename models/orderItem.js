const mongoose = require("mongoose");

// orderItem Class
const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
});

exports.OrderItem = mongoose.model("OrderItems", orderItemSchema);
