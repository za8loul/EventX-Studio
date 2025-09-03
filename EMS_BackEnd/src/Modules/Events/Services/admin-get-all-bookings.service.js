import Event from "../../../DB/Models/events.model.js";
import EventBooking from "../../../DB/Models/event-bookings.model.js";

const adminGetAllBookingsService = async (req, res) => {
    try {
        // Get all events created by the current user
        const userEvents = await Event.find({ 
            createdBy: req.loggedInUser.user._id 
        }).select('_id title date location');
        
        const eventIds = userEvents.map(event => event._id);
        
        // Get all bookings for these events
        const allBookings = await EventBooking.find({ 
            event: { $in: eventIds } 
        })
        .populate('user', 'firstName lastName email age gender')
        .populate('event', 'title date location')
        .sort({ bookingDate: -1 }); // Most recent first
        
        res.json({ 
            bookings: allBookings,
            totalBookings: allBookings.length,
            totalEvents: userEvents.length
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching all bookings", error: error.message });
    }
};

export default adminGetAllBookingsService;
