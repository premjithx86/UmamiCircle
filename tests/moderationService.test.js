const { generateHash, checkImageSafety, verifyFoodContent, validateFoodRelevance } = require("../src/services/moderationService");

describe("Moderation Service Test", () => {
  it("should generate the same hash for the same buffer", () => {
    const buffer1 = Buffer.from("test image data");
    const buffer2 = Buffer.from("test image data");
    const hash1 = generateHash(buffer1);
    const hash2 = generateHash(buffer2);
    expect(hash1).toBe(hash2);
  });

  it("should return safe for mocked image safety check", async () => {
    const res = await checkImageSafety(Buffer.from("dummy"));
    expect(res.safe).toBe(true);
  });

  it("should return true for mocked food verification", async () => {
    const res = await verifyFoodContent(Buffer.from("dummy"));
    expect(res).toBe(true);
  });

  it("should return relevant for mocked food relevance check", async () => {
    const res = await validateFoodRelevance("delicious cake");
    expect(res.relevant).toBe(true);
  });
});
