const express = require("express");
const route = express.Router();
const catchAsync = require("../utils/asynchandler");
const campgroundController = require("../controllers/campgrounds");
const multer = require("multer");
//! step-3 untuk menyimpan filenya ke cloudinary.
const { storage } = require("../cloudinary/index.js");
const upload = multer({ storage });
//! --- end --
const {
  isLoggedIn,
  isAuthor,
  validationCampgroundSchema,
} = require("../middleware");

route.get("/", campgroundController.index);

route.get("/add", isLoggedIn, campgroundController.renderNewForm);

route.get("/:id", catchAsync(campgroundController.showCampground));

route.post(
  "/add",
  isLoggedIn,
  upload.array("image"),
  validationCampgroundSchema,
  catchAsync(campgroundController.createCampground)
);

route.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundController.renderEditForm)
);

route.put(
  "/:id/edit",
  isAuthor,
  validationCampgroundSchema,
  catchAsync(campgroundController.updateCampground)
);

route.delete(
  "/:id/delete",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundController.deleteCampground)
);

module.exports = route;
