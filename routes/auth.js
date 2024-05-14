const express = require("express");
const route = express.Router();
const passport = require("passport");
catchAsync = require("../utils/asynchandler");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");

route.get("/register", (req, res) => {
  res.render("auth/register");
});
route.get("/login", (req, res) => {
  res.render("auth/login");
});

route.post(
  "/signUp",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, function (err) {
        if (err) return next(err);
        req.flash("success", "You are successfully registered!");
        res.redirect("/auth/login");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/auth/register");
    }
  })
);

route.post(
  "/signIn",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/auth/login",
  }),
  function (req, res) {
    req.flash("success", "Welcome Back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
  }
);

route.get("/signOut", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});
module.exports = route;
