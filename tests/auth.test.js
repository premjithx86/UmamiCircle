const request = require("supertest");
const express = require("express");
const authMiddleware = require("../src/middleware/auth");

const app = express();
app.use(express.json());
app.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Success", user: req.user });
});

describe("Auth Middleware", () => {
  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/protected");
    expect(res.statusCode).toEqual(401);
  });
});
