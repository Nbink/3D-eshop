// Required Libraries
const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const res = require("express/lib/response");
require("dotenv/config");
// Environmental Variables
const api = process.env.API_URL;
const uri = process.env.CONNECTION_STRING;

//Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
app.options("*", cors());
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

//Routers
const productsRouter = require("./routers/products");
const productCategoriesRouter = require("./routers/productCategories");
const ordersRouter = require("./routers/orders");
const usersRouter = require("./routers/users");

app.use(`${api}/products`, productsRouter);
app.use(`${api}/productCategories`, productCategoriesRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/users`, usersRouter);

// Database Connection
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "eshop-database",
    })
    .then(() => {
        console.log("Database connection successful!");
    })
    .catch((err) => {
        console.log(err);
    });
app.listen(3000, () => {
    console.log("server is running http://localhost:3000");
});
