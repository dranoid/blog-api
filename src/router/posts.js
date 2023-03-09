const express = require("express");
const mongoose = require("mongoose");
const Post = require("../model/post");

const router = new express.Router();

router.post("/", async (req, res) => {
  const post = new Post(req.body);
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
    const post = await Post.findById(id);
    res.send(post);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/:id", async (req, res) => {
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
    const post = await Post.findById(id);
    updates.forEach((update) => {
      post[update] = req.body[update];
    });

    await post.save();

    res.send(post);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const post = await Post.findByIdAndDelete(id);
    res.send(post);
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
    req.body["comments"].forEach((comment) => {
      post.comments.push(comment);
    });
    await post.save();
    res.status(201).send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
