const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const User = require("../src/models/User");
const Post = require("../src/models/Post");

let mongoServer;
let adminToken;

beforeAll(async () => {
  process.env.JWT_ADMIN_SECRET = "testsecret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create an admin and get a token
  const admin = new Admin({
    username: "dashadmin",
    email: "dash@admin.com",
    password: "password123",
    role: "Admin",
  });
  await admin.save();

  const loginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "dash@admin.com",
      password: "password123",
    });
  
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin Dashboard Stats", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
  });

  it("should fail to access stats without authorization", async () => {
    const res = await request(app).get("/api/admin/dashboard/stats");
    expect(res.status).toBe(401);
  });

  it("should return correct platform metrics", async () => {
    // Seed some users
    const user1 = new User({
      firebaseUID: "uid1",
      username: "user1",
      name: "User One",
      email: "user1@test.com",
    });
    const user2 = new User({
      firebaseUID: "uid2",
      username: "user2",
      name: "User Two",
      email: "user2@test.com",
    });
    await user1.save();
    await user2.save();

    // Seed some posts
    const post1 = new Post({
      user: user1._id,
      caption: "Post 1",
      imageUrl: "http://example.com/image1.jpg",
      imageHash: "hash1",
    });
    const post2 = new Post({
      user: user2._id,
      caption: "Post 2",
      imageUrl: "http://example.com/image2.jpg",
      imageHash: "hash2",
    });
    await post1.save();
    await post2.save();

    const res = await request(app)
      .get("/api/admin/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBe(2);
    expect(res.body.totalPosts).toBe(2);
    expect(res.body.totalRecipes).toBe(0);
    expect(res.body.dailyPosts).toBe(2);
    expect(res.body.activeUsers).toBeGreaterThanOrEqual(0);
  });

  it("should return zeros when collections are empty", async () => {
    // beforeEach already clears User and Post collections
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBe(0);
    expect(res.body.totalPosts).toBe(0);
    expect(res.body.totalRecipes).toBe(0);
  });
});
