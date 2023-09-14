const request = require("supertest");
const { MongoClient } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../route");

const mockData = [
  {
    _id: 1,
    receiver: "test@example.com",
    message: "Notification 1",
  },
  {
    _id: 2,
    receiver: "test@example.com",
    message: "Notification 2",
  },
  {
    _id: 3,
    receiver: "test@example.com",
    message: "Notification 3",
  },
];

describe("GET /notifications/:email", () => {
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
    db = await connection.db("neufoodNew");
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should respond with a 200 status code when there is no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/notifications/test@example.com");
    expect(res.statusCode).toEqual(200);
  });

  it("should return an array of notifications when there is no error", async () => {
    await db.collection("notifications").insertMany(mockData);

    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);

    const res = await request(app).get("/notifications/test@example.com");

    expect(res.body.notifications).toEqual(mockData);
    expect(res.statusCode).toEqual(200);
  });

  it("should return a 400 status code if there is an error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);

    const res = await request(app).get("/notifications/test@example.com");

    expect(res.statusCode).toEqual(400);
  });
});

describe("PUT /notifications/read", () => {
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
    db = await connection.db("neufoodNew");
  });

  afterEach(async () => {
    await connection.close();
    await mongoServer.stop();
    jest.restoreAllMocks();
  });

  it("should respond with a 200 status code when update is successfully completed", async () => {
    await db.collection("notifications").insertMany(mockData);

    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app)
      .put("/notifications/read")
      .send({ notificationID: 1 });
    expect(res.statusCode).toEqual(200);
  });

  it("should respond with a 400 status code when an error occurs", async () => {
    await db.collection("notifications").insertMany(mockData);

    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app)
      .put("/notifications/read")
      .send({ notificationID: 1 });
    expect(res.statusCode).toEqual(400);
  });
});
