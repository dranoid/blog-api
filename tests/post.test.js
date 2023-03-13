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
  postOne,
  postTwo,
  postThree,
} = require("./fixtures/db");

beforeEach(setUpDatabase);

test("Should create post for authenticated user", async () => {
  const response = await request(app)
    .post("/post/")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "O ti sumi",
      body: "Tests don tire me shaa",
    })
    .expect(201);

  // Asert that post was created with correct data and author
  const post = await Post.findOne({
    _id: response.body.post._id,
    author: userOneId,
  });
  expect(post.title).toEqual("O ti sumi");
});

test("Should not create post for unauthenticated user", async () => {
  await request(app)
    .post("/post/")
    .send({
      title: "O ti sumi",
      body: "Tests don tire me shaa",
    })
    .expect(401);
});

test("Should get specific post for unauthenticated user", async () => {
  const response = await request(app)
    .get("/post/" + postOne._id)
    .send()
    .expect(200);

  // Assert that the correct post is returned
  const post = await Post.findById(postOne._id);
  // Assert that the correct post is returned
  expect(response.type).toBe("text/html");
  expect(response.text).toContain("</html>");
  expect(response.text).toContain(post.title);
});

test("Should update specific post for authenticated user", async () => {
  const response = await request(app)
    .patch("/post/" + postOne._id)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "A meal is served",
      body: "Itadakimasu!",
    })
    .expect(200);

  // Assert that the post has been updated
  const post = await Post.findById(postOne._id);
  expect(post.title).toEqual(response.body.post.title);
  expect(post.body).not.toEqual(userOne.body);
});

test("Should not update specific post for unauthenticated user", async () => {
  await request(app)
    .patch("/post/" + postOne._id)
    .send({
      title: "A meal is served",
      body: "Itadakimasu!",
    })
    .expect(401);
});

test("Should delete specific post for authenticated user", async () => {
  const response = await request(app)
    .delete("/post/" + postOne._id)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  // Assert that the post has been deleted
  const post = await Post.findById(postOne._id);
  expect(post).toBeNull();
  expect(response.body.post._id.toString()).toEqual(postOne._id.toString());
});

test("Should not delete specific post for unauthenticated user", async () => {
  await request(app)
    .delete("/post/" + postOne._id)
    .send()
    .expect(401);
});

test("Should comment on a post", async () => {
  await request(app)
    .post("/post/" + postOne._id + "/comment")
    .send({
      comments: [
        {
          text: "Oro re!",
        },
      ],
    })
    .expect(201);

  // Assert that comment has been made
  const post = await Post.findById(postOne._id);
  expect(post.comments[0].text).toEqual("Oro re!");
});

// Test creating a new post:

// Ensure that a new post is created in the database with the correct data.
// Ensure that an authenticated user is required to create a post.
// Test retrieving all posts:

// Ensure that all posts are returned in the correct order.
// Ensure that the response includes the correct number of posts.
// Test retrieving a single post:

// Ensure that the correct post is returned when providing a valid post ID.
// Ensure that an error is returned when providing an invalid post ID.
// Test updating a post:

// Ensure that an authenticated user is required to update a post.
// Ensure that the correct post is updated with the provided data.
// Test deleting a post:

// Ensure that an authenticated user is required to delete a post.
// Ensure that the correct post is deleted from the database.
// Test commenting on a post:

// Ensure that a comment is added to the correct post.
// Ensure that an error is returned when providing an invalid post ID.
// Ensure that an authenticated user is not required to comment on a post.
// Test user authentication:

// Ensure that an authenticated user can create a post, update a post, and delete a post.
// Ensure that an unauthenticated user cannot create a post, update a post, or delete a post.
// Test error handling:
