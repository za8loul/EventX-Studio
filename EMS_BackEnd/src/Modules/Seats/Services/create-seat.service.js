import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const createSeatService = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { 
            rowNumber, 
            seatNumber, 
            status, 
            basePrice, 
            finalPrice, // Added finalPrice to destructuring
            category, 
            features, 
            isAccessible 
        } = req.body;

        // Validate event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Validate finalPrice is provided
        if (!finalPrice) {
            return res.status(400).json({ 
                message: "Final price is required" 
            });
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

        // Set default price multiplier based on category
        let priceMultiplier = 1.0;
        if (category === "premium") priceMultiplier = 1.5;
        else if (category === "vip") priceMultiplier = 2.0;

        // Create new seat
        const seat = await Seat.create({
            event: eventId,
            rowNumber,
            seatNumber,
            status: status || "available",
            basePrice: basePrice || event.price,
            finalPrice, // Added finalPrice
            priceMultiplier,
            category: category || "standard",
            features: features || [],
            isAccessible: isAccessible || false
        });

        res.status(201).json({ 
            message: "Seat created successfully", 
            seat 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating seat", 
            error: error.message 
        });
    }
};

export default createSeatService;
