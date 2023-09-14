const express = require("express");
const router = express.Router();
require("dotenv").config();

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;

const ingredientsRouter = require("./ingredients/date-ingredients");
router.use("/ingredients", ingredientsRouter);

module.exports = router;
