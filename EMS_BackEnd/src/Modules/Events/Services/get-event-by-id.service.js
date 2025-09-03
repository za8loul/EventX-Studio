import Event from "../../../DB/Models/events.model.js";

const getEventByIdService = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');

        if (!event || !event.isActive) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json({ event });
    } catch (error) {
        res.status(500).json({ message: "Error fetching event", error: error.message });
    }
};

export default getEventByIdService;


