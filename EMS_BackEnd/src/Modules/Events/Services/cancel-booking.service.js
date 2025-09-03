import Event from "../../../DB/Models/events.model.js";
import EventBooking from "../../../DB/Models/event-bookings.model.js";

const cancelBookingService = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.loggedInUser.user._id;

        const booking = await EventBooking.findOne({
            event: eventId,
            user: userId
        });

        if (!booking) {
            return res.status(404).json({ message: "No booking found for this event" });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "Booking is already cancelled" });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ message: "Cannot cancel completed booking" });
        }

        booking.status = 'cancelled';
        await booking.save();

        const event = await Event.findById(eventId);
        if (event) {
            await event.updateBookingCount(-booking.numberOfTickets);
        }

        res.json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Error cancelling booking", error: error.message });
    }
};

export default cancelBookingService;


