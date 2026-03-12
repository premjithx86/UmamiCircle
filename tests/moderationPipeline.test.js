const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Post = require("../src/models/Post");
const User = require("../src/models/User");
const moderationService = require("../src/services/moderationService");

// Mock the moderation service
jest.mock("../src/services/moderationService", () => {
  const original = jest.requireActual("../src/services/moderationService");
  return {
    ...original,
    checkImageSafety: jest.fn(),
    verifyFoodContent: jest.fn(),
    uploadToCloudinary: jest.fn(),
    validateFoodRelevance: jest.fn(),
  };
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Moderation Pipeline & Upload API", () => {
  let testUser;

  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    jest.clearAllMocks();
    
    testUser = new User({
      firebaseUID: "mock-uid-123",
      username: "testuser",
      name: "Test User",
      email: "mock@example.com",
    });
    await testUser.save();

    // Default mock behaviors
    moderationService.checkImageSafety.mockResolvedValue({ safe: true });
    moderationService.verifyFoodContent.mockResolvedValue(true);
    moderationService.uploadToCloudinary.mockResolvedValue({ secure_url: "http://cloudinary.com/test.jpg" });
    moderationService.validateFoodRelevance.mockResolvedValue({ relevant: true });
  });

  describe("POST /api/upload", () => {
    it("should moderate and upload a valid food image", async () => {
      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", "Bearer mock-uid-123")
        .attach("image", Buffer.from("fake-food-data"), "food.jpg");

      expect(res.status).toBe(200);
      expect(res.body.imageUrl).toBe("http://cloudinary.com/test.jpg");
      expect(moderationService.checkImageSafety).toHaveBeenCalled();
      expect(moderationService.verifyFoodContent).toHaveBeenCalled();
    });

    it("should reject NSFW images", async () => {
      moderationService.checkImageSafety.mockResolvedValue({ safe: false });

      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", "Bearer mock-uid-123")
        .attach("image", Buffer.from("naughty-data"), "nsfw.jpg");

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/safety check/i);
    });

    it("should reject non-food images", async () => {
      moderationService.verifyFoodContent.mockRejectedValue(new Error("Please upload food-related content."));

      const res = await request(app)
        .post("/api/upload")
        .set("Authorization", "Bearer mock-uid-123")
        .attach("image", Buffer.from("cat-data"), "cat.jpg");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Please upload food-related content.");
    });
  });

  describe("POST /api/posts with pre-uploaded image", () => {
    it("should create a post when provided with valid imageUrl and hash", async () => {
      const res = await request(app)
        .post("/api/posts")
        .set("Authorization", "Bearer mock-uid-123")
        .send({
          caption: "My pre-uploaded image",
          imageUrl: "http://cloudinary.com/pre.jpg",
          imageHash: "pre-hash-123",
          tags: ["tag1"]
        });

      expect(res.status).toBe(201);
      expect(res.body.imageUrl).toBe("http://cloudinary.com/pre.jpg");
      
      const post = await Post.findOne({ imageHash: "pre-hash-123" });
      expect(post).not.toBeNull();
    });

    it("should still moderate text even if image is pre-uploaded", async () => {
      moderationService.validateFoodRelevance.mockResolvedValue({ relevant: false });

      const res = await request(app)
        .post("/api/posts")
        .set("Authorization", "Bearer mock-uid-123")
        .send({
          caption: "Irrelevant non-food text",
          imageUrl: "http://cloudinary.com/pre.jpg",
          imageHash: "pre-hash-456"
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/food-related/i);
    });
  });
});
