const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: String,
  description: String,
  phone: String,
  image: {
    url: String,
    filename: String,
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reservations: [{
    type: Schema.Types.ObjectId,
    ref: "Reservation"
}],

  category:{
     type: String,
    enum: [
      "trending",
      "arctic",
      "camping",
      "farms",
      "rooms",
      "bed",
      "iconic-cities",
      "mountain",
      "castles",
      "amazing-pools",
      "domes",
      "boats",
      "deserts" 
  ],
  required: true
  }
}
);

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing && listing.reviews.length) {
      await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;

