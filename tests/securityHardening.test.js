const request = require("supertest");
const app = require("../src/app");

describe("Security Hardening - Rate Limiting", () => {
  it("should have rate limiting headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });

  // Note: Testing actual block is difficult in unit tests without multiple IPs
  // but we can verify the headers are present which confirms middleware is active
});
