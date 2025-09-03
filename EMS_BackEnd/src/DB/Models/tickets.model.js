import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
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
    seat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'used', 'cancelled', 'refunded'],
        default: 'active'
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    qrCode: {
        type: String
    },
    bookingReference: {
        type: String,
        unique: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate booking reference before saving
TicketSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        this.bookingReference = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Ticket = mongoose.model('Ticket', TicketSchema);
export default Ticket;