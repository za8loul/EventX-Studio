import Notification from '../../../DB/Models/notifications.model.js';

async function createNotification(userId, message, options = {}) {
  const {
    type = 'general',
    title = 'Notification',
    eventId = null,
    eventTitle = null,
    priority = 'medium',
    actionUrl = null
  } = options;

  return await Notification.create({
    userId,
    type,
    title,
    message,
    eventId,
    eventTitle,
    priority,
    actionUrl
  });
}

export default createNotification;