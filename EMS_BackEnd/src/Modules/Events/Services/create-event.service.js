import Event from "../../../DB/Models/events.model.js";
import User from "../../../DB/Models/users.model.js";
import Seat from "../../../DB/Models/seats.model.js";
import createNotification from '../../Notifications/Services/create-notification.service.js';

const createEventService = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            date, 
            location, 
            capacity, 
            price, 
            category, 
            bookingDeadline, 
            refundPolicy,
            seatingLayout 
        } = req.body;

        console.log('Creating event with data:', { 
            title, 
            seatingLayout, 
            price, 
            capacity 
        }); // Debug log

        // Validate required fields
        if (!title || !description || !date || !location || !capacity || !price || !category || !bookingDeadline || !seatingLayout) {
            return res.status(400).json({ 
                message: "Missing required fields", 
                required: ["title", "description", "date", "location", "capacity", "price", "category", "bookingDeadline", "seatingLayout"] 
            });
        }

        // Validate seating layout
        if (!seatingLayout.rows || !seatingLayout.seatsPerRow) {
            return res.status(400).json({ 
                message: "Seating layout must include rows and seatsPerRow" 
            });
        }

        // Validate numeric values
        const numRows = parseInt(seatingLayout.rows);
        const numSeatsPerRow = parseInt(seatingLayout.seatsPerRow);
        const numPrice = parseFloat(price);
        const numCapacity = parseInt(capacity);

        if (isNaN(numRows) || isNaN(numSeatsPerRow) || isNaN(numPrice) || isNaN(numCapacity)) {
            return res.status(400).json({ 
                message: "Invalid numeric values in seating layout, price, or capacity" 
            });
        }

        // Validate that seating layout matches capacity
        const expectedSeats = numRows * numSeatsPerRow;
        if (expectedSeats !== numCapacity) {
            return res.status(400).json({ 
                message: `Seating layout (${numRows} × ${numSeatsPerRow} = ${expectedSeats}) does not match capacity (${numCapacity})` 
            });
        }

        // Create the event
        const event = await Event.create({
            title,
            description,
            date: new Date(date),
            location,
            capacity: numCapacity,
            price: numPrice,
            category,
            bookingDeadline: new Date(bookingDeadline),
            refundPolicy,
            seatingLayout: {
                type: seatingLayout.type || "theater",
                rows: numRows,
                seatsPerRow: numSeatsPerRow,
                customLayout: seatingLayout.customLayout || []
            },
            status: 'published',
            createdBy: req.loggedInUser.user._id,
            currentBookings: 0,
            availableSeats: expectedSeats, // Set initial available seats
            isActive: true
        });

        console.log(`Event created successfully: ${event.title}`); // Debug log

        // Automatically generate seats based on seating layout
        let seatsGenerated = 0;
        try {
            console.log(`Generating ${numRows} rows × ${numSeatsPerRow} seats = ${expectedSeats} total seats`); // Debug log

            const seats = [];

            // Generate seats for each row
            for (let row = 1; row <= numRows; row++) {
                for (let seat = 1; seat <= numSeatsPerRow; seat++) {
                    seats.push({
                        event: event._id,
                        rowNumber: row,
                        seatNumber: seat,
                        status: "available",
                        basePrice: numPrice, // Use validated numeric price
                        finalPrice: numPrice, // Use validated numeric price
                        category: "standard",
                        features: [],
                        isActive: true
                    });
                }
            }

            console.log(`Prepared ${seats.length} seat objects for insertion`); // Debug log

            // Verify all seats are properly formatted
            if (seats.length !== expectedSeats) {
                throw new Error(`Expected ${expectedSeats} seats but prepared ${seats.length}`);
            }

            // Bulk insert seats
            const createdSeats = await Seat.insertMany(seats);
            seatsGenerated = createdSeats.length;
            console.log(`✅ Successfully generated ${seatsGenerated} seats for event: ${event.title}`);
            
            // Verify seats were actually created in database
            const actualSeats = await Seat.find({ event: event._id });
            console.log(`Verified ${actualSeats.length} seats exist in database for event ${event._id}`);
            
            if (actualSeats.length !== expectedSeats) {
                console.warn(`⚠️ Warning: Expected ${expectedSeats} seats but found ${actualSeats.length} in database`);
            }
            
        } catch (seatError) {
            console.error("❌ Seat generation failed, but event was created:", seatError.message);
            console.error("Seat error details:", seatError);
            // Don't fail the event creation if seat generation fails
            seatsGenerated = 0;
        }

        // Try to notify users about the new event (optional, don't fail if this doesn't work)
        try {
            const users = await User.find({ isActive: true });
            if (users.length > 0) {
                const notificationPromises = users.map(user => 
                    createNotification(user._id, `A new event titled "${title}" has been created.`, {
                        type: 'event_created',
                        title: 'New Event Available!',
                        eventId: event._id,
                        eventTitle: title,
                        priority: 'high',
                        actionUrl: `/events/${event._id}`
                    })
                );
                await Promise.all(notificationPromises);
                console.log('✅ User notifications sent successfully'); // Debug log
            }
        } catch (notificationError) {
            console.log("⚠️ Notification creation failed, but event was created:", notificationError.message);
        }

        res.status(201).json({ 
            message: "Event created successfully with automatic seat generation", 
            event: {
                _id: event._id,
                title: event.title,
                description: event.description,
                date: event.date,
                location: event.location,
                capacity: event.capacity,
                price: event.price,
                category: event.category,
                status: event.status,
                seatingLayout: event.seatingLayout,
                availableSeats: event.availableSeats
            },
            seatsGenerated: seatsGenerated
        });
    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({ 
            message: "Error creating event", 
            error: error.message,
            details: error.stack
        });
    }
};

export default createEventService;


