const { Product } = require("../models/product");
const { ProductCategory } = require("../models/productCategory");
const express = require("express");
const router = express.Router();

// products REST APIs

// get a list of products
router.get(`/`, async (req, res) => {
    let filter = {};

    if (req.query.category) {
        filter = { category: req.query.category.split(",") };
    }

    // Rather than display category by id, populate() fills out the
    // the information about that category
    const productList = await Product.find(filter).populate("category");

    if (!productList) {
        res.status(500).send("Could not find products");
    }
    res.send(productList);
});

// Get a specific product by id
router.get(`/:id`, async (req, res) => {
    // Populate category metadata rather than display id of category
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
        res.status(500).send("Invalid product ID");
    }
    res.send(product);
});

// Get a count of how many products
router.get(`/get/count`, async (req, res) => {
    // Have to use clone() because of the way mongoose runs queries
    const productCount = await Product.countDocuments((count) => count).clone();
    if (!productCount) {
        res.status(500).send("No products found");
    }
    res.send({
        Count: productCount,
    });
});

// Get a list of products with isFeatured: true
router.get(`/get/featured`, async (req, res) => {
    const products = await Product.find({ isFeatured: true });
    if (!products) {
        res.status(500).send("No products found");
    }
    res.send(products);
});

// Post a new product
router.post(`/`, async (req, res) => {
    // Checks to make sure you are posting to an existing category
    const productCategory = await ProductCategory.findById(req.body.category);
    if (!productCategory) return res.status(400).send("Invalid Category");

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        images: req.body.images,
        price: req.body.price,
        isFeatured: req.body.isFeatured,
        countInStock: req.body.countInStock,
        category: req.body.category,
    });

    product = await product.save();

    if (!product) return res.status(500).send("The product cannot be created");

    return res.send(product);
});

// Put/Update a specific product
router.put("/:id", async (req, res) => {
    // Checks to make sure you are posting to an existing category
    const productCategory = await ProductCategory.findById(req.body.category);
    if (!productCategory) return res.status(400).send("Invalid Category");

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            images: req.body.images,
            price: req.body.price,
            isFeatured: req.body.isFeatured,
            countInStock: req.body.countInStock,
            category: req.body.category,
        },
        // Option to allow return data to show the updated version of the object
        { new: true }
    );
    if (!product) {
        return res.status(500).send("The product cannot be updated");
    }
    res.send(product);
});

// Delete specific product by id
router.delete(`/:id`, async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id);

    if (!product) {
        return res.status(404).send("the product was not found");
    } else {
        product.remove();
        res.status(200).send("the product was deleted");
    }
});

module.exports = router;
