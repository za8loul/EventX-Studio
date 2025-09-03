import express from 'express';
import Notification from '../../DB/Models/notifications.model.js';
import authenticationMiddleware from '../../Middlewares/auth.middleware.js';

const notificationsController = express.Router();

// Get notifications for a user
notificationsController.get('/', authenticationMiddleware, async (req, res) => {
  try {
    const userId = req.loggedInUser.user._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications
    
    res.status(200).json({ 
      message: 'Notifications fetched successfully',
      notifications 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
notificationsController.patch('/:id/read', authenticationMiddleware, async (req, res) => {
  try {
    const userId = req.loggedInUser.user._id;
    const notificationId = req.params.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
notificationsController.patch('/mark-all-read', authenticationMiddleware, async (req, res) => {
  try {
    const userId = req.loggedInUser.user._id;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ 
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get unread notification count
notificationsController.get('/unread-count', authenticationMiddleware, async (req, res) => {
  try {
    const userId = req.loggedInUser.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false });
    
    res.status(200).json({ 
      message: 'Unread count fetched successfully',
      unreadCount: count 
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default notificationsController;
