import Event from '../../../DB/Models/events.model.js';
import Seat from '../../../DB/Models/seats.model.js';

const eventDetailsService = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Get available seats
        const seats = await Seat.find({ 
            event: eventId,
            status: 'available'
        }).select('rowNumber seatNumber category finalPrice');

        // Calculate event popularity (e.g., based on bookings or views)
        const popularity = event.bookingsCount || 0; // Assuming bookingsCount exists in the event model

        // Group events by upcoming, active, and closed
        const now = new Date();
        const upcomingEvents = await Event.find({ date: { $gt: now } });
        const activeEvents = await Event.find({ date: now });
        const closedEvents = await Event.find({ date: { $lt: now } });

        res.status(200).json({
            event,
            availableSeats: seats,
            totalAvailableSeats: seats.length,
            popularity,
            groupedEvents: {
                upcoming: upcomingEvents,
                active: activeEvents,
                closed: closedEvents
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching event details", error: error.message });
    }
};

export default eventDetailsService;