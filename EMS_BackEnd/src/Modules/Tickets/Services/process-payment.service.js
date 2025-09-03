import Ticket from '../../../DB/Models/tickets.model.js';
import Payment from '../../../DB/Models/payments.model.js';

const processPaymentService = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { cardNumber, expiryDate, cvv } = req.body;
        const userId = req.loggedInUser.user._id;

        // Find ticket
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Dummy payment validation
        if (cardNumber?.length !== 16 || !expiryDate || cvv?.length !== 3) {
            return res.status(400).json({ message: 'Invalid payment details' });
        }

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create payment record
        const payment = await Payment.create({
            ticket: ticketId,
            user: userId,
            amount: ticket.purchasePrice,
            status: 'completed',
            paymentMethod: 'card',
            transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        });

        // Update ticket status
        ticket.status = 'active';
        await ticket.save();

        res.status(200).json({
            message: 'Payment processed successfully',
            payment,
            ticket
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error processing payment',
            error: error.message
        });
    }
};

export default processPaymentService;