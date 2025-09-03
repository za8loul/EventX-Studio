import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, "Event title must be at most 100 characters"]
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: [1000, "Event description must be at most 1000 characters"]
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: [1, "Event capacity must be at least 1"]
    },
    currentBookings: {
        type: Number,
        default: 0,
        min: [0, "Current bookings cannot be negative"]
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Event price cannot be negative"]
    },
    category: {
        type: String,
        required: true,
        enum: ["conference", "workshop", "seminar", "concert", "sports", "other"]
    },
    status: {
        type: String,
        enum: ["draft", "published", "cancelled", "completed", "sold_out"],
        default: "draft"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    bookingDeadline: {
        type: Date,
        required: true
    },
    refundPolicy: {
        type: String,
        maxLength: [500, "Refund policy cannot exceed 500 characters"]
    },
    seatingLayout: {
        type: {
            type: String,
            enum: ["theater", "stadium", "banquet", "conference", "custom"],
            default: "theater"
        },
        rows: {
            type: Number,
            required: true,
            min: [1, "Event must have at least 1 row"]
        },
        seatsPerRow: {
            type: Number,
            required: true,
            min: [1, "Each row must have at least 1 seat"]
        },
        // For custom layouts (e.g., different seats per row)
        customLayout: [{
            rowNumber: Number,
            seatsInRow: Number
        }]
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
        availableSeats: {
            get() {
                return Math.max(0, this.capacity - this.currentBookings);
            }
        },
        isSoldOut: {
            get() {
                return this.currentBookings >= this.capacity;
            }
        },
        bookingPercentage: {
            get() {
                if (this.capacity === 0) return 0;
                return Math.round((this.currentBookings / this.capacity) * 100);
            }
        }
    },
    methods: {
        canBook(tickets = 1) {
            return this.isActive && 
                   this.status === 'published' && 
                   this.currentBookings + tickets <= this.capacity &&
                   new Date() < this.bookingDeadline;
        },
        
        updateBookingCount(change) {
            this.currentBookings = Math.max(0, this.currentBookings + change);
            if (this.currentBookings >= this.capacity) {
                this.status = 'sold_out';
            }
            return this.save();
        }
    }
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
