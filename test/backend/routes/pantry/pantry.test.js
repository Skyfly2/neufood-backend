const request = require("supertest");
const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../route");

describe("POST /pantry/:name/:user", () => {
  let connection;
  let db;
  let mongoServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    connection = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = { uid: "123", email: "test@example.com", name: "Test User" };
    db = await connection.db("neufood");
    await db.collection("user").insertOne(user);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 400 if user is not found", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).post("/pantry/MyPantry/456");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).post("/pantry/MyPantry/456");
    expect(res.status).toBe(400);
  });

  it("should create a new pantry with correct data", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).post(`/pantry/MyPantry/123`);
    expect(res.status).toBe(200);
  });
});

describe("DELETE /pantry/pantry_id", () => {
  let connection;
  let db;
  let mongoServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    connection = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const pantry = { _id: new ObjectID("123456789123") };
    db = await connection.db("neufood");
    await db.collection("pantry").insertOne(pantry);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 404 if pantry is not found", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete("/pantry/456789123456");
    expect(res.status).toBe(404);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).delete("/pantry/123456789123");
    expect(res.status).toBe(400);
  });

  it("should delete the pantry if it exists", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete(`/pantry/123456789123`);
    expect(res.status).toBe(200);
  });
});

describe("PUT /pantry/:pantry_id/:member_id/:uid", () => {
  let connection;
  let db;
  let mongoServer;
  const user = { uid: "1", friends_list: ["2"] };
  const pantry = { _id: new ObjectID("123456789123"), member_list: [] };

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    connection = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const pantry = { _id: new ObjectID("123456789123") };
    db = await connection.db("neufood");
    await db.collection("user").insertOne(user);
    await db.collection("pantry").insertOne(pantry);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 200 if the member is added successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/pantry/123456789123/2/1");
    expect(res.status).toBe(200);
  });

  it("should return 400 if the member ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/pantry/456789123456/0/1");
    expect(res.status).toBe(400);
  });

  it("should return 400 if the user doesn't exist", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/pantry/456789123456/0/0");
    expect(res.status).toBe(400);
  });

  it("should return 500 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).put("/pantry/456789123456/0/0");
    expect(res.status).toBe(500);
  });
});

describe("DELETE /pantry/:pantry_id/1/:member_id", () => {
  let connection;
  let db;
  let mongoServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    connection = await MongoClient.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const pantry = { _id: new ObjectID("123456789123"), member_list: ["1"] };
    db = await connection.db("neufood");
    await db.collection("pantry").insertOne(pantry);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 404 if pantry is not found", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete("/pantry/456789123456/1/2");
    expect(res.status).toBe(404);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).delete("/pantry/456789123456/1/2");
    expect(res.status).toBe(500);
  });

  it("should delete the pantry if it exists", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete(`/pantry/123456789123/1/1`);
    expect(res.status).toBe(200);
  });
});
