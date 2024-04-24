const express = require("express");
const mongoose = require("mongoose");
const app = express();
const allergiesRoutes = require("./routes/allergies");
const badgesRoutes = require("./routes/badges");
const dotenv = require('dotenv');
dotenv.config();

// Check if MongoDB URI is provided
if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI not found. Please make sure to set the MONGODB_URI environment variable.');
  process.exit(1);
}

// Connect to MongoDB using Mongoose
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Mount the routes
app.use("/allergies", allergiesRoutes);
app.use("/badges", badgesRoutes);

module.exports = app;

