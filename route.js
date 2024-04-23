var express = require("express");
var app = express();

const dotenv = require("dotenv");
dotenv.config();

const { google } = require("googleapis");
const client = new google.auth.OAuth2();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

var MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URL;
const jwt = require("jsonwebtoken");

var express = require("express");
var app = express(); 
var recipes = require("./routes/recipes/recipes").recipes;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

/**
 * initialization of sub routes
 */
const authenticationRouter = require("./routes/authentication/authentication");
app.use("/authentication", authenticationRouter);

const dateRouter = require("./routes/date/date");
app.use("/date", dateRouter);

const ingredientsRouter = require("./routes/ingredients/ingredients");
app.use("/ingredients", ingredientsRouter);

const notificationsRouter = require("./routes/notifications/notifications");
app.use("/notifications", notificationsRouter);

const pantryRouter = require("./routes/pantry/pantry");
app.use("/pantry", pantryRouter);

const recipesRouter = require("./routes/recipes/recipes").router;
app.use("/recipes", recipesRouter);

const sharingRouter = require("./routes/sharing/sharing");
app.use("/sharing", sharingRouter);

const uploadRouter = require("./routes/upload/upload");
app.use("/upload", uploadRouter);

const userRouter = require("./routes/user/user");
app.use("/user", userRouter);

// https://stackoverflow.com/questions/19743396/cors-cannot-use-wildcard-in-access-control-allow-origin-when-credentials-flag-i
//app.use(cors({ credentials: true, origin: "*" }));
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("neufood");
  dbo
    .collection("recipes")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      recipes.push(result);
      db.close();
    });
});

//20.2 get ingredients list the user has
app.get("/:user_id/ingredients", function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    //var uid = new require('mongodb').ObjectID(req.params.user_id);
    dbo
      .collection("ingredients")
      .find({ user: req.params.user_id })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });
});

//26.5 get pantries the user joined
// instead of user_id, its email
app.get("/:user_id/pantry", function (req, res, next) {
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    function getUserEmail() {
      return new Promise(function (good) {
        dbo
          .collection("user")
          .find({ uid: req.params.user_id })
          .toArray(function (err, result) {
            if (result.length === 0) {
              // invalid user, return 400
              res.status(400);
              res.send(err);
              good([]);
            }
            good(result[0].email);
          });
      });
    }
    var email = await getUserEmail();
    dbo
      .collection("pantry")
      .find({ member_list: { $in: [email] } })
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });
});

//google auth
const users = []; //store user to mongo db or whatever.
const one_D_array = [];
function upsert(array, item) {
  const i = array.findIndex((_item) => _item.email === item.email);
  if (i > -1) array[i] = item;
  else array.push(item);
}
const curr_email_ = []; //dead
app.post("/api/google-login", async (req, res) => {
  const { token } = req.body;
  const users = {};
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  // get the name email and picture of user, email should be unique key
  const { name, email, picture, sub } = ticket.getPayload();
  uid = sub;
  users.name = name;
  users.email = email;
  users.picture = picture;
  users.id = sub;
  console.log(users);

  // find id in db and see if it matches
  MongoClient.connect(url, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("neufood");
    var user = await dbo.collection("user").find({ uid: sub }).toArray();
    if (user.length > 0) {
      // user is matched
      console.log("Welcome " + user[0].name);
      console.log("Your email is " + user[0].email);
    } else {
      // new user, add to database
      dbo.collection("user").insertOne({ uid: sub, name: name, email: email });
      console.log("Welcome " + name + " to NeufoodAI!");
      console.log("Thank you for making an account with us!");
    }
  });
  res.send(users);
});

// logout for google-api
app.get("/logout", (req, res) => {
  // remove session cookie need to implement
});

/*
 * Middleware below
 */
// verify with session cookie, if no session cookie, redirect to signin
app.post("/auth", async function checkAuthenticated(req, res, next) {
  let token = req.body.cookies;
  let id = req.body.id;
  /*async function getToken() {
    // let token = req.cookies['session-token']; <- for some reason this code doesn't work, this would be better to use if can implement
    try {
      token = req.body.cookies.substring(30); // this is the offset from the direct cookie String
    } catch {
      token = "failure";
    }
  } 
  await getToken(); */
  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    user.id = payload.sub;
  }

  verify()
    .then(() => {
      console.log("authenticated, let user through");
      res.send({ data: true });
    })
    .catch((err) => {
      onGoogleVerifyFailure();
    });

  const onGoogleVerifyFailure = () => {
    try {
      // Remove remnants of JSON.stringify
      token = token.substr(1, token.length - 2);
      id = id.substr(1, id.length - 2);

      const payload = jwt.verify(token, process.env.JWTSECRET);

      if (payload.id === id) {
        console.log("authenticated, let user through");
        res.send({ data: true });
      } else {
        console.log("not authenticated");
        res.send({ data: false });
      }
    } catch (err) {
      console.log("not authenticated");
      res.send({ data: false });
    }
  };
});

module.exports = app;
