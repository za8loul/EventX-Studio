import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const getEventSeatsService = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Validate event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Get all seats for the event
        const seats = await Seat.find({ 
            event: eventId,
            isActive: true 
        }).sort({ rowNumber: 1, seatNumber: 1 });

        // Group seats by row for frontend display
        const seatsByRow = {};
        seats.forEach(seat => {
            if (!seatsByRow[seat.rowNumber]) {
                seatsByRow[seat.rowNumber] = [];
            }
            seatsByRow[seat.rowNumber].push(seat);
        });

        // Calculate statistics
        const totalSeats = seats.length;
        const availableSeats = seats.filter(s => s.status === "available").length;
        const reservedSeats = seats.filter(s => s.status === "reserved").length;
        const paidSeats = seats.filter(s => s.status === "paid").length;

        res.json({
            event: {
                id: event._id,
                title: event.title,
                seatingLayout: event.seatingLayout
            },
            seats: seatsByRow,
            statistics: {
                total: totalSeats,
                available: availableSeats,
                reserved: reservedSeats,
                paid: paidSeats
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error fetching event seats", 
            error: error.message 
        });
    }
};

export default getEventSeatsService;
