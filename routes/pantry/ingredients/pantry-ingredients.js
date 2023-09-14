const express = require("express");
const router = express.Router();
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

//26.4 get ingredients base on pantry
router.get("/ingredients/:pantry_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const result = await dbo
      .collection("ingredients")
      .find({ pantry_list: { $in: [req.params.pantry_id] } })
      .toArray();
    res.send(result);
    client.close();
  } catch (err) {
    throw err;
  }
});

module.exports = router;
