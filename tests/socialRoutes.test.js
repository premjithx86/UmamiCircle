const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
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

describe("Social Routes Integration Tests", () => {
  let user1, user2;

  beforeEach(async () => {
    await User.deleteMany({});
    
    user1 = new User({
      firebaseUID: "uid-1",
      username: "user1",
      name: "User One",
      email: "user1@example.com",
    });
    await user1.save();

    user2 = new User({
      firebaseUID: "uid-2",
      username: "user2",
      name: "User Two",
      email: "user2@example.com",
    });
    await user2.save();
  });

  describe("Follow/Unfollow", () => {
    it("should allow user1 to follow user2", async () => {
      const res = await request(app)
        .post(`/api/social/follow/${user2._id}`)
        .set("Authorization", "Bearer uid-1"); // Mock auth uses uid-1

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/followed/i);

      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1.following).toContainEqual(user2._id);
      expect(updatedUser2.followers).toContainEqual(user1._id);
    });

    it("should allow user1 to unfollow user2", async () => {
      // Setup follow state
      user1.following.push(user2._id);
      await user1.save();
      user2.followers.push(user1._id);
      await user2.save();

      const res = await request(app)
        .post(`/api/social/unfollow/${user2._id}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/unfollowed/i);

      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1.following).not.toContainEqual(user2._id);
      expect(updatedUser2.followers).not.toContainEqual(user1._id);
    });
  });

  describe("Block/Unblock", () => {
    it("should allow user1 to block user2", async () => {
      const res = await request(app)
        .post(`/api/social/block/${user2._id}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/blocked/i);

      const updatedUser1 = await User.findById(user1._id);
      expect(updatedUser1.blocked).toContainEqual(user2._id);
    });

    it("should allow user1 to unblock user2", async () => {
      user1.blocked.push(user2._id);
      await user1.save();

      const res = await request(app)
        .post(`/api/social/unblock/${user2._id}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/unblocked/i);

      const updatedUser1 = await User.findById(user1._id);
      expect(updatedUser1.blocked).not.toContainEqual(user2._id);
    });
  });

  describe("Report", () => {
    it("should allow user1 to report user2", async () => {
      const res = await request(app)
        .post(`/api/social/report/User/${user2._id}`)
        .set("Authorization", "Bearer uid-1")
        .send({ reason: "Spam profile" });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/report/i);
    });
  });

  describe("Bookmark/Share", () => {
    it("should allow user1 to bookmark a post", async () => {
      const dummyPostId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/social/bookmark/Post/${dummyPostId}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/bookmarked/i);

      const updatedUser1 = await User.findById(user1._id);
      expect(updatedUser1.bookmarks[0].targetId.toString()).toBe(dummyPostId.toString());
    });

    it("should allow user1 to unbookmark a post", async () => {
      const dummyPostId = new mongoose.Types.ObjectId();
      user1.bookmarks.push({ targetType: "Post", targetId: dummyPostId });
      await user1.save();

      const res = await request(app)
        .post(`/api/social/bookmark/Post/${dummyPostId}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/i);

      const updatedUser1 = await User.findById(user1._id);
      expect(updatedUser1.bookmarks.length).toBe(0);
    });

    it("should generate a share link", async () => {
      const dummyPostId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/social/share/Post/${dummyPostId}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.shareUrl).toBeDefined();
      expect(res.body.shareUrl).toMatch(new RegExp(dummyPostId.toString()));
    });
  });
});
