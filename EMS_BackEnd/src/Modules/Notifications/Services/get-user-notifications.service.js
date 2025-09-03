import Notification from '../../../DB/Models/notifications.model.js';

async function getUserNotifications(userId) {
  return await Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
}

export default getUserNotifications;