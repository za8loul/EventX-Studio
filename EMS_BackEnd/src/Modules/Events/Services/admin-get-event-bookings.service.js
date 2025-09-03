import Event from "../../../DB/Models/events.model.js";
import EventBooking from "../../../DB/Models/event-bookings.model.js";

const adminGetEventBookingsService = async (req, res) => {
    try {
        const eventId = req.params.id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.createdBy.toString() !== req.loggedInUser.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only view bookings for events you created." });
        }

        const bookings = await EventBooking.find({ event: eventId })
            .populate('user', 'firstName lastName email')
            .populate('event', 'title date');

        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Error fetching event bookings", error: error.message });
    }
};

export default adminGetEventBookingsService;


