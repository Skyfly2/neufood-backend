const express = require("express");
const router = express.Router();
require("dotenv").config();

const { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

router.put("/:ingredients_id/:user", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .findOneAndUpdate(
        { _id: uid },
        { $push: { user_list: req.params.user } }
      );
    if (result.value === null) {
      console.log("not found");
      res.status(400).send("No record found.");
      return;
    }
    res.send("successful updated");
    client.close();
  } catch (err) {
    console.error(err);
    res.status(400).send("Error occurred while updating ingredient.");
  }
});

module.exports = router;
