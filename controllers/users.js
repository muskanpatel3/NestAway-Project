
const User = require("../models/user");
const Listing = require("../models/listing");

module.exports = {
    renderSignupForm: (req, res) => {
        res.render("users/signup");
    },

    signup: async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            const newUser = new User({ email, username });
            const registeredUser = await User.register(newUser, password);
            
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash("success", "Welcome to StayAway!");
                res.redirect("/listings");
            });
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    },

    renderLoginForm: (req, res) => {
        res.render("users/login");
    },

    login: (req, res) => {
        req.flash("success", "Welcome back to StayAway!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    },

    logout: (req, res, next) => {
        req.logout(err => {
            if (err) return next(err);
            req.flash("success", "You are logged out!");
            res.redirect("/listings");
        });
    },

   // Admin Dashboard  
    renderAdminDashboard: async (req, res) => {
       
    try {
        const [users, listings, reservations] = await Promise.all([
            User.find({}).lean(),
            Listing.find({}).populate('owner').lean(),
            Reservation.find({})
                .populate('listing', 'title')
                .populate('user', 'username email')
                .sort({ createdAt: -1 })
                .lean()
        ]);

        res.render('users/admin/dashboard', {
            users,
            listings,
            reservations
        });
    } catch (err) {
        console.error('Admin dashboard error:', err);
        req.flash('error', 'Failed to load dashboard data');
        res.redirect('/');
    }
},

    // User Management
    listAllUsers: async (req, res) => {
        try {
            const users = await User.find({});
            res.render("users/admin/list", { 
                users,
                currentUser: req.user 
            });
        } catch (err) {
            req.flash("error", "Failed to load users");
            res.redirect("/admin");
        }
    },

    createAdmin: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const newUser = new User({ email, username, isAdmin: true });
            const registeredUser = await User.register(newUser, password);
            req.flash("success", `Admin ${username} created successfully!`);
            res.redirect("/admin/users");
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/admin/users");
        }
    },

    promoteToAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(
                id, 
                { isAdmin: true }, 
                { new: true }
            );
            
            if (!user) {
                req.flash("error", "User not found");
                return res.redirect("/admin/users");
            }
            
            req.flash("success", `User ${user.username} promoted to admin!`);
            res.redirect("/admin/users");
        } catch (err) {
            req.flash("error", "Failed to promote user");
            res.redirect("/admin/users");
        }
    },



    demoteAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Prevent self-demotion
            if (id === req.user._id.toString()) {
                req.flash("error", "You cannot demote yourself");
                return res.redirect("/admin/users");
            }
            
            const user = await User.findByIdAndUpdate(
                id, 
                { isAdmin: false }, 
                { new: true }
            );
            
            if (!user) {
                req.flash("error", "User not found");
                return res.redirect("/admin/users");
            }
            
            req.flash("success", `Admin ${user.username} demoted to regular user!`);
            res.redirect("/admin/users");
        } catch (err) {
            req.flash("error", "Failed to demote admin");
            res.redirect("/admin/users");
        }
    },

    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Prevent self-deletion
            if (id === req.user._id.toString()) {
                req.flash("error", "You cannot delete yourself");
                return res.redirect("/admin/users");
            }
            
            const user = await User.findByIdAndDelete(id);
            
            if (!user) {
                req.flash("error", "User not found");
                return res.redirect("/admin/users");
            }
            
            req.flash("success", `User ${user.username} and all their data deleted successfully!`);
            res.redirect("/admin/users");
        } catch (err) {
            req.flash("error", "Failed to delete user");
            res.redirect("/admin/users");
        }
    }
};

