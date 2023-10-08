const express = require("express");
const router = express.Router();
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

const allergiesRouter = require("./profile/allergies");
router.use("/allergy", allergiesRouter);

const friendsRouter = require("./friends/user-friends");
router.use("/friends", friendsRouter);

const requestRouter = require("./request/user-request");
router.use("/request", requestRouter);

const allergyRouter = require("./taste/user-taste");
router.use("/allergy", allergyRouter);

//21.2 get user information
router.get("/:user_id", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo
      .collection("user")
      .find({ uid: req.params.user_id })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });
});

//21.3 Add Friend to friend list
router.post("/:user_id/:email", function (req, res, next) {
  debugger;
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getUserArray() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ email: req.params.email })
          .toArray(function (err, result) {
            if (result.length === 0) {
              res.status(400);
              res.send(err);
              good(false);
            } else if (result[0].uid === req.params.user_id) {
              // trying to request themself, return 401 error
              res.status(401);
              res.send(err);
              good(false);
            }
            good(true);
          });
      });
    }
    function checkList() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ uid: req.params.user_id })
          .toArray(function (err, result) {
            if (typeof result[0].request_list !== "undefined") {
              for (var z = 0; z < result[0].request_list.length; z++) {
                if (result[0].request_list[z] === req.params.email) {
                  res.status(400);
                  res.send(err);
                  good(false);
                }
              }
            }
            if (typeof result[0].friends_list !== "undefined") {
              for (var z = 0; z < result[0].friends_list.length; z++) {
                if (result[0].friends_list[z] === req.params.email) {
                  res.status(400);
                  res.send(err);
                  good(false);
                }
              }
            }
            good(true);
          });
      });
    }
    var found = await getUserArray();
    var check = await checkList();
    if (found == true && check == true) {
      dbo
        .collection("user")
        .updateOne(
          { uid: req.params.user_id },
          { $push: { friends_list: req.params.email } }
        )
        .then(function (result) {
          if (!result) throw new Error("No record found.");
          res.send();
          db.close();
        });
    }
  });
});

// new put function
router.put("/:user_id/:email", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getUserArray() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ uid: req.params.user_id })
          .toArray(function (err, result) {
            if (result.length === 0) {
              console.log("1");
              res.status(400);
              res.send(err);
              good({});
            }
            good(result[0]);
          });
      });
    }
    function checkList() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ email: req.params.email })
          .toArray(function (err, result) {
            if (typeof result[0].request_list !== "undefined") {
              for (var z = 0; z < result[0].request_list.length; z++) {
                if (result[0].request_list[z] === req.params.email) {
                  console.log("2");
                  res.status(400);
                  res.send(err);
                  good(false);
                }
              }
            }
            if (typeof result[0].friends_list !== "undefined") {
              for (var z = 0; z < result[0].friends_list.length; z++) {
                if (result[0].friends_list[z] === req.params.email) {
                  console.log("3");
                  res.status(400);
                  res.send(err);
                  good(false);
                }
              }
            }
            good(true);
          });
      });
    }
    var check = await checkList();
    var user = await getUserArray();
    if (check == true) {
      dbo
        .collection("user")
        .updateOne(
          { email: req.params.email },
          { $push: { friends_list: user.email } }
        )
        .then(function (result) {
          if (!result) throw new Error("No record found.");
          res.send();
          db.close();
        });
    }
  });
});

//21.4 Delete a friend in the friend list
router.delete("/:user_id/:friend_id", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    dbo
      .collection("user")
      .updateOne(
        { uid: req.params.user_id },
        { $pull: { friends_list: req.params.friend_id } }
      )
      .then(function (result) {
        if (!result) throw new Error("No record found.");
      });
    function getUserArray() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ uid: req.params.user_id })
          .toArray(function (err, result) {
            if (result.length === 0) {
              res.status(400);
              res.send(err);
              good({});
            }
            good(result[0]);
          });
      });
    }
    var user = await getUserArray();
    dbo
      .collection("user")
      .updateOne(
        { email: req.params.friend_id },
        { $pull: { friends_list: user.email } }
      )
      .then(function (result) {
        if (!result) throw new Error("No record found.");
        res.send();
        db.close();
      });
  });
});

module.exports = router;
