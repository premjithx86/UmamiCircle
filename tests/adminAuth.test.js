const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Admin = require("../src/models/Admin");

let mongoServer;

beforeAll(async () => {
  process.env.JWT_ADMIN_SECRET = "testsecret";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin Authentication", () => {
  beforeEach(async () => {
    await Admin.deleteMany({});
  });

  it("should fail to login with invalid credentials", async () => {
    const res = await request(app)
      .post("/api/admin/login")
      .send({
        email: "wrong@admin.com",
        password: "password123",
      });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("should login successfully and return a JWT", async () => {
    // Create a mock admin first
    // Note: In real app, the first admin would be created via a script or by a SuperAdmin
    const admin = new Admin({
      username: "adminuser",
      email: "admin@test.com",
      password: "securepassword",
      role: "Admin",
    });
    await admin.save();

    const res = await request(app)
      .post("/api/admin/login")
      .send({
        email: "admin@test.com",
        password: "securepassword",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.admin.username).toBe("adminuser");
  });

  it("should access protected route with valid JWT", async () => {
    const admin = new Admin({
      username: "adminuser",
      email: "admin@test.com",
      password: "securepassword",
      role: "Admin",
    });
    await admin.save();

    const loginRes = await request(app)
      .post("/api/admin/login")
      .send({
        email: "admin@test.com",
        password: "securepassword",
      });

    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/admin/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@test.com");
  });

  it("should fail to access protected route without token", async () => {
    const res = await request(app)
      .get("/api/admin/me");

    expect(res.status).toBe(401);
  });

  it("should fail to access superadmin route with admin role", async () => {
    const admin = new Admin({
      username: "adminuser",
      email: "admin@test.com",
      password: "securepassword",
      role: "Admin",
    });
    await admin.save();

    const loginRes = await request(app)
      .post("/api/admin/login")
      .send({
        email: "admin@test.com",
        password: "securepassword",
      });

    const token = loginRes.body.token;

    // Assuming we have a test route for SuperAdmin only
    const res = await request(app)
      .get("/api/admin/super-only")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
