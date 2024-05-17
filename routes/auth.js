const express = require("express");
const route = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/asynchandler");
const { storeReturnTo } = require("../middleware");
const authController = require("../controllers/auth");

route.get("/register", authController.renderRegister);
route.get("/login", authController.renderLogin);
route.post("/signUp", catchAsync(authController.signUp));
route.post(
  "/signIn",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/auth/login",
  }),
  authController.signIn
);
route.get("/signOut", authController.signOut);

module.exports = route;
