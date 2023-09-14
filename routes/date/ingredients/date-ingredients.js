const express = require("express");
const router = express.Router();
require("dotenv").config();

const { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

//20.4 update ingredient's date
router.put("/:ingredients_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .findOneAndUpdate({ _id: uid }, { $set: { date: new Date() } });
    if (result.value === null) {
      res.status(400).send("No record found.");
    } else {
      res.send("Successful updated.");
    }
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating ingredient date");
  }
});

module.exports = router;
