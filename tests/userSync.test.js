const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
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

describe("POST /api/users/sync", () => {
  it("should create a new user if it does not exist", async () => {
    // We mock the authMiddleware to set req.user
    // For now we assume authMiddleware is already implemented in a way that provides req.user
    // from the verified firebase token.
    
    const res = await request(app)
      .post("/api/users/sync")
      .set("Authorization", "Bearer mock-token")
      .send({
        username: "newuser",
        name: "New User",
        email: "new@example.com"
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.user.username).toBe("newuser");
    
    const userInDb = await User.findOne({ username: "newuser" });
    expect(userInDb).not.toBeNull();
  });

  it("should strip role from profile update", async () => {
    // Sync the user first
    await request(app)
      .post("/api/users/sync")
      .set("Authorization", "Bearer mock-token")
      .send({
        username: "user1",
        name: "User One",
        email: "user1@example.com"
      });
      
    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", "Bearer mock-token")
      .send({
        bio: "Updated bio",
        role: "admin"
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.user.role).toBe("user"); // Should NOT be changed to admin
    expect(res.body.user.bio).toBe("Updated bio");
  });
});
