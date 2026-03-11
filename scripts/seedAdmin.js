const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Admin = require("../src/models/Admin");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@umamicircle.com";
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists. Updating password...`);
      existingAdmin.password = "Admin@123";
      await existingAdmin.save();
      console.log("Admin password updated successfully.");
    } else {
      const admin = new Admin({
        username: "admin",
        email: adminEmail,
        password: "Admin@123",
        role: "SuperAdmin",
      });
      await admin.save();
      console.log(`Successfully created SuperAdmin: ${adminEmail} / Admin@123`);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
