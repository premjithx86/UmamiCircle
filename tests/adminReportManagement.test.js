const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const User = require("../src/models/User");
const Report = require("../src/models/Report");

let mongoServer;
let adminToken;

beforeAll(async () => {
  process.env.JWT_ADMIN_SECRET = "testsecret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const admin = new Admin({
    username: "reportadmin",
    email: "reportadmin@test.com",
    password: "password123",
    role: "Admin",
  });
  await admin.save();

  const loginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "reportadmin@test.com",
      password: "password123",
    });
  
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin Report Management", () => {
  let testUser;

  beforeEach(async () => {
    await Report.deleteMany({});
    await User.deleteMany({});
    
    testUser = await new User({
      firebaseUID: "test-uid",
      username: "testuser",
      name: "Test User",
      email: "test@user.com",
    }).save();
  });

  it("should list all reports", async () => {
    await new Report({
      reporter: testUser._id,
      reason: "Spam",
      targetType: "User",
      targetId: testUser._id,
    }).save();

    const res = await request(app)
      .get("/api/admin/reports")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].reason).toBe("Spam");
  });

  it("should filter reports by status", async () => {
    await new Report({
      reporter: testUser._id,
      reason: "Reason 1",
      targetType: "User",
      targetId: testUser._id,
      status: "pending",
    }).save();
    await new Report({
      reporter: testUser._id,
      reason: "Reason 2",
      targetType: "User",
      targetId: testUser._id,
      status: "reviewed",
    }).save();

    const res = await request(app)
      .get("/api/admin/reports?status=reviewed")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe("reviewed");
  });

  it("should update report status and add comment", async () => {
    const report = await new Report({
      reporter: testUser._id,
      reason: "Initial Reason",
      targetType: "User",
      targetId: testUser._id,
    }).save();

    const res = await request(app)
      .patch(`/api/admin/reports/${report._id}`)
      .send({ status: "action_taken", adminComment: "User warned" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("action_taken");
    expect(res.body.adminComment).toBe("User warned");
  });

  it("should return 404 when updating non-existent report", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/admin/reports/${fakeId}`)
      .send({ status: "dismissed" })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
