import Seat from "../../../DB/Models/seats.model.js";
import Event from "../../../DB/Models/events.model.js";

const generateSeatsService = async (req, res) => {
    try {
        const { id } = req.params; // Changed from eventId to id to match the route
        const { rows, seatsPerRow, basePrice, category, finalPrice } = req.body;

        console.log('Generate seats service called with:', { id, rows, seatsPerRow, basePrice, finalPrice }); // Debug log

        // Validate finalPrice is provided
        if (!finalPrice) {
            return res.status(400).json({ 
                message: "Final price is required for seat generation" 
            });
        }

        // Validate event exists
        console.log('Looking for event with ID:', id); // Debug log
        const event = await Event.findById(id);
        console.log('Event found:', event ? 'Yes' : 'No'); // Debug log
        
        if (!event) {
            console.log('Event not found in database'); // Debug log
            return res.status(404).json({ message: "Event not found" });
        }

        console.log('Event details:', { 
            _id: event._id, 
            title: event.title, 
            price: event.price 
        }); // Debug log

        // Check if seats already exist
        const existingSeats = await Seat.find({ event: id });
        if (existingSeats.length > 0) {
            return res.status(400).json({ 
                message: "Seats already exist for this event. Use individual allocation instead." 
            });
        }

        const seats = [];
        // Use provided basePrice or fall back to event price
        const seatBasePrice = basePrice || event.price;
        const seatFinalPrice = finalPrice || event.price;

        // Generate seats for each row
        for (let row = 1; row <= rows; row++) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                seats.push({
                    event: id,
                    rowNumber: row,
                    seatNumber: seat,
                    status: "available",
                    basePrice: seatBasePrice, // Added basePrice field
                    finalPrice: seatFinalPrice,
                    category: category || "standard",
                    features: []
                });
            }
        }

        console.log(`Generating ${seats.length} seats...`); // Debug log

        // Bulk insert seats
        const createdSeats = await Seat.insertMany(seats);

        console.log(`${createdSeats.length} seats created successfully`); // Debug log

        // Update event with seating layout
        await Event.findByIdAndUpdate(id, {
            seatingLayout: {
                type: "theater",
                rows: rows,
                seatsPerRow: seatsPerRow
            }
        });

        res.status(201).json({ 
            message: `${createdSeats.length} seats generated successfully`, 
            seats: createdSeats.length,
            eventId: id 
        });
    } catch (error) {
        console.error('Error in generateSeatsService:', error); // Debug log
        res.status(500).json({ 
            message: "Error generating seats", 
            error: error.message 
        });
    }
};

export default generateSeatsService;
