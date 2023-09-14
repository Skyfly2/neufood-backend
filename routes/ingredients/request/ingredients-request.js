const express = require("express");
const router = express.Router();
require("dotenv").config();

const { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

//28.3 request for ingredient
router.put("/:ingredients_id/:user", async (req, res) => {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .findOneAndUpdate(
        { _id: uid },
        { $push: { request_list: req.params.user } }
      );
    if (result.value === null) {
      res.status(400).send("No record found.");
    } else {
      res.send("Successful updated.");
    }
    client.close();
  } catch (err) {
    //console.error(err);
    res.status(400).send("Error updating ingredient.");
  }
});

router.get("/:ingredients_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);

    const result = await dbo.collection("ingredients").findOne({ _id: uid });
    const request = result.request_list || [];
    const finalList = await Promise.all(
      request.map(async (email) => {
        const user = await dbo.collection("user").findOne({ email });
        return user ? { name: user.name, email: user.email } : {};
      })
    );

    res.send(finalList);
    client.close();
  } catch (err) {
    //console.error(err);
    res.status(400).send("Bad Request");
  }
});

module.exports = router;
