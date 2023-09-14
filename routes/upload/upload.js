const express = require("express");
const router = express.Router();
require("dotenv").config();

const path = require("path");

///google cloud storage
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "views");
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
  },
});
const pict_Gdrive_url = [];
let projectId = "cloudstroage"; // Get this from Google Cloud
let keyFilename = "mykey.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
  projectId,
  keyFilename,
});
const bucket = storage.bucket("files_storage_neufood"); // Get this from Google Cloud -> Storage

// Gets all files in the defined bucket
router.get("/", function (req, res, next) {
  console.log("hello!");
  res.send(pict_Gdrive_url.pop());
});

// Streams file upload to Google Storage
router.post("/", multer.single("imgfile"), (req, res) => {
  console.log("Made it /upload");
  try {
    if (req.file) {
      console.log("File found, trying to upload...");
      const blob = bucket.file(req.file.originalname);

      const blobStream = blob.createWriteStream();
      blobStream.on("finish", () => {
        console.log(req.file.originalname);
        pict_Gdrive_url.push(req.file.originalname);
        res.send("idiot");
        console.log("Success");
      });
      blobStream.end(req.file.buffer);
    } else throw "error with img";
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
