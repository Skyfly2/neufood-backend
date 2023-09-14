const express = require("express");
const router = express.Router();
require("dotenv").config();

var { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

var recipes = [];

//get all recipes
router.get("/", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const result = await dbo.collection("recipes").find({}).toArray();
    res.send(result);
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving recipes");
  }
});

// get user recipe based on pantry
router.get("/:user_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const recipes = await dbo.collection("recipes").find({}).toArray();
    const ingredientsResult = await dbo
      .collection("ingredients")
      .find({ user: req.params.user_id })
      .toArray();

    const ingredients = ingredientsResult.map((i) => i.name);
    const result = [];

    for (let i = 0; i < recipes.length; i++) {
      let check = true;
      for (let j = 0; j < recipes[i].ingredients_array.length; j++) {
        if (!ingredients.includes(recipes[i].ingredients_array[j].name)) {
          check = false;
        }
      }
      if (check) {
        result.push(recipes[i]);
      }
    }

    res.send(result);
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while processing your request.");
  }
});

//delete recipes
router.delete("/:recipes_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.recipes_id);
    const result = await dbo
      .collection("recipes")
      .findOneAndDelete({ _id: uid });
    if (result.value === null) res.status(400).send("No record found.");
    res.send();
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting recipe");
  }
});

//20.7 add recipes
router.post(
  "/:name/:ingredients/:preparation/:nutrition",
  async function (req, res, next) {
    try {
      const client = await MongoClient.connect(url);
      const dbo = client.db("neufood");
      const result = await dbo.collection("recipes").insertOne({
        name: req.params.name,
        ingredients: req.params.ingredients,
        preparation: req.params.preparation,
        nutrition: req.params.nutrition,
      });
      if (!result.insertedId) res.status(400);
      res.send();
      client.close();
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding recipe");
    }
  }
);

module.exports = { router, recipes };
