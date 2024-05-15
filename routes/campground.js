const express = require("express");
const route = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/asynchandler");
const ExpressErr = require("../utils/ExpressErr");
const { campgroundSchema } = require("../schemaValidations");
const { isLoggedIn } = require("../middleware");

const validationCampgroundSchema = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErr(msg, 400);
  } else {
    next();
  }
};

route.get("/", async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render("campgrounds/index", { allCampgrounds });
});

route.get("/add", isLoggedIn, (req, res) => {
  res.render("campgrounds/add");
});

route.get(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
      .populate("reviews")
      .populate("author");
    console.log(campground);
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

route.get(
  "/:id/edit",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  })
);

route.post(
  "/add",
  isLoggedIn,
  validationCampgroundSchema,
  catchAsync(async (req, res, next) => {
    req.flash("success", "Successfully made a new Campground!");
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

route.put(
  "/:id/edit",

  validationCampgroundSchema,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

route.delete(
  "/:id/delete",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted Campground!");
    res.redirect("/campgrounds");
  })
);

module.exports = route;
