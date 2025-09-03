import mongoose from 'mongoose';
import Event from './src/DB/Models/events.model.js';

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/EMS';
await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

try {
    // Get all events
    const events = await Event.find({});
    
    if (events.length === 0) {
        console.log('No events found in database');
    } else {
        console.log(`Found ${events.length} events:`);
        events.forEach(event => {
            console.log(`- ID: ${event._id}`);
            console.log(`  Title: ${event.title}`);
            console.log(`  Seating Layout: ${event.seatingLayout ? `${event.seatingLayout.rows} rows x ${event.seatingLayout.seatsPerRow} seats` : 'Not configured'}`);
            console.log('---');
        });
    }

} catch (error) {
    console.error('Error:', error);
} finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
}
