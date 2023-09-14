const express = require("express");
const router = express.Router();
require("dotenv").config();

var { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

const ingredientsRouter = require("./ingredients/pantry-ingredients");
router.use("/ingredients", ingredientsRouter);

//26.0 Add new Pantry
router.post("/:name/:user", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");

    async function getUserEmail() {
      const result = await dbo
        .collection("user")
        .find({ uid: req.params.user })
        .toArray();
      if (result.length === 0) {
        // invalid user, return 400
        res.status(400);
        res.send(err);
        return [];
      }
      return result[0];
    }

    const user = await getUserEmail();
    const email = user.email;
    const name = user.name;

    const result = await dbo
      .collection("pantry")
      .insertOne({ name: req.params.name, owner: name, member_list: [email] });
    if (!result) res.status(400);

    res.send();
    client.close();
  } catch (err) {
    res.status(400).send(err);
  }
});

// 26.1 Delete Pantry
router.delete("/:pantry_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.pantry_id);
    const result = await dbo.collection("pantry").deleteOne({ _id: uid });
    if (result.deletedCount === 0) res.status(404);
    res.send();
    client.close();
  } catch (err) {
    res.status(400).send(err);
  }
});

// 26.2 Add Friend to memeber list
router.put("/:pantry_id/:member_id/:uid", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const pantry_id = new ObjectID(req.params.pantry_id);
    function getUserArray() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ uid: req.params.uid })
          .toArray(function (err, result) {
            if (result.length === 0) {
              // invalid email, return 400
              res.status(400);
              res.send(err);
              good(false);
            } else {
              for (var i = 0; i < result[0].friends_list.length; i++) {
                if (result[0].friends_list[i] === req.params.member_id) {
                  return good(true);
                }
              }
              res.status(400);
              good(false);
            }
            good(false);
          });
      });
    }
    const check = await getUserArray();
    if (check == true) {
      const result = await dbo
        .collection("pantry")
        .updateOne(
          { _id: pantry_id },
          { $push: { member_list: req.params.member_id } }
        );
      if (!result) return res.status(400).send();
      res.status(200);
      res.send();
      return client.close();
    }
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});

// 26.2 Delete Friend to memeber list
router.delete("/:pantry_id/1/:member_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const pantry_id = new ObjectID(req.params.pantry_id);
    const result = await dbo
      .collection("pantry")
      .updateOne(
        { _id: pantry_id },
        { $pull: { member_list: req.params.member_id } }
      );
    if (
      !result ||
      (result.modifiedCount === 0 &&
        result.upsertedCount === 0 &&
        result.matchedCount === 0)
    )
      res.status(404);
    res.send();
    client.close();
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// 28.8 get Pantry member list
router.get("/:pantry_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const pantry_id = new ObjectID(req.params.pantry_id);

    function getPantryArray() {
      return new Promise(function (good) {
        dbo
          .collection("pantry")
          .find({ _id: pantry_id })
          .toArray(function (err, result) {
            if (err) throw err;
            // will need to change if we add more attributes to user
            if (typeof result[0].member_list !== "undefined") {
              good(result[0].member_list);
            } else {
              good([]);
            }
          });
      });
    }

    async function getPantrys(array) {
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

    const pantry = await getPantryArray();
    const final_list = await getPantrys(pantry);

    res.send(final_list);

    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = router;
