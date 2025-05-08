const express = require('express');
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isOwner } = require('../middleware'); // Add isOwner import
const wrapAsync = require('../utils/wrapAsync');
const Reservation = require('../models/reservation');
const Listing = require('../models/listing');
const reservationsController = require('../controllers/reservations');

router.post('/test-route', (req, res) => {
    console.log("Test route hit!");
    res.send("Working!");
});

// POST /listings/:id/reservations
router.post('/', isLoggedIn, wrapAsync(reservationsController.createReservation));

// POST /listings/:id/reservations/:reservationId/approve
router.post('/:reservationId/approve', 
    isLoggedIn, 
    isOwner, 
    wrapAsync(reservationsController.approveReservation)
);

// GET /reservations/:id/invoice - Show reservation invoice
router.get('/:id/invoicePage', isLoggedIn,  wrapAsync(reservationsController.showInvoice));


// router.get('/confirmation', wrapAsync(async (req, res) => {
//     const reservation = req.session.reservationData;
//     if (!reservation) {
//         req.flash('error', 'Reservation data not found');
//         return res.redirect('/listings');
//     }

//     const listing = await Listing.findById(reservation.listingId);
//     if (!listing) {
//         req.flash('error', 'Listing not found');
//         return res.redirect('/listings');
//     }

//     res.render('reservation/confirmation', {
//         listing,
//         reservation
//     });
// }));

module.exports = router;