const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Post = require("../src/models/Post");
const Recipe = require("../src/models/Recipe");
const Report = require("../src/models/Report");
require("dotenv").config();

const seedTestData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({ email: { $in: ["chef1@example.com", "foodie2@example.com"] } });
    
    console.log("Seeding users...");
    const user1 = await new User({
      firebaseUID: "seed-uid-1",
      username: "masterchef",
      name: "Chef Gordon",
      email: "chef1@example.com",
    }).save();

    const user2 = await new User({
      firebaseUID: "seed-uid-2",
      username: "foodlover",
      name: "Jane Doe",
      email: "foodie2@example.com",
    }).save();

    console.log("Seeding posts...");
    const post1 = await new Post({
      user: user1._id,
      caption: "My first Beef Wellington! #cooking #gourmet",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947",
      imageHash: "seed-hash-post-1",
      moderationStatus: "approved"
    }).save();

    const post2 = await new Post({
      user: user2._id,
      caption: "This looks suspicious... is it even food?",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      imageHash: "seed-hash-post-2",
      moderationStatus: "flagged"
    }).save();

    console.log("Seeding recipe...");
    await new Recipe({
      user: user1._id,
      title: "Classic Scrambled Eggs",
      description: "The secret is slow cooking and lots of butter.",
      ingredients: ["3 Large Eggs", "20g Butter", "Salt", "Pepper"],
      steps: ["Whisk eggs", "Melt butter in pan", "Cook slowly while stirring", "Season at the end"],
      imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8",
      imageHash: "seed-hash-recipe-1",
      moderationStatus: "pending"
    }).save();

    console.log("Seeding sample report...");
    await new Report({
      reporter: user1._id,
      reason: "Inappropriate content in the second post.",
      targetType: "Post",
      targetId: post2._id,
      status: "pending"
    }).save();

    console.log("Successfully seeded test data!");
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding test data:", error);
    process.exit(1);
  }
};

seedTestData();
