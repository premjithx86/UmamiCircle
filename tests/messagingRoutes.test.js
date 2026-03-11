const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../src/models/User");
const Conversation = require("../src/models/Conversation");
const Message = require("../src/models/Message");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Messaging Routes Integration Test", () => {
  let user1, user2;

  beforeEach(async () => {
    await User.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    user1 = new User({
      firebaseUID: "uid-1",
      username: "user1",
      name: "User One",
      email: "user1@example.com",
    });
    await user1.save();

    user2 = new User({
      firebaseUID: "uid-2",
      username: "user2",
      name: "User Two",
      email: "user2@example.com",
    });
    await user2.save();
  });

  describe("POST /api/messages/conversations", () => {
    it("should create a new conversation", async () => {
      const res = await request(app)
        .post("/api/messages/conversations")
        .set("Authorization", "Bearer uid-1")
        .send({ participantId: user2._id });

      expect(res.status).toBe(201);
      expect(res.body.participants).toContain(user1._id.toString());
      expect(res.body.participants).toContain(user2._id.toString());
    });
  });

  describe("GET /api/messages/conversations", () => {
    it("should fetch all conversations for the user", async () => {
      const conversation = new Conversation({
        participants: [user1._id, user2._id],
      });
      await conversation.save();

      const res = await request(app)
        .get("/api/messages/conversations")
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0]._id).toBe(conversation._id.toString());
    });
  });

  describe("POST /api/messages", () => {
    it("should send a message in a conversation", async () => {
      const conversation = new Conversation({
        participants: [user1._id, user2._id],
      });
      await conversation.save();

      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", "Bearer uid-1")
        .send({
          conversationId: conversation._id,
          content: "Test message",
        });

      expect(res.status).toBe(201);
      expect(res.body.content).toBe("Test message");
      expect(res.body.sender).toBe(user1._id.toString());
    });
  });

  describe("GET /api/messages/:conversationId", () => {
    it("should fetch messages for a conversation", async () => {
      const conversation = new Conversation({
        participants: [user1._id, user2._id],
      });
      await conversation.save();

      const message = new Message({
        conversationId: conversation._id,
        sender: user1._id,
        content: "Hello",
      });
      await message.save();

      const res = await request(app)
        .get(`/api/messages/${conversation._id}`)
        .set("Authorization", "Bearer uid-1");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].content).toBe("Hello");
    });

    it("should return 403 if user is not a participant", async () => {
      const user3 = new User({
        firebaseUID: "uid-3",
        username: "user3",
        name: "User Three",
        email: "user3@example.com",
      });
      await user3.save();

      const conversation = new Conversation({
        participants: [user1._id, user2._id],
      });
      await conversation.save();

      const res = await request(app)
        .get(`/api/messages/${conversation._id}`)
        .set("Authorization", "Bearer uid-3");

      expect(res.status).toBe(403);
    });
  });

  describe("Security: Blocked Users", () => {
    it("should not allow starting a conversation with a blocked user", async () => {
      user1.blocked.push(user2._id);
      await user1.save();

      const res = await request(app)
        .post("/api/messages/conversations")
        .set("Authorization", "Bearer uid-1")
        .send({ participantId: user2._id });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/block/i);
    });

    it("should not allow sending a message if one user is blocked", async () => {
      const conversation = new Conversation({
        participants: [user1._id, user2._id],
      });
      await conversation.save();

      user2.blocked.push(user1._id);
      await user2.save();

      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", "Bearer uid-1")
        .send({
          conversationId: conversation._id,
          content: "Can you see this?",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/block/i);
    });
  });
});
