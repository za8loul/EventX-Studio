import mongoose from "mongoose";
import 'dotenv/config';
import Admin from "./Models/admins.model.js";
import User from "./Models/users.model.js";
import { ROLES } from "./Models/users.model.js";

const migrateAdminsToUsers = async () => {
    try {
        console.log('Starting migration from Admin to User model...');
        
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');
        
        // Find all existing admins
        const admins = await Admin.find({});
        console.log(`Found ${admins.length} admins to migrate`);
        
        // Migrate each admin to user with ADMIN role
        for (const admin of admins) {
            const userData = {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                age: admin.age,
                gender: admin.gender,
                password: admin.password, // Keep existing hashed password
                role: ROLES.ADMIN, // Assign admin role to existing users
                isActive: true
            };
            
            // Check if user already exists
            const existingUser = await User.findOne({ email: admin.email });
            if (!existingUser) {
                await User.create(userData);
                console.log(`Migrated admin: ${admin.email}`);
            } else {
                console.log(`User already exists: ${admin.email}`);
            }
        }
        
        console.log('Migration completed successfully!');
        
        // Optional: Remove old admin collection (uncomment if you're sure)
        // await Admin.deleteMany({});
        // console.log('Old admin collection removed');
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateAdminsToUsers();
}

export default migrateAdminsToUsers;
