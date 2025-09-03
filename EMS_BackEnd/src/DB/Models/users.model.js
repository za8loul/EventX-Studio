import mongoose from "mongoose";

// Define roles and their permissions
const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

const PERMISSIONS = {
    // User management
    CREATE_USER: 'create_user',
    READ_USER: 'read_user',
    UPDATE_USER: 'update_user',
    DELETE_USER: 'delete_user',
    
    // Event management
    CREATE_EVENT: 'create_event',
    READ_EVENT: 'read_event',
    UPDATE_EVENT: 'update_event',
    DELETE_EVENT: 'delete_event',
    
    // Event booking/attendance
    BOOK_EVENT: 'book_event',
    CANCEL_BOOKING: 'cancel_booking',
    VIEW_BOOKINGS: 'view_bookings',
    
    // System management
    VIEW_LOGS: 'view_logs'
};

// Role-Permission mapping
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        PERMISSIONS.CREATE_USER, PERMISSIONS.READ_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER,
        PERMISSIONS.CREATE_EVENT, PERMISSIONS.READ_EVENT, PERMISSIONS.UPDATE_EVENT, PERMISSIONS.DELETE_EVENT,
        PERMISSIONS.BOOK_EVENT, PERMISSIONS.CANCEL_BOOKING, PERMISSIONS.VIEW_BOOKINGS,
        PERMISSIONS.VIEW_LOGS
    ],
    [ROLES.USER]: [
        PERMISSIONS.READ_EVENT,
        PERMISSIONS.BOOK_EVENT,
        PERMISSIONS.CANCEL_BOOKING,
        PERMISSIONS.VIEW_BOOKINGS
    ]
};

// Create Users Schema
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: [25, "First Name must be at most 25 length"],
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        maxLength: [25, "Last Name must be at most 25 length"],
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: [18, "Age must be at least 18 years old"],
        max: [100, "Age must be at most 100 years old"]
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
            name: "idx_email_unique"
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    virtuals: {
        fullName: {
            get() {
                return `${this.firstName} ${this.lastName}`
            }
        }
    },
    methods: {
        getFullName() {
            return `${this.firstName} ${this.lastName}`
        },
        
        hasPermission(permission) {
            const userPermissions = ROLE_PERMISSIONS[this.role] || [];
            return userPermissions.includes(permission);
        },
        
        hasRole(role) {
            return this.role === role;
        },
        
        isAdmin() {
            return this.role === ROLES.ADMIN;
        }
    }
});

// Create User model
const User = mongoose.model("User", UserSchema);

// Export constants for use in other parts of the application
export { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
export default User;
