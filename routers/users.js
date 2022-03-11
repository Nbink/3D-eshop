const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Call list of all Users WITHOUT passwordHash
router.get(`/`, async (req, res) => {
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
        res.status(500).json({ success: false });
    }
    res.send(userList);
});

// Call specific User WITHOUT passwordHash
router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
        res.status(500).send("No user with given ID");
    }
    res.status(200).send(user);
});

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 5),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });

    user = await user.save();

    if (!user) {
        return res.status(400).send("The user cannot be created");
    }
    res.send(user);
});

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).send("No user found for that email");
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
            },
            secret,
            { expiresIn: "1d" }
        );

        return res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send("Wrong password");
    }
});

router.put("/:id", async (req, res) => {
    // Allow User to decide whether or not to change their password
    const userExists = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 5);
    } else {
        newPassword = userExists.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true }
    );
    if (!user) {
        return res.status(400).send("the user cannot be updated");
    }
    res.send(user);
});

module.exports = router;
