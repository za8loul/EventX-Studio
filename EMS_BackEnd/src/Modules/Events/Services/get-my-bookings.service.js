import EventBooking from "../../../DB/Models/event-bookings.model.js";

const getMyBookingsService = async (req, res) => {
    try {
        const bookings = await EventBooking.find({
            user: req.loggedInUser.user._id
        }).populate('event', 'title date location price status');

        res.json({ bookings });
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
};

export default getMyBookingsService;


