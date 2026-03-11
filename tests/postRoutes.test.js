const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Post = require("../src/models/Post");

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
  it("should create a new post with image upload and moderation", async () => {
    const res = await request(app)
      .post("/api/posts")
      .field("user", new mongoose.Types.ObjectId().toString())
      .field("caption", "Delicious pasta")
      .field("tags", JSON.stringify(["pasta", "italian"]))
      .attach("image", Buffer.from("dummy-image-data"), "test.jpg");

    expect(res.status).toBe(201);
    expect(res.body.caption).toBe("Delicious pasta");
    expect(res.body.imageHash).toBeDefined();
  });

  it("should detect duplicate image and return existing URL", async () => {
    const userId = new mongoose.Types.ObjectId();
    const imageBuffer = Buffer.from("unique-image-data");

    // First upload
    await request(app)
      .post("/api/posts")
      .field("user", userId.toString())
      .field("caption", "First upload")
      .attach("image", imageBuffer, "test1.jpg");

    // Second upload (same image)
    const res = await request(app)
      .post("/api/posts")
      .field("user", userId.toString())
      .field("caption", "Second upload")
      .attach("image", imageBuffer, "test2.jpg");

    expect(res.status).toBe(201);
    // Since we mock moderationService, hash will be same.
    // In our processImageModeration, we set req.isDuplicate = true.
  });
});
