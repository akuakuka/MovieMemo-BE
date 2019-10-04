const express = require("express");
const session = require("express-session");
const app = express();
const cors = require("cors");
const passport = require("passport");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const MongoDBStore = require("connect-mongodb-session")(session);
const User = require("./models/User");
const omdbrouter = require("./controllers/Omdb");
const UsersRouter = require("./controllers/Users");
dotenv.config();
const PORT = process.env.PORT;
const bcrypt = require("bcrypt");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const LocalStrategy = require("passport-local");

let store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "mySessions"
});
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSIONSECRET,
    store: store,
    saveUninitialized: true,
    resave: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb) => {
  console.log("SERIALIZE called");
  cb(null, user);
});
passport.deserializeUser((obj, done) => {
  console.log("deserializeUser called");
  // console.log(obj)
  User.findById(obj._id, function(err, user) {
    done(err, user);
  });
});

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongoose connected!");
  })
  .catch(e => {
    console.log("Mongoose connect error!");
  });

const ensureAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

app.get("/", (req, res) => {
  res.send("root");
});
app.post("/api/users/localregister/", async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  console.log(req.body);
  console.log(username);
  if (User.findOne({ email: email }) === null) {
    console.log("MAIL TAKEN");
    res.send(`Email ${email} already taken`);
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);
    console.log("Creating new User");
    let user = await new User({
      displayName: username,
      email: email,
      password: hashedPassword
    }).save();
    res.send(user);
  }
});
app.post("/api/users/locallogin", async (req, res) => {
  console.log(req.body);
  let user = await User.findOne({
    displayName: req.body.username
  }).find.populate("groups");
  if (user === null) {
    res.send("User not found");
  } else {
    if (await bcrypt.compare(req.body.password, user.password)) {
      console.log("PASSMATCH");
      res.json(user);
    } else {
      console.log("Wrong pw");
      res.send("wrond pw");
    }
  }
});
passport.use(
  new LocalStrategy(async (username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {
        return done(null, false);
      }
      return done(null, user);
    });
  })
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENTSECRET,
      callbackURL: process.env.GOOGLE_CALLBACKRUL
    },
    async (accessToken, refreshToken, profile, cb) => {
      User.findOne({ googleId: profile.id }).then(user => {
        if (user) {
          console.log(`User ${user.id} logged in!`);
          cb(null, user);
        } else {
          console.log("Creating new User");
          new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile._json.email
          })
            .save()
            .then(user => {
              console.log(`new user created ${user}`);
              cb(null, user);
            });
        }
      });
    }
  )
);
app.use("/api/omdb", ensureAuthenticated, omdbrouter);
app.use("/api/users", ensureAuthenticated, UsersRouter);
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000/GoogleAuthRedirect");
  }
);

app.get("/login", (req, res) => {
  res.send("You got to the loginpage");
});
app.get("/logout", (req, res) => {
  req.session.destroy(function(err) {
    res.redirect("/"); //Inside a callback… bulletproof!
  });
});
app.get("/authrequired", (req, res) => {
  if (req.isAuthenticated()) {
    res.send("you hit the authentication endpoint");
  } else {
    res.redirect("/");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
