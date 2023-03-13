const express = require("express");
const mongoose = require("mongoose");
const Post = require("../model/post");
const auth = require("../middleware/auth");
const { processDate } = require("../utils/date");

const router = new express.Router();

router.post("/", auth, async (req, res) => {
  const post = new Post({ ...req.body, author: req.user._id });
  try {
    await post.save();
    res.status(201).send({ post });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.send({ posts });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }
  try {
    const post = await Post.findById(id)
      .populate({
        path: "author",
        select: "_id name",
      })
      .lean();
    if (!post) {
      return res.status(404).send();
    }
    const date = new Date(post.createdAt);
    post.createdAt = processDate(date);
    res.render("post", { post });
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["body", "title", "author"];
  const isValidUpdates = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidUpdates) {
    return res.status(400).send({ error: "Invalid update" });
  }

  try {
    const post = await Post.findOne({ _id: id, author: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    updates.forEach((update) => {
      post[update] = req.body[update];
    });

    await post.save();

    res.send({ post });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const post = await Post.findOneAndDelete({ _id: id, author: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    res.send({ post });
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/:id/comment", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send();
    }

    req.body["comments"].forEach((comment) => {
      post.comments.push(comment);
    });
    await post.save();
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
