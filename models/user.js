const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
}
)

userSchema.post('findOneAndDelete', async function(user) {
    if (user) {
        const Listing = require('./listing');
        const Review = require('./review');
        const Reservation = require('./reservation');
        
        // Find all listings by this user
        const listings = await Listing.find({ owner: user._id });
        
        for (let listing of listings) {
            await Review.deleteMany({ _id: { $in: listing.reviews } });
        }
        
        // Delete all listings by this user
        await Listing.deleteMany({ owner: user._id });
        
        
        console.log(`Deleted all data associated with user ${user.username}`);
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);