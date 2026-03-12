const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error.message);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin initialized with service account");
} else {
  // Fallback for development if service account is not provided
  // This will fail on actual token verification but allow the app to start
  console.warn("FIREBASE_SERVICE_ACCOUNT not found. Firebase operations will fail.");
}

module.exports = admin;
