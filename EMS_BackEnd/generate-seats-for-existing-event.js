import mongoose from 'mongoose';
import Seat from './src/DB/Models/seats.model.js';
import Event from './src/DB/Models/events.model.js';

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/EMS';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

// Event ID to generate seats for
const eventId = '68b740bdaa2471d4a582fae7';

try {
    // Get the event
    const event = await Event.findById(eventId);
    if (!event) {
        console.log('Event not found');
        process.exit(1);
    }

    console.log(`Found event: ${event.title}`);
    console.log(`Seating layout: ${event.seatingLayout.rows} rows x ${event.seatingLayout.seatsPerRow} seats per row`);

    // Check if seats already exist
    const existingSeats = await Seat.find({ event: eventId });
    if (existingSeats.length > 0) {
        console.log(`Seats already exist: ${existingSeats.length} seats found`);
        process.exit(0);
    }

    // Generate seats
    const { rows, seatsPerRow } = event.seatingLayout;
    const seats = [];

    for (let row = 1; row <= rows; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
            seats.push({
                event: eventId,
                rowNumber: row,
                seatNumber: seat,
                status: "available",
                price: event.price,
                finalPrice: event.price,
                category: "standard",
                features: [],
                isActive: true
            });
        }
    }

    // Insert seats
    const createdSeats = await Seat.insertMany(seats);
    console.log(`Successfully generated ${createdSeats.length} seats for event: ${event.title}`);

} catch (error) {
    console.error('Error:', error);
} finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}
