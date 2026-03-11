const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Post = require("../src/models/Post");
const User = require("../src/models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Post Routes Integration Test", () => {
  let testUser;

  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    
    // Create a user that matches the mock authMiddleware (uid: "mock-uid-123")
    testUser = new User({
      firebaseUID: "mock-uid-123",
      username: "testuser",
      name: "Test User",
      email: "mock@example.com",
    });
    await testUser.save();
  });

  it("should create a new post with image upload and moderation", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-token")
      .field("caption", "Delicious pasta")
      .field("tags", JSON.stringify(["pasta", "italian"]))
      .attach("image", Buffer.from("dummy-image-data"), "test.jpg");

    expect(res.status).toBe(201);
    expect(res.body.caption).toBe("Delicious pasta");
    expect(res.body.imageHash).toBeDefined();
    expect(res.body.user).toBe(testUser._id.toString());
  });

  it("should detect duplicate image and return 200 with existing URL", async () => {
    const imageBuffer = Buffer.from("unique-image-data");

    // First upload
    await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-token")
      .field("caption", "First upload")
      .attach("image", imageBuffer, "test1.jpg");

    // Second upload (same image)
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-token")
      .field("caption", "Second upload")
      .attach("image", imageBuffer, "test2.jpg");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/duplicate/i);
    expect(res.body.imageUrl).toBeDefined();
  });

  it("should return 401 if unauthorized", async () => {
    const res = await request(app)
      .post("/api/posts")
      .field("caption", "No token")
      .attach("image", Buffer.from("data"), "test.jpg");

    expect(res.status).toBe(401);
  });
});
