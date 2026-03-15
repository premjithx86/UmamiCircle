const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Post = require("../src/models/Post");
const User = require("../src/models/User");
const ModerationCache = require("../src/models/ModerationCache");

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
    await ModerationCache.deleteMany({});
    
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
      .set("Authorization", "Bearer mock-uid-123")
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
      .set("Authorization", "Bearer mock-uid-123")
      .field("caption", "First upload")
      .attach("image", imageBuffer, "test1.jpg");

    // Second upload (same image)
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-uid-123")
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

  it("should like and then unlike a post", async () => {
    // 1. Create a post first
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-uid-123")
      .field("caption", "My first post")
      .attach("image", Buffer.from("data1"), "test1.jpg");
    
    const postId = postRes.body._id;

    // 2. Like the post
    const likeRes = await request(app)
      .post(`/api/posts/like/${postId}`)
      .set("Authorization", "Bearer mock-uid-123");
    
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.message).toMatch(/liked/i);
    
    // Verify in DB
    const postAfterLike = await Post.findById(postId);
    expect(postAfterLike.likes).toContainEqual(testUser._id);

    // 3. Unlike the post (toggling)
    const unlikeRes = await request(app)
      .post(`/api/posts/like/${postId}`)
      .set("Authorization", "Bearer mock-uid-123");
    
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.message).toMatch(/unliked/i);

    // Verify in DB
    const postAfterUnlike = await Post.findById(postId);
    expect(postAfterUnlike.likes).not.toContainEqual(testUser._id);
  });

  it("should update own post caption and tags", async () => {
    // 1. Create post
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-uid-123")
      .field("caption", "Original caption")
      .attach("image", Buffer.from("data"), "test.jpg");
    
    const postId = postRes.body._id;

    // 2. Update post
    const updateRes = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", "Bearer mock-uid-123")
      .send({
        caption: "Updated caption",
        tags: ["updated", "tags"]
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.caption).toBe("Updated caption");
    expect(updateRes.body.tags).toContain("updated");
  });

  it("should return 403 if updating someone else's post", async () => {
    // 1. Create post by user1
    const post = new Post({
      user: new mongoose.Types.ObjectId(),
      caption: "Other user post",
      imageUrl: "http://example.com/image.jpg",
      imageHash: "hash123",
    });
    await post.save();

    // 2. Try to update by mock-uid-123
    const res = await request(app)
      .put(`/api/posts/${post._id}`)
      .set("Authorization", "Bearer mock-uid-123")
      .send({ caption: "Hacked" });

    expect(res.status).toBe(403);
  });

  it("should delete own post", async () => {
    // 1. Create post
    const postRes = await request(app)
      .post("/api/posts")
      .set("Authorization", "Bearer mock-uid-123")
      .field("caption", "To be deleted")
      .attach("image", Buffer.from("data"), "test.jpg");
    
    const postId = postRes.body._id;

    // 2. Delete post
    const deleteRes = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", "Bearer mock-uid-123");

    expect(deleteRes.status).toBe(200);
    
    // Verify in DB
    const deletedPost = await Post.findById(postId);
    expect(deletedPost).toBeNull();
  });
});
