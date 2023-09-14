const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

const constants = require("../../constants/constants");
const registrationUtils = require("../../utils/registration-utils");

router.post("/register", (req, res) => {
  if (!registrationUtils.validatePassword(req.body.email, req.body.password)) {
    return res.status(400).json({ error: constants.INVALID_PASSWORD }).send();
  }
  if (!registrationUtils.validateEmail(req.body.email)) {
    return res.status(400).json({ error: constants.INVALID_EMAIL }).send();
  }
  if (!registrationUtils.validateName(req.body.firstname)) {
    return res.status(400).json({ error: constants.INVALID_FIRSTNAME }).send();
  }
  if (!registrationUtils.validateName(req.body.lastname)) {
    return res.status(400).json({ error: constants.INVALID_LASTNAME }).send();
  }

  const hashCallback = (err, hash) => {
    if (err) {
      console.log(err);
      return res.status(400).send();
    }

    const user = {
      uid: uuid.v4(),
      password: hash,
      name: req.body.firstName + " " + req.body.lastName,
      email: req.body.email,
    };

    MongoClient.connect(url, async (err, db) => {
      if (err) throw err;
      const dbo = db.db("neufood");
      dbo
        .collection("user")
        .updateOne(
          { email: user.email },
          {
            $setOnInsert: {
              uid: user.uid,
              email: user.email,
              name: user.name,
              password: user.password,
            },
          },
          { upsert: true }
        )
        .then((result) => {
          if (!result) throw new Error("Error on insertion");
          if (result.matchedCount !== 0)
            return res.status(400).json({ error: constants.DUPLICATE_EMAIL });
          res
            .status(200)
            .json({
              name: user.name,
              email: user.email,
              id: user.uid,
              picture: null,
              token: jwt.sign({ id: user.uid }, process.env.JWTSECRET, {
                expiresIn: "24h",
              }),
            })
            .send();
          db.close();
        });
    });
  };
  bcrypt.hash(req.body.password, 10, hashCallback);
});

router.post("/login", (req, res) => {
  MongoClient.connect(url, async (err, db) => {
    if (err) throw err;
    const dbo = db.db("neufood");
    const user = await dbo
      .collection("user")
      .findOne({ email: req.body.email });
    if (!user || user == null)
      return res
        .status(400)
        .json({ error: constants.USER_DOES_NOT_EXIST })
        .send();
    const compareCallback = (err, valid) => {
      if (err) throw err;
      if (valid) {
        return res
          .status(200)
          .json({
            name: user.name,
            email: user.email,
            id: user.uid,
            picture: null,
            token: jwt.sign({ id: user.uid }, process.env.JWTSECRET, {
              expiresIn: "24h",
            }),
          })
          .send();
      } else {
        return res.status(400).json({ error: constants.WRONG_PASSWORD }).send();
      }
    };
    bcrypt.compare(req.body.password, user.password, compareCallback);
  });
});

module.exports = router;
