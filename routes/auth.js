const express = require("express");
const route = express.Router();
const passport = require("passport");
catchAsync = require("../utils/asynchandler");
const User = require("../models/user");

route.get("/register", (req, res) => {
  res.render("auth/register");
});
route.get("/login", (req, res) => {
  res.render("auth/login");
});

route.post(
  "/signUp",
  catchAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      console.log(registeredUser);
      req.flash("success", "You are successfully registered!");
      res.redirect("/auth/login");
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/auth/register");
    }
  })
);

route.post(
  "/signIn",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/auth/login",
  }),
  function (req, res) {
    req.flash("success", "Welcome Back!");
    res.redirect("/campgrounds");
  }
);

module.exports = route;
