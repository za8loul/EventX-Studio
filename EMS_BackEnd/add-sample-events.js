import mongoose from 'mongoose';
import 'dotenv/config';
import Event from './src/DB/Models/events.model.js';
import User from './src/DB/Models/users.model.js';

const addSampleEvents = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Find an admin user to create events
        const adminUser = await User.findOne({ role: 'ADMIN' });
        if (!adminUser) {
            console.log('No admin user found. Please create an admin user first.');
            return;
        }

        console.log(`Using admin user: ${adminUser.email}`);

        const sampleEvents = [
            {
                title: "Colombo Music Festival",
                description: "A spectacular music festival featuring local and international artists",
                date: new Date('2025-04-15T21:00:00Z'),
                location: "Open Air Theater, Colombo",
                capacity: 2500,
                currentBookings: 0,
                price: 200,
                category: "concert",
                status: "published",
                createdBy: adminUser._id,
                isActive: true,
                bookingDeadline: new Date('2025-04-10T23:59:59Z'),
                refundPolicy: "Full refund available up to 7 days before the event",
                seatingLayout: {
                    type: "theater",
                    rows: 25,
                    seatsPerRow: 100
                }
            },
            {
                title: "Tech Lanka Expo 2025",
                description: "The biggest technology exhibition in Sri Lanka",
                date: new Date('2025-05-18T10:00:00Z'),
                location: "BMICH, Colombo",
                capacity: 1000,
                currentBookings: 0,
                price: 150,
                category: "conference",
                status: "published",
                createdBy: adminUser._id,
                isActive: true,
                bookingDeadline: new Date('2025-05-15T23:59:59Z'),
                refundPolicy: "No refunds for this event",
                seatingLayout: {
                    type: "conference",
                    rows: 20,
                    seatsPerRow: 50
                }
            },
            {
                title: "Sri Lanka Food Fest",
                description: "Celebrate the diverse cuisine of Sri Lanka",
                date: new Date('2025-06-20T18:00:00Z'),
                location: "Galle Face Green, Colombo",
                capacity: 800,
                currentBookings: 0,
                price: 75,
                category: "other",
                status: "published",
                createdBy: adminUser._id,
                isActive: true,
                bookingDeadline: new Date('2025-06-17T23:59:59Z'),
                refundPolicy: "Partial refund available up to 3 days before the event",
                seatingLayout: {
                    type: "banquet",
                    rows: 16,
                    seatsPerRow: 50
                }
            },
            {
                title: "Cricket Festival",
                description: "Annual cricket tournament with local teams",
                date: new Date('2025-07-15T14:00:00Z'),
                location: "R. Premadasa Stadium, Colombo",
                capacity: 15000,
                currentBookings: 0,
                price: 300,
                category: "sports",
                status: "published",
                createdBy: adminUser._id,
                isActive: true,
                bookingDeadline: new Date('2025-07-10T23:59:59Z'),
                refundPolicy: "No refunds for sports events",
                seatingLayout: {
                    type: "stadium",
                    rows: 150,
                    seatsPerRow: 100
                }
            }
        ];

        // Clear existing sample events
        await Event.deleteMany({ title: { $in: sampleEvents.map(e => e.title) } });
        console.log('Cleared existing sample events');

        // Add new sample events
        const createdEvents = await Event.insertMany(sampleEvents);
        console.log(`Successfully created ${createdEvents.length} sample events:`);
        
        createdEvents.forEach(event => {
            console.log(`- ${event.title} (${event.status})`);
        });

    } catch (error) {
        console.error('Error adding sample events:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
};

// Run the script
addSampleEvents();
