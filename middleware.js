const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
       
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}


module.exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    req.flash('error', 'You do not have permission to do that!');
    res.redirect('/listings');
};

module.exports.saveRedirectUrl = (req, res, next)=>{
    if (req.session.redirectUrl) {
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next();
}


// middleware.js
module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }

        if (!listing.owner.equals(req.user._id) && !req.user.isAdmin) {
            req.flash('error', 'You do not have permission to do that!');
            return res.redirect(`/listings/${id}`);
        }
        
        req.listing = listing;
        next();
    } catch (err) {
        console.error('Error in isOwner middleware:', err);
        req.flash('error', 'Something went wrong');
        res.redirect('/listings');
    }
};



module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req, res, next)=>{
    let { id, reviewId } = req.params;
        let review = await Review.findById(reviewId);
        if (! review.author._id.equals(res.locals.currUser._id)) {
            req.flash("error", "you are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
};
