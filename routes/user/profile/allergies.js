const express = require("express");
const router = express.Router();
const constants = require("../../../constants/constants");
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

router.post("/:uid", async (req, res) => {
  const uid = req.params.uid;
  const allergen = req.body.allergen;

  const db = await MongoClient.connect(url);
  const dbo = db.db("neufood");

  try {
    await dbo
      .collection("user")
      .updateOne({ uid: uid }, { $push: { allergens: allergen } });
    return res.status(200).send();
  } catch (e) {
    return res.status(400).send(e);
  }
});

router.get("/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db("neufood");

    const user = await dbo.collection("user").findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allergens = user.allergens || []; // Assuming 'allergens' is an array field in your user collection

    return res.status(200).json({ allergens: allergens });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
