const express = require("express");
const router = express.Router();
require("dotenv").config();

var { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

//20.4 update ingredient's sharing state
router.put("/:ingredients_id/:user_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .find({ user: req.params.user_id })
      .toArray();
    if (!result) {
      return res.status(400).send("No user found.");
    }
    const result2 = await dbo
      .collection("ingredients")
      .findOneAndUpdate({ _id: uid }, { $set: { sharing: !result.sharing } });
    if (!result2.value) {
      return res.status(400).send("No record found.");
    }
    res.send("successful updated");
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating ingredient sharing status");
  }
});

module.exports = router;
