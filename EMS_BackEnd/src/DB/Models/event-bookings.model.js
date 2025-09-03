import mongoose from "mongoose";

const EventBookingSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    numberOfTickets: {
        type: Number,
        required: true,
        min: [1, "Must book at least 1 ticket"],
        max: [10, "Cannot book more than 10 tickets at once"]
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, "Total amount cannot be negative"]
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["credit_card", "debit_card", "paypal", "cash"],
        required: true
    },
    specialRequests: {
        type: String,
        maxLength: [500, "Special requests cannot exceed 500 characters"]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});

// Compound index to prevent duplicate bookings for the same user and event
EventBookingSchema.index({ event: 1, user: 1 }, { unique: true });

// Virtual for calculating days until event
EventBookingSchema.virtual('daysUntilEvent').get(function() {
    if (this.event && this.event.date) {
        const now = new Date();
        const eventDate = new Date(this.event.date);
        const diffTime = eventDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    return null;
});

const EventBooking = mongoose.model("EventBooking", EventBookingSchema);

export default EventBooking;
