const express = require("express");
const route = express.Router();
const catchAsync = require("../utils/asynchandler");
const {
  validationReviewSchema,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware");
const reviewController = require("../controllers/reviews");

route.post(
  "/:id/reviews",
  isLoggedIn,
  validationReviewSchema,
  catchAsync(reviewController.createReview)
);

route.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewController.deleteReview)
);

module.exports = route;
