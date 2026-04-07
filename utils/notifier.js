const Notification = require('../models/Notification');

/**
 * Helper to create a notification and emit socket event
 * @param {Object} req - Express request object
 * @param {Object} data - Notification data { userId, title, message, type, link }
 */
const sendNotification = async (req, data) => {
    try {
        const notification = await Notification.create(data);
        
        const io = req.app.get('socketio');
        if (io) {
            if (data.userId) {
                io.to(String(data.userId)).emit('new_notification', notification);
            } else {
                io.emit('new_notification', notification);
            }
        }
        
        return notification;
    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

module.exports = { sendNotification };
