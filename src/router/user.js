const express = require("express");
const mongoose = require("mongoose");
const User = require("../model/user");
const auth = require("../middleware/auth");

const router = new express.Router();

// To sign up
router.post("/", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/me", auth, async (req, res) => {
  await req.user.populate("posts");
  res.send({ user: req.user, posts: req.user.posts });
});

router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const user = await User.findById(id);
    res.send(user);
  } catch (error) {
    req.status(500).send();
  }
});

router.post("/follow/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const user = await User.findById(id);
    user.addToSetIfNotExists({ user: req.user._id }, "followers");
    req.user.addToSetIfNotExists({ user: user._id }, "following");
    await user.save();
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/me/followers", auth, async (req, res) => {
  try {
    await req.user.populate({
      path: "followers.user",
      select: "-followers -following",
    });
    res.send(req.user.followers);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/me/following", auth, async (req, res) => {
  try {
    await req.user.populate({
      path: "following.user",
      select: "-followers -following",
    });
    res.send(req.user.following);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidUpdates = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidUpdates) {
    return res.status(400).send({ error: "Invalid update" });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    await user.deleteOne();
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

async function meme() {
  try {
    const user = await User.findById("640ab5cbea3d231a4f13b882");

    await user.populate("posts");
    // console.log(user);
    console.log(user.posts);
  } catch (error) {
    console.log(error);
  }
}

// meme();

module.exports = router;
