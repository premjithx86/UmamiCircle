const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const User = require("../src/models/User");
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

describe("Feed Routes", () => {
  let user1, user2, post1, post2;

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});

    user1 = await new User({
      firebaseUID: "user1-uid",
      username: "user1",
      name: "User One",
      email: "user1@example.com",
    }).save();

    user2 = await new User({
      firebaseUID: "user2-uid",
      username: "user2",
      name: "User Two",
      email: "user2@example.com",
    }).save();

    post1 = await new Post({
      user: user1._id,
      caption: "User 1 Post",
      imageUrl: "http://example.com/1.jpg",
      imageHash: "hash1",
    }).save();

    post2 = await new Post({
      user: user2._id,
      caption: "User 2 Post",
      imageUrl: "http://example.com/2.jpg",
      imageHash: "hash2",
      likes: [user1._id], // Give it a like for trending
    }).save();
  });

  describe("GET /api/posts/following", () => {
    it("should return posts from followed users and self", async () => {
      // Make user1 follow user2
      user1.following.push(user2._id);
      await user1.save();

      const res = await request(app)
        .get("/api/posts/following")
        .set("Authorization", "Bearer mock-token") // authMiddleware uses mock-uid-123 for non-real tokens in tests
        
      // To match mock-uid-123, we need to update user1's UID in the DB
      user1.firebaseUID = "mock-uid-123";
      await user1.save();

      const resWithValidUid = await request(app)
        .get("/api/posts/following")
        .set("Authorization", "Bearer mock-token");

      expect(resWithValidUid.statusCode).toEqual(200);
      expect(resWithValidUid.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET /api/posts/explore", () => {
    it("should return all posts", async () => {
      const res = await request(app).get("/api/posts/explore");
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      // Post 2 has more likes so should be first
      expect(res.body[0].caption).toBe("User 2 Post");
    });
  });
});
