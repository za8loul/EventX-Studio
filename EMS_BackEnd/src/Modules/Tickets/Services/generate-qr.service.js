import QRCode from 'qrcode';
import Ticket from '../../../DB/Models/tickets.model.js';

const generateQRService = async (req, res) => {
    try {
        const { ticketId } = req.params;
        
        const ticket = await Ticket.findById(ticketId)
            .populate('event')
            .populate('user')
            .populate('seat');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const qrData = {
            ticketId: ticket._id,
            bookingReference: ticket.bookingReference,
            eventId: ticket.event._id,
            seatInfo: `Row ${ticket.seat.rowNumber}, Seat ${ticket.seat.seatNumber}`
        };

        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
        ticket.qrCode = qrCode;
        await ticket.save();

        res.status(200).json({
            message: 'QR code generated successfully',
            qrCode
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error generating QR code',
            error: error.message
        });
    }
};

export default generateQRService;