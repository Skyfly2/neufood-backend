const request = require("supertest");
const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../../route");

describe("PUT /ingredients/request/:ingredients_id/:user", () => {
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

  it("should return 200 if the request is added successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/request/123456789123/3");
    expect(res.status).toBe(200);
  });

  it("should return 400 if the ingredient ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/request/456789123456/3");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).put("/ingredients/request/123456789123/3");
    expect(res.status).toBe(400);
  });
});

describe("GET /ingredients/request/:ingredients_id", () => {
  let connection;
  let db;
  let mongoServer;
  const ingredient = {
    _id: new ObjectID("123456789123"),
    name: "test",
    quantity: 5,
    request_list: ["test1@gmail.com", "test2@gmail.com"],
  };
  const mockUsers = [
    { name: "test1", email: "test1@gmail.com" },
    { name: "test2", email: "test2@gmail.com" },
  ];

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    connection = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = await connection.db("neufood");
    await db.collection("ingredients").insertOne(ingredient);
    await db.collection("user").insertMany(mockUsers);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 200 if the request is retrieved successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/ingredients/request/123456789123");
    expect(res.status).toBe(200);
  });

  it("should return the proper user list if the request is retrieved successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/ingredients/request/123456789123");
    const body = res.body;
    expect(res.status).toBe(200);
    expect(body[0].name).toEqual("test1");
    expect(body[0].email).toEqual("test1@gmail.com");
    expect(body[1].name).toEqual("test2");
    expect(body[1].email).toEqual("test2@gmail.com");
    expect(body.length).toBe(2);
  });

  it("should return 400 if the ingredient ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/ingredients/request/456789123456");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).get("/ingredients/request/123456789123");
    expect(res.status).toBe(400);
  });
});
