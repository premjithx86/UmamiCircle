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

describe("User Model", () => {
  it("should create a user successfully", async () => {
    const userData = {
      firebaseUID: "test-uid-123",
      email: "test@example.com",
      username: "testuser",
      bio: "Hello, I am a test user.",
      profilePicUrl: "http://example.com/pic.jpg",
      role: "user"
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.firebaseUID).toBe(userData.firebaseUID);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.username).toBe(userData.username);
  });

  it("should fail to create a user without required fields", async () => {
    const userWithoutRequiredFields = new User({ username: "test" });
    let err;
    try {
      await userWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
