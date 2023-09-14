const express = require("express");
const router = express.Router();
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

// 21.7 Get Friends
router.get("/:uid", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getFriendsArray() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ uid: req.params.uid })
          .toArray(function (err, result) {
            if (err) throw err;
            // will need to change if we add more attributes to user
            if (typeof result[0].friends_list !== "undefined") {
              good(result[0].friends_list);
            } else {
              good([]);
            }
          });
      });
    }
    async function getFriends(array) {
      const rest = [];
      for (var i = 0; i < array.length; i++) {
        rest.push(
          new Promise((resolve, reject) => {
            dbo
              .collection("user")
              .find({ email: array[i] })
              .toArray(async function (err, result) {
                if (err) throw err;
                if (result.length != 0) {
                  resolve({ name: result[0].name, email: result[0].email });
                } else {
                  // error case
                  resolve({});
                }
              });
          })
        );
      }
      const weGooo = await Promise.all(rest);
      return weGooo;
    }
    var friend = await getFriendsArray();
    var final_list = await getFriends(friend);
    res.send(final_list);
  });
});

module.exports = router;
