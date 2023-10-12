const express = require("express");
const router = express.Router();
const constants = require("../../constants/constants");
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

// Get notifications
router.get("/:email", async (req, res) => {
  const client = await MongoClient.connect(url);

  try {
    const dbo = client.db("neufood");
    const result = await dbo
      .collection("notifications")
      .find({ receiver: req.params.email })
      .toArray();
    return res.status(200).json({ notifications: result });
  } catch (err) {
    return res.status(400).json({ error: constants.SERVER_ERROR });
  } finally {
    if (client) client.close();
  }
});

// Read notifications
router.put("/read", async (req, res) => {
  const client = await MongoClient.connect(url);

  try {
    const dbo = client.db("neufood");
    await dbo
      .collection("notifications")
      .updateOne({ _id: req.body.notificationID }, { $set: { isRead: true } });
    return res.status(200).send();
  } catch (err) {
    return res.status(400).json({ error: constants.SERVER_ERROR });
  } finally {
    if (client) client.close();
  }
});

// Add a new notification
router.post("/add", async (req, res) => {
  const { senderEmail, receiverEmail, notificationData } = req.body;

  const client = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db("neufood");

    const result = await db.collection("notifications").updateOne(
      {
        receiver: receiverEmail,
        sender: senderEmail,
        ...notificationData,
      },
      {
        $set: {
          receiver: receiverEmail,
          sender: senderEmail,
          ...notificationData,
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount || result.matchedCount) {
      return res
        .status(200)
        .json({ message: "Notification added successfully" });
    } else {
      return res.status(400).json({ error: "Failed to add notification" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.close();
  }
});

module.exports = router;
