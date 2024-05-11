const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressErr = require("./utils/ExpressErr");
const authRoute = require("./routes/auth");
const campgroundRouter = require("./routes/campground");
const reviewRouter = require("./routes/reviews");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

//! untuk mengkoneksikan ke database.
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//! sett untuk menggunakan ejs.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//! untuk merender view ejs & route.
app.get("/", (req, res) => {
  res.render("home");
});

//! middleware flash.
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.get("/fakeUser", async (req, res) => {
//   const user = new User({
//     email: "colt@gmail.com",
//     username: "colt77",
//   });

//   const newUser = await User.register(user, "chicken");
//   res.send(newUser);
// });

app.use("/auth", authRoute);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds", reviewRouter);

app.all("*", (req, res, next) => {
  next(new ExpressErr("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";

  res.status(status).render("error", { err });
});

app.listen(3000, () => console.log("Server started on port 3000"));
