const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Comment = require("../src/models/Comment");
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

describe("Comment Routes Integration Test", () => {
  let testUser, testPost;

  beforeEach(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});
    
    testUser = new User({
      firebaseUID: "mock-uid-123",
      username: "testuser",
      name: "Test User",
      email: "mock@example.com",
    });
    await testUser.save();

    testPost = new Post({
      user: testUser._id,
      caption: "A test post",
      imageUrl: "http://example.com/test.jpg",
      imageHash: "hash123",
    });
    await testPost.save();
  });

  it("should create a comment on a post", async () => {
    const res = await request(app)
      .post("/api/comments")
      .set("Authorization", "Bearer mock-uid-123")
      .send({
        content: "This looks delicious!",
        targetType: "Post",
        targetId: testPost._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe("This looks delicious!");
    expect(res.body.targetId).toBe(testPost._id.toString());
    
    // Verify count updated in Post model
    const postAfter = await Post.findById(testPost._id);
    expect(postAfter.commentsCount).toBe(1);
  });

  it("should get comments for a post", async () => {
    const comment = new Comment({
      user: testUser._id,
      content: "Test comment",
      targetType: "Post",
      targetId: testPost._id,
    });
    await comment.save();

    const res = await request(app)
      .get(`/api/comments/Post/${testPost._id}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].content).toBe("Test comment");
  });

  it("should delete a comment", async () => {
    const comment = new Comment({
      user: testUser._id,
      content: "Test comment",
      targetType: "Post",
      targetId: testPost._id,
    });
    await comment.save();
    
    await Post.findByIdAndUpdate(testPost._id, { $inc: { commentsCount: 1 } });

    const res = await request(app)
      .delete(`/api/comments/${comment._id}`)
      .set("Authorization", "Bearer mock-uid-123");

    expect(res.status).toBe(200);
    
    const commentInDb = await Comment.findById(comment._id);
    expect(commentInDb).toBeNull();
    
    // Verify count decremented
    const postAfter = await Post.findById(testPost._id);
    expect(postAfter.commentsCount).toBe(0);
  });
});
