import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['event_created', 'event_updated', 'event_deleted', 'event_cancelled', 'booking_confirmed', 'booking_cancelled', 'general'],
    default: 'general',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false, // Not all notifications are event-related
  },
  eventTitle: {
    type: String,
    required: false, // For event-related notifications
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  actionUrl: {
    type: String,
    required: false, // URL to navigate to when notification is clicked
  },
}, {
  timestamps: true,
});

// Index for better query performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
