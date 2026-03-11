const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Conversation } = require('../src/models/Conversation');
const { Message } = require('../src/models/Message');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Messaging Models Test", () => {
  describe("Conversation Model", () => {
    it("should create and save a conversation successfully", async () => {
      const user1 = new mongoose.Types.ObjectId();
      const user2 = new mongoose.Types.ObjectId();
      
      const validConversation = new Conversation({
        participants: [user1, user2],
        lastMessage: "Hello there!",
      });
      const savedConversation = await validConversation.save();
      
      expect(savedConversation._id).toBeDefined();
      expect(savedConversation.participants).toContainEqual(user1);
      expect(savedConversation.participants).toContainEqual(user2);
    });

    it("should fail to save conversation with less than 2 participants", async () => {
      const user1 = new mongoose.Types.ObjectId();
      const invalidConversation = new Conversation({
        participants: [user1],
      });
      let err;
      try {
        await invalidConversation.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
  });

  describe("Message Model", () => {
    it("should create and save a message successfully", async () => {
      const sender = new mongoose.Types.ObjectId();
      const conversationId = new mongoose.Types.ObjectId();
      
      const validMessage = new Message({
        conversationId: conversationId,
        sender: sender,
        content: "Hey, check out this recipe!",
      });
      const savedMessage = await validMessage.save();
      
      expect(savedMessage._id).toBeDefined();
      expect(savedMessage.content).toBe("Hey, check out this recipe!");
      expect(savedMessage.isRead).toBe(false);
    });

    it("should fail to save message without required fields", async () => {
      const messageWithoutFields = new Message({});
      let err;
      try {
        await messageWithoutFields.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
  });
});
