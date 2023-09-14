const express = require("express");
const router = express.Router();
require("dotenv").config();

var { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

//20.4 update ingredient's image
router.put("/:ingredients_id/:url", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const image_url =
      "https://storage.googleapis.com/files_storage_neufood/" + req.params.url;
    const result = await dbo
      .collection("ingredients")
      .findOneAndUpdate({ _id: uid }, { $set: { image: image_url } });
    if (result.value === null) {
      res.status(400).send("No record found.");
    } else {
      res.send("Successfully updated image " + image_url);
    }
    client.close();
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
