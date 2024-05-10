const express = require("express");
const route = express.Router();
const Campground = require("../models/campground");
const Review = require("../models/review");
const catchAsync = require("../utils/asynchandler");
const ExpressErr = require("../utils/ExpressErr");
const { reviewSchema } = require("../schemaValidations");

//! validations with joi.
const validationReviewSchema = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErr(msg, 400);
  } else {
    next();
  }
};

route.post(
  "/:id/reviews",
  validationReviewSchema,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

route.delete(
  "/:id/reviews/:reviewId",
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
