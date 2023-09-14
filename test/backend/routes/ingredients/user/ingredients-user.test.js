const request = require("supertest");
const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../../route");

describe("PUT /ingredients/user/:ingredients_id/:user", () => {
  let connection;
  let db;
  let mongoServer;
  const ingredient = {
    _id: new ObjectID("123456789123"),
    name: "test",
    quantity: 5,
    user_list: [],
  };

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    connection = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db("neufood");
    await db.collection("ingredients").insertOne(ingredient);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 200 if the user is added successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/user/123456789123/3");
    expect(res.status).toBe(200);
  });

  it("should return 400 if the ingredient ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/user/456789123456/3");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).put("/ingredients/user/123456789123/3");
    expect(res.status).toBe(400);
  });
});
