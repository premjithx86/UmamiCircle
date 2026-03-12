const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const User = require("../src/models/User");
const Post = require("../src/models/Post");
const Recipe = require("../src/models/Recipe");

let mongoServer;
let adminToken;

beforeAll(async () => {
  process.env.JWT_ADMIN_SECRET = "testsecret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const admin = new Admin({
    username: "contentadmin",
    email: "contentadmin@test.com",
    password: "password123",
    role: "Admin",
  });
  await admin.save();

  const loginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "contentadmin@test.com",
      password: "password123",
    });
  
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin Content Management", () => {
  let testUser;

  beforeEach(async () => {
    await Post.deleteMany({});
    await Recipe.deleteMany({});
    await User.deleteMany({});
    
    testUser = await new User({
      firebaseUID: "test-uid",
      username: "testuser",
      name: "Test User",
      email: "test@user.com",
    }).save();
  });

  describe("Post Management", () => {
    it("should list all posts", async () => {
      await new Post({
        user: testUser._id,
        caption: "Post 1",
        imageUrl: "http://example.com/1.jpg",
        imageHash: "hash1",
      }).save();
      await new Post({
        user: testUser._id,
        caption: "Post 2",
        imageUrl: "http://example.com/2.jpg",
        imageHash: "hash2",
      }).save();

      const res = await request(app)
        .get("/api/admin/content/posts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should search posts by caption", async () => {
      await new Post({
        user: testUser._id,
        caption: "Find this post",
        imageUrl: "http://example.com/1.jpg",
        imageHash: "hash1",
      }).save();
      await new Post({
        user: testUser._id,
        caption: "Something else",
        imageUrl: "http://example.com/2.jpg",
        imageHash: "hash2",
      }).save();

      const res = await request(app)
        .get("/api/admin/content/posts?search=find")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].caption).toBe("Find this post");
    });

    it("should filter posts by moderation status", async () => {
      await new Post({
        user: testUser._id,
        caption: "Safe Post",
        imageUrl: "http://example.com/1.jpg",
        imageHash: "hash1",
        moderationStatus: "approved",
      }).save();
      await new Post({
        user: testUser._id,
        caption: "Flagged Post",
        imageUrl: "http://example.com/2.jpg",
        imageHash: "hash2",
        moderationStatus: "flagged",
      }).save();

      const res = await request(app)
        .get("/api/admin/content/posts?status=flagged")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].caption).toBe("Flagged Post");
    });

    it("should delete a post", async () => {
      const post = await new Post({
        user: testUser._id,
        caption: "Delete me",
        imageUrl: "http://example.com/1.jpg",
        imageHash: "hash1",
      }).save();

      const res = await request(app)
        .delete(`/api/admin/content/posts/${post._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const found = await Post.findById(post._id);
      expect(found).toBeNull();
    });

    it("should return 404 when deleting non-existent post", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/admin/content/posts/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Recipe Management", () => {
    it("should list all recipes", async () => {
      await new Recipe({
        user: testUser._id,
        title: "Recipe 1",
        description: "Desc 1",
        ingredients: ["ing 1"],
        steps: ["step 1"],
        imageUrl: "http://example.com/r1.jpg",
        imageHash: "rhash1",
      }).save();
      
      const res = await request(app)
        .get("/api/admin/content/recipes")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
    });

    it("should search recipes by title", async () => {
      await new Recipe({
        user: testUser._id,
        title: "Pasta Carbonara",
        description: "Delicious pasta",
        ingredients: ["pasta"],
        steps: ["cook"],
        imageUrl: "http://example.com/r1.jpg",
        imageHash: "rhash1",
      }).save();

      const res = await request(app)
        .get("/api/admin/content/recipes?search=carbonara")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe("Pasta Carbonara");
    });

    it("should delete a recipe", async () => {
      const recipe = await new Recipe({
        user: testUser._id,
        title: "Delete me",
        description: "Desc",
        ingredients: ["ing"],
        steps: ["step"],
        imageUrl: "http://example.com/r1.jpg",
        imageHash: "rhash1",
      }).save();

      const res = await request(app)
        .delete(`/api/admin/content/recipes/${recipe._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const found = await Recipe.findById(recipe._id);
      expect(found).toBeNull();
    });

    it("should return 404 when deleting non-existent recipe", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/admin/content/recipes/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
