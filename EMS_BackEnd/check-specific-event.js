import mongoose from 'mongoose';
import Event from './src/DB/Models/events.model.js';
import Seat from './src/DB/Models/seats.model.js';

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/EMS';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

// Event ID to check
const eventId = '68b763179f12d11f071de4e7';

try {
    // Get the specific event
    const event = await Event.findById(eventId);
    
    if (!event) {
        console.log('❌ Event not found in database');
        console.log('This explains why the frontend shows blank data');
    } else {
        console.log('✅ Event found in database:');
        console.log(`- ID: ${event._id}`);
        console.log(`- Title: ${event.title}`);
        console.log(`- Description: ${event.description}`);
        console.log(`- Date: ${event.date}`);
        console.log(`- Location: ${event.location}`);
        console.log(`- Capacity: ${event.capacity}`);
        console.log(`- Price: ${event.price}`);
        console.log(`- Status: ${event.status}`);
        console.log(`- Seating Layout:`, event.seatingLayout);
        
        // Check if seats exist
        const seats = await Seat.find({ event: eventId });
        console.log(`- Seats in database: ${seats.length}`);
        
        if (seats.length > 0) {
            console.log('Sample seat data:');
            console.log(seats[0]);
        }
    }

    // List all events to see what exists
    console.log('\n📋 All events in database:');
    const allEvents = await Event.find({});
    
    if (allEvents.length === 0) {
        console.log('No events found in database');
    } else {
        allEvents.forEach((evt, index) => {
            console.log(`${index + 1}. ID: ${evt._id}`);
            console.log(`   Title: ${evt.title}`);
            console.log(`   Seating Layout:`, evt.seatingLayout);
            console.log('---');
        });
    }

} catch (error) {
    console.error('Error:', error);
} finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}
