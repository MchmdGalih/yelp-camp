const express = require("express");
const route = express.Router();
const Campground = require("../models/campground");
const catchAsync = require("../utils/asynchandler");

const {
  isLoggedIn,
  isAuthor,
  validationCampgroundSchema,
} = require("../middleware");

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
      // .populate("reviews") ini cara sebelumnya.
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
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

route.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

route.put(
  "/:id/edit",
  isAuthor,
  validationCampgroundSchema,
  catchAsync(async (req, res) => {
    const { id } = req.params;

    //! author check basic.
    // const findAuthorCampgrounds = await Campground.findById(id);
    // if (!findAuthorCampgrounds.author.equals(req.user._id)) {
    //   req.flash("error", "You do not have permission to do that");
    //   return res.redirect(`/campgrounds/${id}`);
    // }
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
