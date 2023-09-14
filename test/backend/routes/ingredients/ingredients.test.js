const request = require("supertest");
const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../route");

const mockData = [
  { _id: 1, pantry: 1, name: "test" },
  { _id: 2, pantry: 2, name: "test2" },
];

describe("GET /ingredients", () => {
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

    db = await connection.db("neufood");
    await db.collection("ingredients").insertMany(mockData);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should respond with a 200 status code when there is no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/ingredients");
    expect(res.statusCode).toEqual(200);
  });

  it("should return an array of ingredients when there is no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);

    const res = await request(app).get("/ingredients");
    expect(res.body).toEqual(mockData);
    expect(res.statusCode).toEqual(200);
  });

  it("should return a 400 status code if there is an error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);

    const res = await request(app).get("/ingredients");

    expect(res.statusCode).toEqual(400);
  });
});

describe("DELETE /ingredients/:ingredients_id", () => {
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
    const ingredient = { _id: new ObjectID("123456789123") };
    db = await connection.db("neufood");
    await db.collection("ingredients").insertOne(ingredient);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 400 if ingredient is not found", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete("/ingredients/456789123456");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).delete("/ingredients/123456789123");
    expect(res.status).toBe(400);
  });

  it("should delete the ingredient if it exists", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete(`/ingredients/123456789123`);
    expect(res.status).toBe(200);
  });
});

describe("PUT /ingredients/:ingredients_id/:quantity", () => {
  let connection;
  let db;
  let mongoServer;
  const ingredient = {
    _id: new ObjectID("123456789123"),
    name: "test",
    quantity: 5,
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

  it("should return 200 if the ingredient is added successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/123456789123/3");
    expect(res.status).toBe(200);
  });

  it("should return 400 if the ingredient ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/456789123456/3");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).put("/ingredients/123456789123/3");
    expect(res.status).toBe(400);
  });
});

describe("PUT /ingredients/:ingredients_id/:quantity", () => {
  let connection;
  let db;
  let mongoServer;
  const ingredient = {
    _id: new ObjectID("123456789123"),
    name: "test",
    quantity: 5,
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

  it("should return 200 if the ingredient is added successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/123456789123/3");
    expect(res.status).toBe(200);
  });

  it("should return 400 if the ingredient ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/456789123456/3");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).put("/ingredients/123456789123/3");
    expect(res.status).toBe(400);
  });
});

describe("PUT /ingredients/1/pantry/:ingredients_id/:pantry", () => {
  let connection;
  let db;
  let mongoServer;
  const ingredient = {
    _id: new ObjectID("123456789123"),
    name: "test",
    quantity: 5,
    pantry_list: [],
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

  it("should return 200 if the ingredient is added successfully", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/1/pantry/123456789123/3");
    expect(res.status).toBe(200);
  });

  it("should return 400 if the ingredient ID is invalid", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).put("/ingredients/1/pantry/456789123456/3");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).put("/ingredients/1/pantry/123456789123/3");
    expect(res.status).toBe(400);
  });
});

describe("POST /ingredients/:name/:price/:category/:quantity/:user", () => {
  let connection;
  let db;
  let mongoServer;

  const ingredient = { name: "test", quantity: 5 };

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
    await db.collection("ingredients");
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 400 if user is not found", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).post("/ingredients/test/5/5/5/456");
    expect(res.status).toBe(400);
  });

  it("should return 400 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).post("/ingredients/test/5/5/5/123");
    expect(res.status).toBe(400);
  });

  it("should create a new pantry with correct data", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).post(`/ingredients/test/5/5/5/123`);
    expect(res.status).toBe(200);
  });
});
