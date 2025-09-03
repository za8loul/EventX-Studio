import Event from "../../../DB/Models/events.model.js";
import User from "../../../DB/Models/users.model.js";
import createNotification from '../../Notifications/Services/create-notification.service.js';

const updateEventService = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.createdBy.toString() !== req.loggedInUser.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only update events you created." });
        }

        // Store original event data for notification
        const originalEvent = { ...event.toObject() };

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        // Try to notify users about the event update (optional, don't fail if this doesn't work)
        try {
            const users = await User.find({ isActive: true });
            if (users.length > 0) {
                const notificationPromises = users.map(user => 
                    createNotification(user._id, `Event "${originalEvent.title}" has been updated.`, {
                        type: 'event_updated',
                        title: 'Event Updated',
                        eventId: originalEvent._id,
                        eventTitle: originalEvent.title,
                        priority: 'medium',
                        actionUrl: `/events/${originalEvent._id}`
                    })
                );
                await Promise.all(notificationPromises);
            }
        } catch (notificationError) {
            console.log("Notification creation failed, but event was updated:", notificationError.message);
        }

        res.json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Error updating event", error: error.message });
    }
};

export default updateEventService;


