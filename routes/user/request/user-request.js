const express = require("express");
const router = express.Router();
const constants = require("../../../constants/constants");
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

// 21.7 Get Request List
router.get("/list", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufoodNew");
    try {
      const friendRequests = await dbo
        .collection("notifications")
        .find({ receiver: req.body.email, type: constants.FRIEND_REQUEST });
      if (!friendRequests || friendRequests == null) {
        return res.status(400).json({ error: constants.SERVER_ERROR }).send();
      }
      const requests = friendRequests.map((curr) => curr.sender);
      res.status(200).send(requests);
    } catch (err) {
      return res.status(400).json({ error: constants.SERVER_ERROR }).send();
    }
    db.close();
  });
});

// 21.12 Add new reuqest to request list
router.post("/new-request", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufoodNew");
    try {
      const receiver = await dbo
        .collection("user")
        .findOne({ email: req.body.receiver });
      if (!receiver || receiver == null) {
        return res
          .status(400)
          .json({ error: constants.USER_DOES_NOT_EXIST })
          .send();
      }
    } catch (err) {
      return res.status(400).json({ error: constants.SERVER_ERROR }).send();
    }
    try {
      await dbo.collection("notifications").insertOne({
        receiver: req.body.receiver,
        sender: req.body.email,
        type: constants.FRIEND_REQUEST,
        message: constants.FRIEND_REQUEST_MESSAGE + req.body.email,
        isRead: false,
        date: new Date(),
      });
      res.status(200).send();
    } catch (err) {
      return res.status(400).json({ error: constants.SERVER_ERROR }).send();
    }
  });
});

// 21.13 Delete friend request
router.delete("/delete-request", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufoodNew");
    dbo
      .collection("notifications")
      .deleteOne({ sender: req.body.email, receiver: req.body.receiver })
      .then(function (result) {
        if (!result) throw new Error("No record found.");
        res.send();
        db.close();
      });
  });
});

module.exports = router;
