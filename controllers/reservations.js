const Reservation = require('../models/reservation');
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');


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


        const reservation = new Reservation({
            listingTitle: listing.title,
            listing: listing._id,
            listingPhone: listing.phone,
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
            .populate('listing', 'title phone')
            .populate('user', 'username email')
            .sort({ createdAt: -1 });

        return reservations;
    } catch (err) {
        console.error('Error fetching reservations:', err);
        return [];
    }
};


// module.exports.approveReservation = async (req, res) => {
//     try {
//         const { id, reservationId } = req.params;

//         const reservation = await Reservation.findById(reservationId);
//         if (!reservation) {
//             req.flash('error', 'Reservation not found');
//             return res.redirect(`/listings/${id}`);
//         }

//         // Update reservation status
//         reservation.status = 'confirmed';
//         reservation.approvedBy = req.user._id;
//         reservation.approvedAt = new Date();
//         await reservation.save();

//         req.flash('success', 'Reservation approved successfully');
//         res.redirect(`/listings/${id}`);
//     } catch (err) {
//         console.error('Approval Error:', err);
//         req.flash('error', 'Failed to approve reservation');
//         res.redirect(`/listings/${id}`);
//     }
// };

module.exports.toggleReservationStatus = async (req, res) => {
    try {
        const { id, reservationId } = req.params;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            req.flash('error', 'Reservation not found');
            return res.redirect(`/listings/${id}`);
        }

        // 3-state toggle logic
        if (reservation.status === 'pending') {
            // Pending → Confirmed
            reservation.status = 'confirmed';
            reservation.approvedBy = req.user._id;
            reservation.approvedAt = new Date();
            // Clear any previous cancellation
            reservation.cancelledBy = undefined;
            reservation.cancelledAt = undefined;
        }
        else if (reservation.status === 'confirmed') {
            // Confirmed → Cancelled
            reservation.status = 'cancelled';
            reservation.cancelledBy = req.user._id;
            reservation.cancelledAt = new Date();
            // Keep approval info for history
        }
        else {
            // Cancelled → Pending
            reservation.status = 'pending';
            // Clear all status metadata
            reservation.approvedBy = undefined;
            reservation.approvedAt = undefined;
            reservation.cancelledBy = undefined;
            reservation.cancelledAt = undefined;
        }

        await reservation.save();

        req.flash('success', `Reservation status updated to ${reservation.status}`);
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error('Status Toggle Error:', err);
        req.flash('error', 'Failed to update reservation status');
        res.redirect(`/listings/${id}`);
    }
};


module.exports.showInvoice = async (req, res) => {
    const reservation = await Reservation.findById(req.params.id); // Must use `req.params.id`
    res.render('invoice', { reservation });
};