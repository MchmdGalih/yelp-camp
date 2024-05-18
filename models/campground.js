const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const ImagesSchema = new Schema({
  url: String,
  filename: String,
});

ImagesSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

const CampgroundSchema = new Schema({
  title: String,
  images: [ImagesSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//! ini middlewarenya.
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
