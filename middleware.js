const Campground = require("./models/campground");
const Review = require("./models/review");
const ExpressErr = require("./utils/ExpressErr");
const { campgroundSchema, reviewSchema } = require("./schemaValidations");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/auth/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validationCampgroundSchema = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErr(msg, 400);
  } else {
    next();
  }
};

//! validations with joi.
module.exports.validationReviewSchema = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressErr(msg, 400);
  } else {
    next();
  }
};

//! authorization middleware.
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const findAuthorCampgrounds = await Campground.findById(id);
  if (!findAuthorCampgrounds.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const findAuthorReview = await Review.findById(reviewId);
  if (!findAuthorReview.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};
