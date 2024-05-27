const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelper");
const Campground = require("../models/campground");

//! untuk mengkoneksikan ke database.
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sampel = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      //! USER ID.
      author: "663f5083d7f534bb78093943",
      title: `${sampel(descriptors)} ${sampel(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dss9fdhpn/image/upload/v1715939865/yelpcamp/akv6o3kmzixs2q1jlvd3.jpg",
          filename: "yelpcamp/akv6o3kmzixs2q1jlvd3",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
