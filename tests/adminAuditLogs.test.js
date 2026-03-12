const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Admin = require("../src/models/Admin");
const User = require("../src/models/User");
const AuditLog = require("../src/models/AuditLog");

let mongoServer;
let adminToken;

beforeAll(async () => {
  process.env.JWT_ADMIN_SECRET = "testsecret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const admin = new Admin({
    username: "auditadmin",
    email: "auditadmin@test.com",
    password: "password123",
    role: "Admin",
  });
  await admin.save();

  const loginRes = await request(app)
    .post("/api/admin/login")
    .send({
      email: "auditadmin@test.com",
      password: "password123",
    });
  
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin Audit Logs", () => {
  beforeEach(async () => {
    await AuditLog.deleteMany({});
  });

  it("should list audit logs", async () => {
    const admin = await Admin.findOne({ email: "auditadmin@test.com" });
    await new AuditLog({
      admin: admin._id,
      action: "DELETE_POST",
      targetType: "Post",
      targetId: new mongoose.Types.ObjectId(),
      details: { caption: "Test Post" }
    }).save();

    const res = await request(app)
      .get("/api/admin/logs")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].action).toBe("DELETE_POST");
  });

  it("should filter logs by action", async () => {
    const admin = await Admin.findOne({ email: "auditadmin@test.com" });
    await new AuditLog({ admin: admin._id, action: "BLOCK_USER" }).save();
    await new AuditLog({ admin: admin._id, action: "DELETE_POST" }).save();

    const res = await request(app)
      .get("/api/admin/logs?action=BLOCK_USER")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].action).toBe("BLOCK_USER");
  });

  it("should create an audit log when a user is blocked", async () => {
    const user = await new User({
      firebaseUID: "block-test",
      username: "blockme",
      name: "Block Me",
      email: "block@me.com"
    }).save();

    const blockRes = await request(app)
      .patch(`/api/admin/users/${user._id}/block`)
      .send({ isBlocked: true })
      .set("Authorization", `Bearer ${adminToken}`);

    expect(blockRes.status).toBe(200);

    const logRes = await request(app)
      .get("/api/admin/logs?action=BLOCK_USER")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(logRes.status).toBe(200);
    expect(logRes.body.length).toBe(1);
    expect(logRes.body[0].targetId).toBe(user._id.toString());
    expect(logRes.body[0].action).toBe("BLOCK_USER");
  });
});
