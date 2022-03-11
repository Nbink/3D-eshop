const mongoose = require("mongoose");

// order Class
const orderSchema = mongoose.Schema({
    orderItems: [
        {
            // Allows for referenct to orderItem by id
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true,
        },
    ],
    shippingAddress1: {
        type: String,
        required: true,
    },
    shippingAddress2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Pending",
    },
    totalPrice: {
        type: Number,
    },
    // Allows for reference to User by id
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
});

exports.Order = mongoose.model("Order", orderSchema);
