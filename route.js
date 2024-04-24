var express = require("express");
var app = express();

const dotenv = require("dotenv");
dotenv.config();

const { google } = require("googleapis");
const client = new google.auth.OAuth2();
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const url = process.env.MONGODB_URI;
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




//google auth
const users = []; //store user to mongo db or whatever.
const one_D_array = [];
function upsert(array, item) {
  const i = array.findIndex((_item) => _item.email === item.email);
  if (i > -1) array[i] = item;
  else array.push(item);
}
const curr_email_ = [];
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
  // remove session cookie
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
