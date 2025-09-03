import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const generateSeatsService = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { rows, seatsPerRow, basePrice, category, features, finalPrice } = req.body;

        // Validate required fields
        if (!finalPrice) {
            return res.status(400).json({ 
                message: "Final price is required" 
            });
        }

        // Validate event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if seats already exist for this event
        const existingSeats = await Seat.find({ event: eventId });
        if (existingSeats.length > 0) {
            return res.status(400).json({ 
                message: "Seats already exist for this event. Delete existing seats first." 
            });
        }

        // Validate input parameters
        if (!rows || !seatsPerRow || rows <= 0 || seatsPerRow <= 0) {
            return res.status(400).json({ 
                message: "Rows and seats per row must be positive numbers" 
            });
        }

        const seats = [];
        const totalSeats = rows * seatsPerRow;

        // Generate seats
        for (let row = 1; row <= rows; row++) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                let priceMultiplier = 1.0;
                if (row <= Math.ceil(rows * 0.2)) {
                    priceMultiplier = 1.5; // Premium rows (first 20%)
                } else if (row <= Math.ceil(rows * 0.4)) {
                    priceMultiplier = 1.2; // Good rows (next 20%)
                }

                let seatCategory = "standard";
                if (row <= Math.ceil(rows * 0.2)) {
                    seatCategory = "premium";
                } else if (row <= Math.ceil(rows * 0.4)) {
                    seatCategory = "vip";  // Changed from "good" to "vip"
                }

                // Calculate the final price using base price and multiplier
                const calculatedFinalPrice = finalPrice * priceMultiplier;  // Using finalPrice directly

                seats.push({
                    event: eventId,
                    rowNumber: row,
                    seatNumber: seat,
                    status: "available",
                    basePrice: basePrice || event.price,
                    finalPrice: calculatedFinalPrice,
                    priceMultiplier,
                    category: category || seatCategory, // Use provided category or calculated one
                    features: features || [],
                    isAccessible: false
                });
            }
        }

        // Bulk create seats
        const createdSeats = await Seat.insertMany(seats);

        res.status(201).json({ 
            message: `${totalSeats} seats generated successfully for event`,
            seatsGenerated: totalSeats,
            rows,
            seatsPerRow,
            seats: createdSeats
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Error generating seats", 
            error: error.message 
        });
    }
};

export default generateSeatsService;
