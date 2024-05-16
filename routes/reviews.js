const express = require("express");
const route = express.Router();
const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require("../utils/asynchandler");
const {
  validationReviewSchema,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware");

route.post(
  "/:id/reviews",
  isLoggedIn,
  validationReviewSchema,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

route.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      $pull: {
        reviews: reviewId,
      },
    });
    const review = await Review.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

module.exports = route;
