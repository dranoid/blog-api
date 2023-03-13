const app = require("./app");
const Post = require("./model/post");
const { processDate } = require("./utils/date");

const port = process.env.PORT || 3000;

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
