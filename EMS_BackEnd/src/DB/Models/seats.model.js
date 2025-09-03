import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    rowNumber: {
        type: Number,
        required: true,
        min: [1, "Row number must be at least 1"]
    },
    seatNumber: {
        type: Number,
        required: true,
        min: [1, "Seat number must be at least 1"]
    },
    status: {
        type: String,
        enum: ["available", "reserved", "paid", "blocked"],
        default: "available"
    },
    basePrice: {
        type: Number,
        required: true,
        min: [0, "Base price cannot be negative"]
    },
    finalPrice: {
        type: Number,
        required: true,
        min: [0, "Final price cannot be negative"]
    },
    category: {
        type: String,
        enum: ["standard", "premium", "vip", "accessible"],
        default: "standard"
    },
    // Pricing multipliers for different categories
    priceMultiplier: {
        type: Number,
        default: 1.0,
        min: [0.1, "Price multiplier must be at least 0.1"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For accessibility features
    isAccessible: {
        type: Boolean,
        default: false
    },
    // For special features (e.g., near stage, aisle seat)
    features: [{
        type: String,
        enum: ["near_stage", "aisle", "window", "center", "back_row", "front_row", "balcony"]
    }],
    // Temporary reservation (for user selection process)
    reservedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reservedAt: {
        type: Date
    },
    // Reservation expiry (seats are auto-released after 15 minutes)
    reservationExpiry: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index to ensure unique seats per event
SeatSchema.index({ event: 1, rowNumber: 1, seatNumber: 1 }, { unique: true });

// Index for reservation management
SeatSchema.index({ event: 1, status: 1, reservedBy: 1 });
SeatSchema.index({ reservationExpiry: 1 }, { expireAfterSeconds: 0 });

// Virtual for seat identifier
SeatSchema.virtual('seatIdentifier').get(function() {
    return `Row ${this.rowNumber} - Seat ${this.seatNumber}`;
});

// Virtual for seat status color (for frontend)
SeatSchema.virtual('statusColor').get(function() {
    const colors = {
        available: "#D3D3D3",    // Light grey
        reserved: "#9370DB",     // Light purple
        paid: "#4B0082",        // Dark purple
        blocked: "#FF0000"      // Red
    };
    return colors[this.status] || colors.available;
});

// Pre-save middleware to calculate final price
SeatSchema.pre('save', function(next) {
    if (this.isModified('basePrice') || this.isModified('priceMultiplier')) {
        this.finalPrice = Math.round(this.basePrice * this.priceMultiplier);
    }
    next();
});

// Method to check if seat is available for booking
SeatSchema.methods.isAvailableForBooking = function() {
    return this.status === "available" && this.isActive;
};

// Method to check if seat is reserved by user
SeatSchema.methods.isReservedByUser = function(userId) {
    return this.status === "reserved" && 
           this.reservedBy && 
           this.reservedBy.toString() === userId.toString() &&
           this.reservationExpiry > new Date();
};

// Method to reserve seat temporarily
SeatSchema.methods.reserveTemporarily = function(userId, durationMinutes = 15) {
    this.status = "reserved";
    this.reservedBy = userId;
    this.reservedAt = new Date();
    this.reservationExpiry = new Date(Date.now() + durationMinutes * 60 * 1000);
    return this.save();
};

// Method to release reservation
SeatSchema.methods.releaseReservation = function() {
    this.status = "available";
    this.reservedBy = undefined;
    this.reservedAt = undefined;
    this.reservationExpiry = undefined;
    return this.save();
};

const Seat = mongoose.model("Seat", SeatSchema);

export default Seat;
