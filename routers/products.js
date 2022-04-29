const { Product } = require("../models/product");
const { ProductCategory } = require("../models/productCategory");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { default: mongoose } = require("mongoose");

// products REST APIs

const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("invalid image type");

        if (isValid) {
            uploadError = null;
        }

        cb(uploadError, "public/uploads");
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname;
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

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
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
    // Checks to make sure you are posting to an existing category
    const productCategory = await ProductCategory.findById(req.body.category);
    if (!productCategory) return res.status(400).send("Invalid Category");

    const file = req.file;
    if (!file) return res.status(400).send("No image included in request");

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`,
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
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid Product Id");
    }

    // Checks to make sure you are posting to an existing category
    const productCategory = await ProductCategory.findById(req.body.category);
    if (!productCategory) return res.status(400).send("Invalid Category");

    const product = await Product.findById(req.body.id);
    if (!product) return res.status(400).send("Invalid Product");

    const file = req.file;
    let imagePath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagePath,
            price: req.body.price,
            isFeatured: req.body.isFeatured,
            countInStock: req.body.countInStock,
            category: req.body.category,
        },
        // Option to allow return data to show the updated version of the object
        { new: true }
    );
    if (!updatedProduct) {
        return res.status(500).send("The product cannot be updated");
    }
    res.send(updatedProduct);
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

// Update gallery images
router.put(
    "/gallery-images/:id",
    uploadOptions.array("images", 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send("Invalid Product Id");
        }
        const files = req.files;
        let imagePaths = [];
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagePaths.push(`${basePath}${file.filename}`);
            });
        }
        console.log(imagePaths);
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagePaths,
            },
            // Option to allow return data to show the updated version of the object
            { new: true }
        );
        if (!product) {
            return res.status(500).send("The product cannot be updated");
        }
        res.send(product);
    }
);

module.exports = router;
