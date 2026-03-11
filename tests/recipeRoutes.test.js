const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Recipe = require("../src/models/Recipe");
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

describe("Recipe Routes Integration Test", () => {
  let testUser;

  beforeEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});
    
    // Create a user that matches the mock authMiddleware (uid: "mock-uid-123")
    testUser = new User({
      firebaseUID: "mock-uid-123",
      username: "testuser",
      name: "Test User",
      email: "mock@example.com",
    });
    await testUser.save();
  });

  it("should create a new recipe with image upload and moderation", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer mock-uid-123")
      .field("title", "Pasta Carbonara")
      .field("description", "A classic Italian pasta dish.")
      .field("ingredients", JSON.stringify(["spaghetti", "eggs", "pecorino", "guanciale"]))
      .field("steps", JSON.stringify(["Boil water", "Cook pasta", "Mix eggs and cheese"]))
      .attach("image", Buffer.from("dummy-recipe-image"), "recipe.jpg");

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Pasta Carbonara");
    expect(res.body.imageHash).toBeDefined();
    expect(res.body.user).toBe(testUser._id.toString());
  });

  it("should return 401 if unauthorized", async () => {
    const res = await request(app)
      .post("/api/recipes")
      .field("title", "No token")
      .attach("image", Buffer.from("data"), "recipe.jpg");

    expect(res.status).toBe(401);
  });

  it("should like and then unlike a recipe", async () => {
    // 1. Create a recipe first
    const recipeRes = await request(app)
      .post("/api/recipes")
      .set("Authorization", "Bearer mock-uid-123")
      .field("title", "My first recipe")
      .field("description", "A test recipe")
      .attach("image", Buffer.from("data1"), "recipe1.jpg");
    
    const recipeId = recipeRes.body._id;

    // 2. Like the recipe
    const likeRes = await request(app)
      .post(`/api/recipes/like/${recipeId}`)
      .set("Authorization", "Bearer mock-uid-123");
    
    expect(likeRes.status).toBe(200);
    expect(likeRes.body.message).toMatch(/liked/i);
    
    // Verify in DB
    const recipeAfterLike = await Recipe.findById(recipeId);
    expect(recipeAfterLike.likes).toContainEqual(testUser._id);

    // 3. Unlike the recipe (toggling)
    const unlikeRes = await request(app)
      .post(`/api/recipes/like/${recipeId}`)
      .set("Authorization", "Bearer mock-uid-123");
    
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.message).toMatch(/unliked/i);

    // Verify in DB
    const recipeAfterUnlike = await Recipe.findById(recipeId);
    expect(recipeAfterUnlike.likes).not.toContainEqual(testUser._id);
  });
});
