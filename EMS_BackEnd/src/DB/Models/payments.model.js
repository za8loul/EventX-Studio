import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'bank_transfer', 'wallet'],
        required: true
    },
    transactionId: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;