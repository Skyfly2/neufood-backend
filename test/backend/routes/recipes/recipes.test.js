const request = require("supertest");
const { MongoClient, ObjectID } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../../../route");

const mockRecipes = [
  {
    _id: 1,
    name: "sandwich",
    ingredients_array: [{ name: "lettuce" }, { name: "bread" }],
  },
  {
    _id: 2,
    name: "burger",
    ingredients_array: [{ name: "cheese" }, { name: "bread" }],
  },
];

const mockIngredients = [
  { name: "lettuce", user: "123" },
  { name: "bread", user: "123" },
  { name: "cheese", user: "456" },
];

describe("GET /recipes", () => {
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
    await db.collection("recipes").insertMany(mockRecipes);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should respond with a 200 status code when there is no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/recipes");
    expect(res.statusCode).toEqual(200);
  });

  it("should return an array of recipes when there is no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);

    const res = await request(app).get("/recipes");
    expect(res.body).toEqual(mockRecipes);
    expect(res.statusCode).toEqual(200);
  });

  it("should return a 400 status code if there is an error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);

    const res = await request(app).get("/recipes");

    expect(res.statusCode).toEqual(500);
  });
});

describe("GET /recipes/:user_id", () => {
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
    await db.collection("recipes").insertMany(mockRecipes);
    await db.collection("ingredients").insertMany(mockIngredients);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should respond with a 200 status code when there is no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).get("/recipes/123");
    expect(res.statusCode).toEqual(200);
  });

  it("should return an array of recipes when there is no error and matching recipes", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);

    const res = await request(app).get("/recipes/123");
    expect(res.body).toEqual([mockRecipes[0]]);
    expect(res.statusCode).toEqual(200);
  });

  it("should return an empty array of recipes when there are no recipes and no error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);

    const res = await request(app).get("/recipes/456");
    expect(res.body).toEqual([]);
    expect(res.statusCode).toEqual(200);
  });

  it("should return a 500 status code if there is an error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);

    const res = await request(app).get("/recipes/123");

    expect(res.statusCode).toEqual(500);
  });
});

describe("DELETE /recipes/:recipes_id", () => {
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
    const recipe = { _id: new ObjectID("123456789123") };
    db = await connection.db("neufood");
    await db.collection("recipes").insertOne(recipe);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 400 if recipe is not found", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete("/recipes/456789123456");
    expect(res.status).toBe(400);
  });

  it("should return 500 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).delete("/recipes/123456789123");
    expect(res.status).toBe(500);
  });

  it("should delete the recipe if it exists", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).delete(`/recipes/123456789123`);
    expect(res.status).toBe(200);
  });
});

describe("POST /recipes/:name/:ingredients/:preparation/:nutrition", () => {
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
    const recipe = {
      name: "pizza",
      ingredients: "yum",
      peparation: "step 1",
      nutrition: "1 cal",
    };
    db = await connection.db("neufood");
    await db.collection("recipes").insertOne(recipe);
  });

  afterEach(async () => {
    await mongoServer.stop();
    await connection.close();
    jest.restoreAllMocks();
  });

  it("should return 200 if recipe is successfully added", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(connection);
    const res = await request(app).post(
      "/recipes/cheesesteak/cheese/cook/5cal"
    );
    expect(res.status).toBe(200);
  });

  it("should returnn 500 if there is a server error", async () => {
    jest.spyOn(MongoClient, "connect").mockReturnValue(null);
    const res = await request(app).post(
      `/recipes/cheesesteak/cheese/cook/5cal`
    );
    expect(res.status).toBe(500);
  });
});
