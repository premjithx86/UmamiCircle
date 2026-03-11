const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const { Conversation } = require('../src/models/Conversation');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Messaging Performance and Stress Test", () => {
  let user1, user2, conversation;

  beforeEach(async () => {
    await User.deleteMany({});
    await Conversation.deleteMany({});

    user1 = new User({ firebaseUID: "u1", username: "u1", name: "User 1", email: "u1@test.com" });
    await user1.save();
    user2 = new User({ firebaseUID: "u2", username: "u2", name: "User 2", email: "u2@test.com" });
    await user2.save();

    conversation = new Conversation({ participants: [user1._id, user2._id] });
    await conversation.save();
  });

  it("should handle 50 messages sent in succession", async () => {
    const messageCount = 50;

    for (let i = 0; i < messageCount; i++) {
      const res = await request(app)
        .post("/api/messages")
        .set("Authorization", "Bearer u1")
        .send({
          conversationId: conversation._id,
          content: `Stress message ${i}`,
        });
      
      expect(res.status).toBe(201);
    }

    const updatedConversation = await Conversation.findById(conversation._id);
    expect(updatedConversation.lastMessage).toBe(`Stress message ${messageCount - 1}`);
  });
});
