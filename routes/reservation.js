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
router.post('/', 
    isLoggedIn, 
    wrapAsync(reservationsController.createReservation));

// POST /listings/:id/reservations/:reservationId/approve
// router.post('/:reservationId/approve', 
//     isLoggedIn, 
//     isOwner, 
//     wrapAsync(reservationsController.approveReservation)
// );

// POST /listings/:id/reservations/:reservationId/toggle-status
router.post('/:reservationId/toggle-status', 
    isLoggedIn, 
    isOwner, 
    wrapAsync(reservationsController.toggleReservationStatus)
);


// GET /reservations/:id/invoice - Show reservation invoice
// In your routes file (e.g., routes/reservations.js)
router.get('/:id/invoice', 
  isLoggedIn, 
  wrapAsync(reservationsController.showInvoice)
);

// Cancel reservation route
router.post('/reservations/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndUpdate(id, { 
        status: 'cancelled',
        cancelledAt: new Date()
    });
    req.flash('success', 'Reservation cancelled successfully');
    res.redirect('back');
});

// Delete reservation route
router.delete('/reservations/:id', async (req, res) => {
    const { id } = req.params;
    await Reservation.findByIdAndDelete(id);
    req.flash('success', 'Reservation deleted successfully');
    res.redirect('back');
});

module.exports = router;