const path = require("path");
const express = require("express");
require("./db/mongoose");
const Post = require("./model/post");
const postRouter = require("./router/posts");
// const hbs = require("hbs");

const app = express();
const port = process.env.PORT || 3000;

// paths for express config
const publicPath = path.join(__dirname, "..", "public");
const viewsPath = path.join(__dirname, "..", "templates", "views");

// handlebars setup
app.set("view engine", "hbs");
app.set("views", viewsPath);

// static directory
app.use(express.static(publicPath));

app.use(express.json());
app.use("/post", postRouter);

app.get("/", async (req, res) => {
  const posts = await Post.find();
  res.render("index", { posts });
});

app.listen(port, () => {
  console.log("Listening at localhost:" + port);
});
