const mongoose = require("mongoose");
const Recipe = require("../src/models/Recipe");
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

describe("Recipe Model Test", () => {
  it("should create and save a recipe successfully", async () => {
    const validRecipe = new Recipe({
      user: new mongoose.Types.ObjectId(),
      title: "Best Chocolate Cake",
      description: "Moist and rich chocolate cake.",
      ingredients: ["flour", "sugar", "cocoa powder"],
      steps: ["Mix ingredients", "Bake at 350F"],
      imageUrl: "http://example.com/chococake.jpg",
      imageHash: "recipehash123",
      tags: ["dessert", "chocolate"],
    });
    const savedRecipe = await validRecipe.save();
    
    expect(savedRecipe._id).toBeDefined();
    expect(savedRecipe.title).toBe(validRecipe.title);
    expect(savedRecipe.ingredients.length).toBe(3);
  });

  it("should support likes and commentsCount", async () => {
    const userId = new mongoose.Types.ObjectId();
    const recipe = new Recipe({
      user: new mongoose.Types.ObjectId(),
      title: "Likes Test",
      description: "Test description",
      ingredients: ["item"],
      steps: ["step"],
      imageUrl: "http://example.com/pic.jpg",
      imageHash: "hash-likes",
      likes: [userId],
      commentsCount: 5
    });
    const savedRecipe = await recipe.save();
    expect(savedRecipe.likes).toBeDefined();
    expect(savedRecipe.likes[0]).toEqual(userId);
    expect(savedRecipe.commentsCount).toBe(5);
  });

  it("should fail to save recipe without required fields", async () => {
    const recipeWithoutRequiredField = new Recipe({ title: "No fields" });
    let err;
    try {
      await recipeWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
