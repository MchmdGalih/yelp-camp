const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressErr = require("./utils/ExpressErr");
const catchAsync = require("./utils/asynchandler");
const { campgroundSchema, reviewSchema } = require("./schemaValidations");

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

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

//! sett untuk menggunakan ejs.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//! validations with joi.
const validationCampgroundSchema = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErr(msg, 400);
  } else {
    next();
  }
};

const validationReviewSchema = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErr(msg, 400);
  } else {
    next();
  }
};

//! untuk merender view ejs & route.
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds/add", (req, res) => {
  res.render("campgrounds/add");
});

app.get("/campgrounds", async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render("campgrounds/index", { allCampgrounds });
});

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  })
);

app.post(
  "/campgrounds/add",
  validationCampgroundSchema,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressErr("Invalid Campground Data", 400);

    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

app.put(
  "/campgrounds/:id/edit",
  validationCampgroundSchema,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/delete",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

//! route untuk reviews.
app.post(
  "/campgrounds/:id/reviews",
  validationReviewSchema,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: {
        reviews: reviewId,
      },
    });
    const review = await Review.findByIdAndDelete(id);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressErr("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";

  res.status(status).render("error", { err });
});

app.listen(3000, () => console.log("Server started on port 3000"));
