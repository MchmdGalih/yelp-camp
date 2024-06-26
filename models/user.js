const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Scehma = mongoose.Schema;

const userSchema = new Scehma({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
