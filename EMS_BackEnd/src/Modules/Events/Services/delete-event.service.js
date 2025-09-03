import Event from "../../../DB/Models/events.model.js";
import EventBooking from "../../../DB/Models/event-bookings.model.js";
import Seat from "../../../DB/Models/seats.model.js"; // Added seat import
import User from "../../../DB/Models/users.model.js";
import createNotification from '../../Notifications/Services/create-notification.service.js';

const deleteEventService = async (req, res) => {
    try {
        console.log('Delete event service called for event ID:', req.params.id); // Debug log
        
        const event = await Event.findById(req.params.id);
        if (!event) {
            console.log('Event not found in database'); // Debug log
            return res.status(404).json({ message: "Event not found" });
        }

        console.log('Event found:', { 
            _id: event._id, 
            title: event.title, 
            createdBy: event.createdBy 
        }); // Debug log

        if (event.createdBy.toString() !== req.loggedInUser.user._id.toString()) {
            console.log('Access denied - user mismatch:', {
                eventCreator: event.createdBy.toString(),
                currentUser: req.loggedInUser.user._id.toString()
            }); // Debug log
            return res.status(403).json({ message: "Access denied. You can only delete events you created." });
        }

        // Check for active bookings
        const activeBookings = await EventBooking.find({
            event: req.params.id,
            status: { $in: ["pending", "confirmed"] }
        });

        console.log('Active bookings found:', activeBookings.length); // Debug log

        // Automatically cancel all active bookings instead of blocking deletion
        if (activeBookings.length > 0) {
            console.log('Automatically cancelling active bookings...'); // Debug log
            
            // Update all active bookings to cancelled status
            await EventBooking.updateMany(
                { 
                    event: req.params.id,
                    status: { $in: ["pending", "confirmed"] }
                },
                { 
                    status: "cancelled",
                    cancelledAt: new Date(),
                    cancelledBy: req.loggedInUser.user._id
                }
            );
            
            console.log(`${activeBookings.length} bookings cancelled automatically`); // Debug log
            
            // Notify users about their cancelled bookings
            try {
                const uniqueUsers = [...new Set(activeBookings.map(booking => booking.user))];
                const users = await User.find({ _id: { $in: uniqueUsers }, isActive: true });
                
                if (users.length > 0) {
                    const notificationPromises = users.map(user => 
                        createNotification(user._id, `Your booking for "${event.title}" has been cancelled because the event was deleted.`, {
                            type: 'booking_cancelled',
                            title: 'Booking Cancelled',
                            eventId: event._id,
                            eventTitle: event.title,
                            priority: 'high',
                            actionUrl: `/events`
                        })
                    );
                    await Promise.all(notificationPromises);
                    console.log('Cancellation notifications sent to users'); // Debug log
                }
            } catch (notificationError) {
                console.log("Cancellation notification creation failed, but bookings were cancelled:", notificationError.message);
            }
        }

        // Check for existing seats
        const existingSeats = await Seat.find({ event: req.params.id });
        console.log('Existing seats found:', existingSeats.length); // Debug log

        // Store event data for notification before deletion
        const eventData = { ...event.toObject() };

        // Delete seats first (if any exist)
        if (existingSeats.length > 0) {
            console.log('Deleting existing seats...'); // Debug log
            await Seat.deleteMany({ event: req.params.id });
            console.log('Seats deleted successfully'); // Debug log
        }

        // Delete the event
        console.log('Deleting event...'); // Debug log
        await Event.findByIdAndDelete(req.params.id);
        console.log('Event deleted successfully'); // Debug log

        // Try to notify users about the event deletion (optional, don't fail if this doesn't work)
        try {
            const users = await User.find({ isActive: true });
            if (users.length > 0) {
                const notificationPromises = users.map(user => 
                    createNotification(user._id, `Event "${eventData.title}" has been cancelled/deleted.`, {
                        type: 'event_deleted',
                        title: 'Event Cancelled',
                        eventId: eventData._id,
                        eventTitle: eventData.title,
                        priority: 'high',
                        actionUrl: `/events`
                    })
                );
                await Promise.all(notificationPromises);
                console.log('Event deletion notifications sent successfully'); // Debug log
            }
        } catch (notificationError) {
            console.log("Event deletion notification creation failed, but event was deleted:", notificationError.message);
        }

        res.json({ 
            message: "Event deleted successfully", 
            cancelledBookings: activeBookings.length,
            deletedSeats: existingSeats.length
        });
    } catch (error) {
        console.error('Error in deleteEventService:', error); // Debug log
        res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};

export default deleteEventService;


