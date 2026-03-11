const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Notification = require("../src/models/Notification");
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

describe("Notification Routes Integration Test", () => {
  let testUser, actor;

  beforeEach(async () => {
    await Notification.deleteMany({});
    await User.deleteMany({});
    
    testUser = new User({
      firebaseUID: "mock-uid-123",
      username: "testuser",
      name: "Test User",
      email: "mock@example.com",
    });
    await testUser.save();

    actor = new User({
      firebaseUID: "actor-uid",
      username: "actor",
      name: "Actor User",
      email: "actor@example.com",
    });
    await actor.save();
  });

  it("should get notifications for the user", async () => {
    const notification = new Notification({
      user: testUser._id,
      actor: actor._id,
      type: "like",
      targetType: "Post",
      targetId: new mongoose.Types.ObjectId(),
    });
    await notification.save();

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", "Bearer mock-uid-123");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].type).toBe("like");
  });

  it("should mark a notification as read", async () => {
    const notification = new Notification({
      user: testUser._id,
      actor: actor._id,
      type: "comment",
    });
    await notification.save();

    const res = await request(app)
      .put(`/api/notifications/read/${notification._id}`)
      .set("Authorization", "Bearer mock-uid-123");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/read/i);

    const updatedNotification = await Notification.findById(notification._id);
    expect(updatedNotification.isRead).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    await Notification.create([
      { user: testUser._id, actor: actor._id, type: "follow" },
      { user: testUser._id, actor: actor._id, type: "like" },
    ]);

    const res = await request(app)
      .put("/api/notifications/read-all")
      .set("Authorization", "Bearer mock-uid-123");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/all/i);

    const unreadCount = await Notification.countDocuments({ user: testUser._id, isRead: false });
    expect(unreadCount).toBe(0);
  });
});
