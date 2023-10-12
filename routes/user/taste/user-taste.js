const express = require("express");
const router = express.Router();
const constants = require("../../../constants/constants");
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

// Get Allergy List
router.get("/list", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    try {
      const allergyList = await dbo
        .collection("user")
        .find({ email: req.body.email });
      res.status(200).send(allergyList);
    } catch (err) {
      return res.status(400).json({ error: constants.SERVER_ERROR }).send();
    }
    db.close();
  });
});

// 21.12 Add new reuqest to request list
router.post("/:uid", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufoodNew");
    try {
      await dbo
        .collection("user")
        .updateOne({ uid: uid }, { $push: { allergies: allergens } });
      res.status(200).send();
    } catch (err) {
      return res.status(400).json({ error: constants.SERVER_ERROR }).send();
    }
  });
});

module.exports = router;
