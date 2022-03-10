const {
    ProductCategory,
    productCategory,
} = require("../models/productCategory");
const express = require("express");
const router = express.Router();

router.get(`/`, async (req, res) => {
    const productCategoryList = await ProductCategory.find();
    if (!productCategoryList) {
        res.status(500).json({ success: false });
    }
    res.status(200).send(productCategoryList);
});

router.get("/:id", async (req, res) => {
    const productCategory = await ProductCategory.findById(req.params.id);

    if (!productCategory) {
        res.status(500).send("No category with given ID");
    }
    res.status(200).send(productCategory);
});

router.post(`/`, async (req, res) => {
    let productCategory = new ProductCategory({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });

    productCategory = await productCategory.save();

    if (!productCategory) {
        return res.status(500).send("The category cannot be created");
    }
    res.send(productCategory);
});

router.put("/:id", async (req, res) => {
    const productCategory = await ProductCategory.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true }
    );
    if (!productCategory) {
        return res.status(400).send("the category cannot be updated");
    }
    res.send(productCategory);
});

router.delete(`/:id`, async (req, res) => {
    const productCategory = await ProductCategory.findByIdAndRemove(
        req.params.id
    );

    if (!productCategory) {
        return res.status(404).send("the category was not found");
    } else {
        productCategory.remove();
        res.status(200).send("the category was deleted");
    }
});

module.exports = router;
