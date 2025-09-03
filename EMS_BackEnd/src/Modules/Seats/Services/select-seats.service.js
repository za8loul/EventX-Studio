import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const selectSeatsService = async (req, res) => {
    try {
        const { eventId, selectedSeats, numberOfTickets } = req.body;
        const userId = req.loggedInUser.user._id;

        // Validate input
        if (!selectedSeats || selectedSeats.length !== numberOfTickets) {
            return res.status(400).json({ 
                message: "Number of selected seats must match number of tickets" 
            });
        }

        // Validate event exists and is active
        const event = await Event.findById(eventId);
        if (!event || !event.isActive) {
            return res.status(404).json({ message: "Event not found or inactive" });
        }

        // Check if user already has a booking for this event
        // (This would be handled in the booking service)

        // Validate and reserve selected seats
        const seatIds = selectedSeats.map(s => s.seatId);
        const seats = await Seat.find({ 
            _id: { $in: seatIds },
            event: eventId
        });

        if (seats.length !== numberOfTickets) {
            return res.status(400).json({ 
                message: "Some selected seats not found" 
            });
        }

        // Check seat availability and reserve them
        const reservedSeats = [];
        const unavailableSeats = [];

        for (const seat of seats) {
            if (seat.isAvailableForBooking()) {
                await seat.reserveTemporarily(userId, 15); // 15 minutes reservation
                reservedSeats.push(seat);
            } else {
                unavailableSeats.push({
                    rowNumber: seat.rowNumber,
                    seatNumber: seat.seatNumber,
                    reason: seat.status === "reserved" ? "Already reserved" : "Not available"
                });
            }
        }

        if (unavailableSeats.length > 0) {
            // Release any seats that were reserved
            for (const seat of reservedSeats) {
                await seat.releaseReservation();
            }
            
            return res.status(400).json({ 
                message: "Some seats are not available",
                unavailableSeats,
                availableSeats: []
            });
        }

        // Calculate total price
        const totalPrice = reservedSeats.reduce((sum, seat) => sum + seat.finalPrice, 0);

        res.json({
            message: "Seats reserved successfully for 15 minutes",
            reservedSeats: reservedSeats.map(seat => ({
                id: seat._id,
                rowNumber: seat.rowNumber,
                seatNumber: seat.seatNumber,
                category: seat.category,
                price: seat.finalPrice,
                features: seat.features
            })),
            totalPrice,
            reservationExpiry: new Date(Date.now() + 15 * 60 * 1000),
            nextStep: "Complete your booking within 15 minutes"
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error selecting seats", 
            error: error.message 
        });
    }
};

export default selectSeatsService;
