import Ticket from '../../../DB/Models/tickets.model.js';

const myTicketsService = async (req, res) => {
    try {
        const userId = req.loggedInUser.user._id;

        const tickets = await Ticket.find({ user: userId })
            .populate('event', 'title date location')
            .populate('seat', 'rowNumber seatNumber category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            tickets
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets", error: error.message });
    }
};

export default myTicketsService;