const path = require("path");
const express = require("express");
const hbs = require("hbs");
require("./db/mongoose");
const Post = require("./model/post");
const postRouter = require("./router/posts");
const userRouter = require("./router/user");
const { processDate } = require("./utils/date");

const app = express();
const port = process.env.PORT || 3000;

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

app.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: "author",
        select: "name _id",
      })
      .lean(); // lean returns a plain JS object without the mongoose methods (i had to, createdAt was acting up)
    posts.forEach((post) => {
      post.createdAt = processDate(post.createdAt);
    });
    const num = Math.floor(Math.random() * 10) + 1;
    res.render("index", { posts, pickNum: { num } });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

app.listen(port, () => {
  console.log("Listening at localhost:" + port);
});
