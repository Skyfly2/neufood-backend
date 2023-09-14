const request = require("supertest");
const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../route");

it("should pass with no endpoints", async () => {
  expect(1).toBe(1);
});
