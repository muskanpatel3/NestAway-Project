const { required } = require("joi");
const mongoose= require("mongoose");
const Schema = mongoose.Schema;

const reservationSchema = new mongoose.Schema({
  listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true
  },
  listingTitle: {
      type: String,
      required: true
  },
  
  listingPhone: {
      type: String,
      required: true
  },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
  },
  userName: {
      type: String,
      required: true
  },
  userEmail: {
      type: String,
      required: true
  },
  checkin: {
      type: Date,
      required: true
  },
  checkout: {
      type: Date,
      required: true
  },
  guests: {
      type: Number,
      required: true,
      min: 1
  },
  totalPrice: {
      type: Number,
      required: true
  },
  createdAt: {
      type: Date,
      default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'  // Changed from 'confirmed' to 'pending'
},
approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
},
approvedAt: Date
});


reservationSchema.index({ listingTitle: 'text', userName: 'text' });

module.exports = mongoose.model("Reservation", reservationSchema);