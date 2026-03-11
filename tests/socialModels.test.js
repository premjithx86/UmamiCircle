const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Comment = require("../src/models/Comment");
const Notification = require("../src/models/Notification");
const Report = require("../src/models/Report");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Social Models Unit Tests", () => {
  describe("Comment Model", () => {
    it("should fail to create a comment without required fields", async () => {
      const comment = new Comment({});
      let err;
      try {
        await comment.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeDefined();
    });

    it("should successfully create a comment", async () => {
      const userId = new mongoose.Types.ObjectId();
      const targetId = new mongoose.Types.ObjectId();
      const commentData = {
        user: userId,
        content: "Yummy recipe!",
        targetType: "Recipe",
        targetId: targetId,
      };
      const comment = new Comment(commentData);
      const savedComment = await comment.save();
      expect(savedComment._id).toBeDefined();
      expect(savedComment.content).toBe(commentData.content);
    });
  });

  describe("Notification Model", () => {
    it("should successfully create a notification", async () => {
      const userId = new mongoose.Types.ObjectId();
      const actorId = new mongoose.Types.ObjectId();
      const notificationData = {
        user: userId,
        actor: actorId,
        type: "like",
        targetType: "Post",
        targetId: new mongoose.Types.ObjectId(),
      };
      const notification = new Notification(notificationData);
      const savedNotification = await notification.save();
      expect(savedNotification._id).toBeDefined();
      expect(savedNotification.isRead).toBe(false);
    });
  });

  describe("Report Model", () => {
    it("should successfully create a report", async () => {
      const reporterId = new mongoose.Types.ObjectId();
      const reportData = {
        reporter: reporterId,
        reason: "Inappropriate content",
        targetType: "Post",
        targetId: new mongoose.Types.ObjectId(),
      };
      const report = new Report(reportData);
      const savedReport = await report.save();
      expect(savedReport._id).toBeDefined();
      expect(savedReport.status).toBe("pending");
    });
  });
});
