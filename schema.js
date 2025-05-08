const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        phone: Joi.string().required()
        .pattern(/^[6-9]\d{9}$/)
        // .message("Phone must be a valid 10-digit number starting with 6-9")
        .required(),
        category: Joi.string().valid("trending",
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
            "deserts") .default('trending')
            .required()


    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),

    }).required()
})