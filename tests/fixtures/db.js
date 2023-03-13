const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/model/user");
const Post = require("../../src/model/post");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Dele mayana",
  email: "del@gmail.com",
  password: "myPass123!",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Dodo shekpeteri",
  email: "pam@gmail.com",
  password: "myPass123!",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const postOne = {
  _id: new mongoose.Types.ObjectId(),
  title: "Weep for the people who are lost",
  body: "Weird title, yeah I know",
  author: userOneId,
};
const postTwo = {
  _id: new mongoose.Types.ObjectId(),
  title: "Beautiful, is your name!",
  body: "Yeah, I fw Asa.",
  author: userTwoId,
};
const postThree = {
  _id: new mongoose.Types.ObjectId(),
  title: "E rora gun ketekete",
  body: "Ebenezer should listen to his parents. In short he should obey",
  author: userOneId,
};

const setUpDatabase = async () => {
  await User.deleteMany();
  await Post.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Post(postOne).save();
  await new Post(postTwo).save();
  await new Post(postThree).save();
};

module.exports = {
  userOneId,
  userTwoId,
  userOne,
  userTwo,
  postOne,
  postTwo,
  postThree,
  setUpDatabase,
};
