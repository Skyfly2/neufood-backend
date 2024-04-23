const express = require("express");
const router = express.Router();
require("dotenv").config();

var { MongoClient, ObjectID } = require("mongodb");
const url = process.env.MONGODB_URL;

const imageRouter = require("./image/ingredients-image");
router.use("/image", imageRouter);

const ownershipRouter = require("./ownership/ingredients-ownership");
router.use("/ownership", ownershipRouter);

const requestRouter = require("./request/ingredients-request");
router.use("/request", requestRouter);

const pantryRouter = require("./pantry/ingredients-pantry");
router.use("/pantry", pantryRouter);

const userRouter = require("./user/ingredients-user");
router.use("/user", userRouter);

//get all ingredients
router.get("/", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const result = await dbo.collection("ingredients").find({}).toArray();
    res.send(result);
    client.close();
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

//20.3 delete ingredients
router.delete("/:ingredients_id", async function (req, res, next) {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .findOneAndDelete({ _id: uid });
    if (result.value === null) {
      client.close();
      return res.status(400).send("No record found.");
    }
    res.send("successfully deleted.");
    client.close();
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

// 20.4 update ingredient's quantity
router.put("/:ingredients_id/:quantity", async (req, res, next) => {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .findOneAndUpdate(
        { _id: uid },
        { $set: { quantity: req.params.quantity } }
      );
    if (!result.value) {
      return res.status(400).send("No record found.");
    }
    res.send("Successfully updated.");
    client.close();
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

// 26.7 share ingredients to pantry
router.put("/1/pantry/:ingredients_id/:pantry", async (req, res, next) => {
  try {
    const client = await MongoClient.connect(url);
    const dbo = client.db("neufood");
    const uid = new ObjectID(req.params.ingredients_id);
    const result = await dbo
      .collection("ingredients")
      .findOneAndUpdate(
        { _id: uid },
        { $push: { pantry_list: req.params.pantry } }
      );
    if (!result.value) {
      return res.status(400).send("No record found.");
    }
    res.send("Successfully updated.");
    client.close();
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
});

//20.7 add ingredients
router.post(
  "/:name/:price/:category/:quantity/:user",
  async function (req, res, next) {
    try {
      const client = await MongoClient.connect(url);
      const dbo = client.db("neufood");

      const user = await dbo
        .collection("user")
        .findOne({ uid: req.params.user });

      if (!user) {
        // invalid user, return 400
        res.status(400).send("Invalid user ID");
        return;
      }

      await dbo.collection("ingredients").insertOne({
        name: req.params.name,
        price: req.params.price,
        category: req.params.category,
        quantity: req.params.quantity,
        user: req.params.user,
        expiration_date: req.body.expiration_date,
        date: new Date(),
        sharing: false,
        request_list: [],
        user_list: [],
        pantry_list: [],
        owner: user.name,
      });

      res.send();

      client.close();
    } catch (err) {
      console.error(err);
      res.status(400).send();
    }
  }
);

// looks not functiona, never used
async function search(name) {
  const SerpApi = require("google-search-results-nodejs");
  const search = new SerpApi.GoogleSearch(
    "c24b4adb8fa00bd7d0522f443ae51b2145b1b289b69ae712026a4381f451c904"
  );
  let img_name = "images of " + name;
  const params = {
    q: img_name,
    location: "United States",
    hl: "en",
    gl: "us",
    google_domain: "google.com",
  };
  let key = "";

  const callback = function (data) {
    //let key = "";
    /*
      for (let i = 0; i < data.inline_images.length; i++) {
        if (data.inline_images[i].original) {
          key=(data.inline_images[i].original);
          break;
        }
      }
      */
    key = data.inline_images[0].original;
  };

  const doSomethingAsync = () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(key), 500);
    });
  };

  const doSomething = async () => {
    let y = await doSomethingAsync();
    return y;
  };

  search.json(params, callback);
  return doSomething();
}

module.exports = router;
