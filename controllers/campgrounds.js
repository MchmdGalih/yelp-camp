const axios = require("axios");
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const GEO_BASE_URL = process.env.GEOAPIFY_BASEURL;

module.exports.index = async (req, res) => {
  const allCampgrounds = await Campground.find({});
  res.render("campgrounds/index", { allCampgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/add");
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    // .populate("reviews") ini cara sebelumnya.
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.createCampground = async (req, res) => {
  const geoData = await axios.get(
    `${GEO_BASE_URL}?text=${req.body.campground.location}&apiKey=${process.env.GEO_APIKEY}`
  );
  const dataGeometry = geoData.data.features[0].geometry;
  const newCampground = new Campground(req.body.campground);
  newCampground.geometry = dataGeometry;
  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  await newCampground.save();

  req.flash("success", "Successfully made a new Campground!");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find that Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  //! author check basic.
  // const findAuthorCampgrounds = await Campground.findById(id);
  // if (!findAuthorCampgrounds.author.equals(req.user._id)) {
  //   req.flash("error", "You do not have permission to do that");
  //   return res.redirect(`/campgrounds/${id}`);
  // }
  const updatedCampground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  updatedCampground.images.push(...imgs);
  await updatedCampground.save();
  if (req.body.deleteImages) {
    console.log("ini req.deleteImages -->", req.body.deleteImages);
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await updatedCampground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted Campground!");
  res.redirect("/campgrounds");
};
