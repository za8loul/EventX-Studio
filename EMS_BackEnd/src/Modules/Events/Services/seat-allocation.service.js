import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const seatAllocationService = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { rowNumber, seatNumber, status, price, category, features } = req.body;

        // Validate event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if seat already exists
        const existingSeat = await Seat.findOne({
            event: eventId,
            rowNumber,
            seatNumber
        });

        if (existingSeat) {
            return res.status(400).json({ message: "Seat already exists for this event" });
        }

        // Create new seat
        const seat = await Seat.create({
            event: eventId,
            rowNumber,
            seatNumber,
            status: status || "available",
            price: price || event.price,
            category: category || "standard",
            features: features || []
        });

        res.status(201).json({ 
            message: "Seat allocated successfully", 
            seat 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error allocating seat", 
            error: error.message 
        });
    }
};

export default seatAllocationService;
