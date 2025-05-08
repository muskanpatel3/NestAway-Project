const Reservation = require('../models/reservation');
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');  // Add this line at the top
// In controllers/reservations.js
module.exports.createReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkin, checkout, guests } = req.body;

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }

        // Validate dates
        if (new Date(checkin) >= new Date(checkout)) {
            req.flash('error', 'Check-out date must be after check-in date');
            return res.redirect(`/listings/${id}`);
        }

        // Calculate price
        const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
        const totalPrice = listing.price * nights;

        // Create reservation WITH listing phone number
        const reservation = new Reservation({
            listingTitle: listing.title,
            listing: listing._id,
            listingPhone: listing.phone,  // Store phone number directly
            user: req.user._id,
            userName: req.user.username,
            userEmail: req.user.email,
            checkin,
            checkout,
            guests,
            totalPrice,
            status: 'pending'
        });

        await reservation.save();

        // Update listing
        await Listing.findByIdAndUpdate(
            listing._id,
            { $push: { reservations: reservation._id } }
        );

        req.flash('success', 'Reservation created successfully!');
        return res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error('Reservation Error:', err);
        req.flash('error', 'Failed to make reservation. ' + err.message);
        res.redirect('/listings');
    }
};

// Add this new method for admin

module.exports.getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({})
            .populate('listing', 'title phone')  // Include phone here
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
            
        return reservations;
    } catch (err) {
        console.error('Error fetching reservations:', err);
        return [];
    }
};


module.exports.approveReservation = async (req, res) => {
    try {
        const { id, reservationId } = req.params;
        
        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            req.flash('error', 'Reservation not found');
            return res.redirect(`/listings/${id}`);
        }

        // Update reservation status
        reservation.status = 'confirmed';
        reservation.approvedBy = req.user._id;
        reservation.approvedAt = new Date();
        await reservation.save();

        req.flash('success', 'Reservation approved successfully');
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error('Approval Error:', err);
        req.flash('error', 'Failed to approve reservation');
        res.redirect(`/listings/${id}`);
    }
};


module.exports.showInvoice = async (req, res) => {
    try {
      const { id } = req.params;
      
      const reservation = await Reservation.findById(id)
        .populate('user')
        .populate({
          path: 'listing',
          populate: { path: 'owner' }
        });
  
      if (!reservation) {
        req.flash('error', 'Reservation not found');
        return res.redirect('/listings');
      }
  
      // Calculate additional invoice details
      const nights = Math.ceil((reservation.checkout - reservation.checkin) / (1000 * 60 * 60 * 24));
      const taxRate = 0.18;
      const taxAmount = reservation.totalPrice * taxRate;
      const grandTotal = reservation.totalPrice + taxAmount;
  
      res.render('reservations/invoice', { 
        reservation,
        nights,
        taxRate,
        taxAmount, 
        grandTotal,
        currentDate: new Date().toLocaleDateString()
      });
  
    } catch (err) {
      console.error('Error fetching invoice:', err);
      req.flash('error', 'Failed to generate invoice');
      res.redirect('/listings');
    }
  };