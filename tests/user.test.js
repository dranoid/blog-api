const request = require("supertest");
const app = require("../src/app");
const User = require("../src/model/user");
const Post = require("../src/model/post");
const {
  userOne,
  userOneId,
  setUpDatabase,
  userTwo,
  userTwoId,
} = require("./fixtures/db");

beforeEach(setUpDatabase);

test("should sign up user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Daramola dunsin",
      email: "dayuum@gmail.com",
      password: "weenniew",
    })
    .expect(201);
  // Assert that the user was created in the db
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  // Assert that the password was hashed
  expect(user.password).not.toEqual("weenniew");
});

test("should not sign up user with invalid data", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Darams",
      email: "werey",
      password: "ion",
    })
    .expect(400);
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  // Assert that the user was logged in
  const user = await User.findById(response.body.user._id);
  expect(user.name).toEqual(userOne.name);
  expect(user.tokens.length).toBeGreaterThan(1);
  expect(response.body.token).toEqual(user.tokens[1].token);
});

test("Should not login non existing user", async () => {
  //Non existing user
  await request(app)
    .post("/users/login")
    .send({
      email: "olaba@gmail.com",
      password: "lolaaaa1!",
    })
    .expect(400);
});

test("Should not login user with invalid data", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "olaba",
      password: "lol!",
    })
    .expect(400);
});

test("Should logout authenticated user", async () => {
  await request(app)
    .post("/users/logout")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert user was logged out
  const user = await User.findById(userOneId);
  expect(user.tokens.length).toEqual(0);
});

test("Should reject logout of unauthenticated user", async () => {
  await request(app).post("/users/logout").send().expect(401);
});

test("Should get profile of authorised user", async () => {
  const response = await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert correct profile was recieved
  expect(response.body.user.name).toEqual(userOne.name);
  expect(response.body.user.email).toEqual(userOne.email);

  // Assert that password and tokens aren't part of the object
  expect(response.body.user.password).toBe(undefined);
  expect(response.body.user.tokens).toBe(undefined);
});

test("Should not get profile of unauthorised user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should render html for unauthorized users", async () => {
  const response = await request(app)
    .get("/users/" + userOneId)
    .send()
    .expect(200);

  // Assert that its the correct response
  expect(response.type).toBe("text/html");
  expect(response.text).toContain("</html>");
});

test("Should follow specified user", async () => {
  await request(app)
    .post("/users/follow/" + userTwoId)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user1 = await User.findById(userOneId);
  const user2 = await User.findById(userTwoId);

  // Assert that the follow relationship is es
  expect(user1.following[0].user).toEqual(userTwoId);
  expect(user2.followers[0].user).toEqual(userOneId);
});

test("Should return list of followers for authorised user", async () => {
  const response = await request(app)
    .get("/users/me/followers")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that an array is returned
  expect(response.body.length).not.toBe(undefined);
});

test("Should not return list of followers for unauthorised user", async () => {
  await request(app).get("/users/me/followers").send().expect(401);
});

test("Should return list of following for authorised user", async () => {
  const response = await request(app)
    .get("/users/me/following")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that an array is returned
  expect(response.body.length).not.toBe(undefined);
});

test("Should not return list of following for unauthorised user", async () => {
  await request(app).get("/users/me/following").send().expect(401);
});

test("Should update details for authorised user", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Siyan Bola",
      email: "kamap@gmail.com",
    })
    .expect(200);

  // Assert that user was updated in the db
  const user = await User.findById(userOneId);
  expect(user.name).toEqual("Siyan Bola");
  expect(user.email).toEqual("kamap@gmail.com");
});

test("Should not update invalid details for authorised user", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Siyan Bola",
      email: "kamap",
    })
    .expect(400);

  // Assert that user was updated in the db
  const user = await User.findById(userOneId);
  expect(user.name).toEqual(userOne.name);
  expect(user.email).toEqual(userOne.email);
});

test("Should not update details for unauthorised user", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "Siyan Bola",
      email: "kamap@gmail.com",
    })
    .expect(401);
});

test("Should delete user profile and associated posts", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that user has been deleted
  const user = await User.findById(userOneId);
  expect(user).toBeNull();
  const posts = await Post.find({ author: userOneId });
  expect(posts.length).toBe(0);
});

test("Should not delete user profile and associated posts for unauthenticated users", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
