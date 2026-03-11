const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const User = require("../src/models/User");

let mongoServer;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const admin = new Admin({
    username: "useradmin",
    email: "useradmin@test.com",
    password: "password123",
    role: "Admin",
  });
  await admin.save();

  const loginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "useradmin@test.com",
      password: "password123",
    });
  
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin User Management", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should list all users", async () => {
    await new User({ firebaseUID: "1", username: "u1", name: "User 1", email: "u1@t.com" }).save();
    await new User({ firebaseUID: "2", username: "u2", name: "User 2", email: "u2@t.com" }).save();

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it("should search users by username", async () => {
    await new User({ firebaseUID: "1", username: "findme", name: "User 1", email: "u1@t.com" }).save();
    await new User({ firebaseUID: "2", username: "other", name: "User 2", email: "u2@t.com" }).save();

    const res = await request(app)
      .get("/api/admin/users?search=findme")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].username).toBe("findme");
  });

  it("should block/unblock a user", async () => {
    const user = await new User({ firebaseUID: "1", username: "u1", name: "U 1", email: "u1@t.com" }).save();

    const blockRes = await request(app)
      .patch(`/api/admin/users/${user._id}/block`)
      .send({ isBlocked: true })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(blockRes.status).toBe(200);
    expect(blockRes.body.isBlocked).toBe(true);

    const unblockRes = await request(app)
      .patch(`/api/admin/users/${user._id}/block`)
      .send({ isBlocked: false })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(unblockRes.status).toBe(200);
    expect(unblockRes.body.isBlocked).toBe(false);
  });

  it("should delete a user", async () => {
    const user = await new User({ firebaseUID: "1", username: "u1", name: "U 1", email: "u1@t.com" }).save();

    const res = await request(app)
      .delete(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const found = await User.findById(user._id);
    expect(found).toBeNull();
  });

  it("should return 404 when blocking non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/admin/users/${fakeId}/block`)
      .send({ isBlocked: true })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("should return 400 when isBlocked is not a boolean", async () => {
    const user = await new User({ firebaseUID: "1", username: "u1", name: "U 1", email: "u1@t.com" }).save();
    const res = await request(app)
      .patch(`/api/admin/users/${user._id}/block`)
      .send({ isBlocked: "yes" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
  });

  it("should return 404 when deleting non-existent user", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("should return 500 on invalid ID for block", async () => {
    const res = await request(app)
      .patch("/api/admin/users/invalid-id/block")
      .send({ isBlocked: true })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });

  it("should return empty platform activity", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard/activity")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return dashboard stats", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBeDefined();
  });
});
