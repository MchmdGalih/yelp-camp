const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("auth/register");
};

module.exports.renderLogin = (req, res) => {
  res.render("auth/login");
};

module.exports.signUp = async (req, res, next) => {
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
};

module.exports.signIn = (req, res) => {
  const currentUser = req.user;
  req.flash("success", `Welcome back ${currentUser.username}!`);
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(redirectUrl);
};

module.exports.signOut = (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
