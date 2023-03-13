const path = require("path");
const express = require("express");
const hbs = require("hbs");
require("./db/mongoose");
const postRouter = require("./router/posts");
const userRouter = require("./router/user");

const app = express();

// paths for express config
const publicPath = path.join(__dirname, "..", "public");
const viewsPath = path.join(__dirname, "..", "templates", "views");
const partialsPath = path.join(__dirname, "..", "templates", "partials");

// handlebars setup
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

// static directory
app.use(express.static(publicPath));

app.use(express.json());
app.use("/post", postRouter);
app.use("/users", userRouter);

module.exports = app;
