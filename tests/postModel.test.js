const mongoose = require("mongoose");
const Post = require("../src/models/Post");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Post Model Test", () => {
  it("should create and save a post successfully", async () => {
    const validPost = new Post({
      user: new mongoose.Types.ObjectId(),
      caption: "This is a delicious cake!",
      imageUrl: "http://example.com/cake.jpg",
      imageHash: "dummyhash123",
      tags: ["cake", "dessert"],
    });
    const savedPost = await validPost.save();
    
    expect(savedPost._id).toBeDefined();
    expect(savedPost.caption).toBe(validPost.caption);
    expect(savedPost.imageHash).toBe(validPost.imageHash);
  });

  it("should fail to save post without required fields", async () => {
    const postWithoutRequiredField = new Post({ caption: "Missing fields" });
    let err;
    try {
      await postWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
