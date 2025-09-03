import Event from "../../../DB/Models/events.model.js";

const getPublishedEventsService = async (req, res) => {
    try {
        const events = await Event.find({
            isActive: true
        }).populate('createdBy', 'firstName lastName');

        res.json({ events });
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

export default getPublishedEventsService;


