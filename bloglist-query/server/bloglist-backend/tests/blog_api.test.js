const { test, describe, after, beforeEach, before } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const helper = require("./test_helper");
const User = require("../models/user");
const Blog = require("../models/blog");

const api = supertest(app);

const testUser = {
  name: "Test User",
  username: "testuser",
  password: "password123",
};

let token;
let userId;

describe("When there are initially some blogs", () => {
  before(async () => {
    await User.deleteMany({});
    let response = await api.post("/api/users").send(testUser);
    userId = response.body.id;

    response = await api.post("/api/login").send(testUser);
    token = response.body.token;
  });

  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(
      helper.initialBlogs.map((blog) => ({ ...blog, user: userId }))
    );
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api
      .get("/api/blogs")
      .set({ Authorization: `Bearer ${token}` });

    assert.strictEqual(response._body.length, helper.initialBlogs.length);
  });

  test("a specific blog is within the returned blogs", async () => {
    const response = await api
      .get("/api/blogs")
      .set({ Authorization: `Bearer ${token}` });

    const titles = response._body.map((e) => e.title);
    assert(titles.includes("React patterns"));
  });
});

describe("Viewing a specific blog", () => {
  test("succeeds with a valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();

    const blogToView = blogsAtStart[0];

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect("Content-Type", /application\/json/);
    assert.deepStrictEqual(resultBlog.body.id, blogToView.id);
  });

  test("fails with statuscode 404 if blog does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId();

    await api
      .get(`/api/blogs/${validNonExistingId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });

  test("fails with statuscode 400 id is invalid", async () => {
    const invalidId = "685f3098185";

    await api
      .get(`/api/notes/${invalidId}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(404);
  });
});

describe("Addition of a new blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(
      helper.initialBlogs.map((blog) => ({ ...blog, user: userId }))
    );
  });

  test("succeeds with valid data", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

    const titles = blogsAtEnd.map((n) => n.title);
    assert(titles.includes("Canonical string reduction"));
  });

  test("blog without likes in request is added with 0 likes", async () => {
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newBlog)
      .expect(201);
    const blogsAtEnd = await helper.blogsInDb();

    const titles = blogsAtEnd.map((blog) => blog.title);
    assert(titles.includes(newBlog.title));

    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    assert(blogsAtEnd[blogsAtEnd.length - 1].likes === 0);
  });

  test("fails if token is not set", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(401)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

    const titles = blogsAtEnd.map((n) => n.title);
    assert(!titles.includes("Test Blog"));
  });

  test("blog without title or url is not added", async () => {
    const blogWithNoAuthor = {
      title: "Canonical string reduction",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blogWithNoAuthor)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);

    const blogWithNoUrl = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blogWithNoUrl)
      .expect(400);

    const blogsAtEndT = await helper.blogsInDb();
    assert.strictEqual(blogsAtEndT.length, helper.initialBlogs.length);
  });
});

describe("Deletion of a blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(
      helper.initialBlogs.map((blog) => ({ ...blog, user: userId }))
    );
  });

  test("succeeds with status code 204 if id is valid", async () => {
    blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    const titles = blogsAtEnd.map((b) => b.title);

    assert(!titles.includes(blogToDelete.title));
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
  });
});

describe("Other tests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  test("the identificator is id", async () => {
    const blogs = await helper.blogsInDb();
    const identificators = blogs.map((blog) => blog.id);
    assert(identificators);
  });
});

describe("Edition of a blog", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(
      helper.initialBlogs.map((blog) => ({ ...blog, user: userId }))
    );
  });

  test("succeeds with valid id", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const editedBlog = {
      title: "Updated Title",
      author: "Updated Author",
      url: "Updated url",
      likes: blogToUpdate.likes + 1,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(editedBlog)
      .expect(200)

    const updatedBlog = await Blog.findById(blogToUpdate.id);

    assert.strictEqual(updatedBlog.title, editedBlog.title);
    assert.strictEqual(updatedBlog.author, editedBlog.author);
    assert.strictEqual(updatedBlog.url, editedBlog.url);
    assert.strictEqual(updatedBlog.likes, editedBlog.likes);
  });
});

after(async () => {
  await mongoose.connection.close();
});
