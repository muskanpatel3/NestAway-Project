const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, isAdmin } = require("../middleware.js");
const userController = require("../controllers/users.js");
const Listing = require('../models/listing');

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup))


router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: '/login',
            failureFlash: true
        }),
        userController.login
    );

router.get("/logout", userController.logout);


router.get('/admin', isLoggedIn, isAdmin, async (req, res) => {
    try {
        // Get all data in parallel
        const [users, listings] = await Promise.all([
            User.find({}).lean(),
            Listing.find({}).populate('owner').lean()
        ]);

        res.render('users/admin/dashboard', {
            users,
            listings  
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        req.flash('error', 'Failed to load dashboard data');
        res.redirect('/');
    }
})

router.route("/admin/users")
    .get(isLoggedIn, isAdmin, userController.listAllUsers)
    .post(isLoggedIn, isAdmin, wrapAsync(userController.createAdmin));

router.post("/admin/users/:id/promote", 
    isLoggedIn, 
    isAdmin, 
    wrapAsync(userController.promoteToAdmin));

router.post("/admin/users/:id/demote", 
    isLoggedIn, 
    isAdmin, 
    wrapAsync(userController.demoteAdmin));

router.delete("/admin/users/:id", 
    isLoggedIn, 
    isAdmin, 
    wrapAsync(userController.deleteUser));

module.exports = router;