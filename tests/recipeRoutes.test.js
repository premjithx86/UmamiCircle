const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Recipe Routes Integration Test", () => {
  it("should create a new recipe with image upload and moderation", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .field("user", new mongoose.Types.ObjectId().toString())
      .field("title", "Pasta Carbonara")
      .field("description", "A classic Italian pasta dish.")
      .field("ingredients", JSON.stringify(["spaghetti", "eggs", "pecorino", "guanciale"]))
      .field("steps", JSON.stringify(["Boil water", "Cook pasta", "Mix eggs and cheese"]))
      .attach("image", Buffer.from("dummy-recipe-image"), "recipe.jpg");

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Pasta Carbonara");
    expect(res.body.imageHash).toBeDefined();
  });
});
