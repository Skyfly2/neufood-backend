const express = require("express");
const router = express.Router();
const constants = require("../../constants/constants");
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

router.get("/:email", async (req, res) => {
  const client = await MongoClient.connect(url);

  try {
    const dbo = client.db("neufoodNew");
    const result = await dbo
      .collection("notifications")
      .find({ receiver: req.params.email })
      .toArray();
    return res.status(200).json({ notifications: result }).send();
  } catch (err) {
    return res.status(400).json({ error: constants.SERVER_ERROR }).send();
  } finally {
    if (client) client.close();
  }
});

router.put("/read", async (req, res) => {
  const client = await MongoClient.connect(url);

  try {
    const dbo = client.db("neufoodNew");
    await dbo
      .collection("notifications")
      .updateOne({ _id: req.body.notificationID }, { $set: { isRead: true } });
    return res.status(200).send();
  } catch (err) {
    return res.status(400).json({ error: constants.SERVER_ERROR }).send();
  } finally {
    if (client) client.close();
  }
});

module.exports = router;
