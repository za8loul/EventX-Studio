import Event from "../../../DB/Models/events.model.js";
import EventBooking from "../../../DB/Models/event-bookings.model.js";
import Seat from "../../../DB/Models/seats.model.js";

const bookEventService = async (req, res) => {
    try {
        const { numberOfTickets, paymentMethod, specialRequests, selectedSeats } = req.body;
        const eventId = req.params.id;

        const event = await Event.findById(eventId);
        if (!event || !event.isActive) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Validate selected seats if provided
        if (selectedSeats && selectedSeats.length !== numberOfTickets) {
            return res.status(400).json({ 
                message: "Number of selected seats must match number of tickets" 
            });
        }

        // If seats are selected, validate they're reserved by this user
        let finalSeats = [];
        if (selectedSeats) {
            const seatIds = selectedSeats.map(s => s.seatId);
            const seats = await Seat.find({ 
                _id: { $in: seatIds },
                event: eventId,
                reservedBy: req.loggedInUser.user._id,
                status: "reserved"
            });

            if (seats.length !== numberOfTickets) {
                return res.status(400).json({ 
                    message: "Some selected seats are not reserved by you or have expired" 
            });
            }

            finalSeats = seats;
        }


        if (!event.canBook(numberOfTickets)) {
            return res.status(400).json({
                message: "Cannot book tickets. Event may be sold out, inactive, or past booking deadline."
            });
        }

        const existingBooking = await EventBooking.findOne({
            event: eventId,
            user: req.loggedInUser.user._id
        });

        if (existingBooking) {
            return res.status(400).json({ message: "You already have a booking for this event" });
        }

        const totalAmount = event.price * numberOfTickets;

        const booking = await EventBooking.create({
            event: eventId,
            user: req.loggedInUser.user._id,
            numberOfTickets,
            totalAmount,
            paymentMethod,
            specialRequests
        });

        await event.updateBookingCount(numberOfTickets);

        // Update seat status to paid and link to booking
        if (finalSeats.length > 0) {
            await Seat.updateMany(
                { _id: { $in: finalSeats.map(s => s._id) } },
                { 
                    status: "paid",
                    reservedBy: undefined,
                    reservedAt: undefined,
                    reservationExpiry: undefined
                }
            );
        }

        res.status(201).json({
            message: "Event booked successfully",
            booking,
            selectedSeats: finalSeats.map(seat => ({
                rowNumber: seat.rowNumber,
                seatNumber: seat.seatNumber,
                category: seat.category,
                price: seat.finalPrice
            })),
            event: {
                id: event._id,
                title: event.title,
                availableSeats: event.availableSeats
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error booking event", error: error.message });
    }
};

export default bookEventService;


