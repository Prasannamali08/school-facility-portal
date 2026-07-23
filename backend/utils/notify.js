const Notification = require('../models/Notification');

/**
 * Creates a notification document for a target user.
 * @param {Object} params
 * @param {string} params.user - user id to notify
 * @param {string} params.message - notification text
 * @param {string} params.type - notification type
 * @param {string} [params.issue] - related issue id
 */
const createNotification = async ({ user, message, type = 'general', issue = null }) => {
  try {
    return await Notification.create({ user, message, type, issue });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = createNotification;
