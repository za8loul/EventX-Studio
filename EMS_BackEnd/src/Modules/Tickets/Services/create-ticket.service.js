import Ticket from '../../../DB/Models/tickets.model.js';
import Seat from '../../../DB/Models/seats.model.js';

const createTicketService = async (req, res) => {
    try {
        const { eventId, seatId } = req.params;
        const userId = req.loggedInUser.user._id;

        const seat = await Seat.findById(seatId);
        if (!seat || seat.status !== 'available') {
            return res.status(400).json({ message: 'Seat not available' });
        }

        const ticket = await Ticket.create({
            event: eventId,
            user: userId,
            seat: seatId,
            purchasePrice: seat.finalPrice
        });

        // Update seat status
        seat.status = 'reserved';
        await seat.save();

        res.status(201).json({
            message: 'Ticket created successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating ticket',
            error: error.message
        });
    }
};

export default createTicketService;