import Event from "../../../DB/Models/events.model.js";

const adminGetAllEventsService = async (req, res) => {
    try {
        // Only show events created by the current user
        const events = await Event.find({ 
            createdBy: req.loggedInUser.user._id 
        }).populate('createdBy', 'firstName lastName email role');
        
        res.json({ events });
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

export default adminGetAllEventsService;


