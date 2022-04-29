const { Order } = require("../models/order");
const { OrderItem } = require("../models/orderItem");
const express = require("express");
const { identifierModuleUrl } = require("prettier");
const router = express.Router();

// order REST APIs
// NEEDS WORK

// Get a list of orders
router.get(`/`, async (req, res) => {
    const orderList = await Order.find()
        .populate("user", "name")
        .sort({ dateOrdered: -1 });
    if (!orderList) {
        res.status(500).json({ success: false });
    }
    res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("user", "name")
        .populate({
            model: OrderItem,
            path: "orderItems",
            populate: { path: "product", populate: "category" },
        });

    if (!order) {
        res.status(500).json({ success: false });
    }
    res.send(order);
});

// Post a new order
router.post(`/`, async (req, res) => {
    const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });

            newOrderItem = await newOrderItem.save();

            return newOrderItem._id;
        })
    );

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate(
                "product",
                "price"
            );
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        state: req.body.state,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
        dateOrdered: req.body.dateOrdered,
    });

    order = await order.save();

    if (!order) {
        return res.status(500).send("The category cannot be created");
    }
    res.send(order);
});

router.put("/:id", async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status,
        },
        { new: true }
    );
    if (!order) {
        return res.status(400).send("the order cannot be updated");
    }
    res.send(order);
});

router.delete(`/:id`, async (req, res) => {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) {
        return res.status(404).send("the order was not found");
    } else {
        order.remove();
        res.status(200).send("the order and order items were deleted");
    }

    await order.orderItems.map(async (orderItem) => {
        await OrderItem.findByIdAndRemove(orderItem);
    });
});

router.get("/get/totalsales", async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales) {
        return res.status(400).send("The order sales cannot be generated");
    }

    res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) => {
    // Have to use clone() because of the way mongoose runs queries
    const orderCount = await Order.countDocuments((count) => count).clone();
    if (!orderCount) {
        res.status(500).send("No products found");
    }
    res.send({
        Count: orderCount,
    });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
            model: OrderItem,
            path: "orderItems",
            populate: { path: "product", populate: "category" },
        })
        .sort({ dateOrdered: -1 });
    if (!userOrderList) {
        res.status(500).json({ success: false });
    }
    res.send(userOrderList);
});

module.exports = router;
