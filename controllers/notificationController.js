const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notifier');

// @desc    Get user notifications
// @route   GET /api/notifications/user/:userId
exports.getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            $or: [{ userId: req.params.userId }, { userId: { $exists: false } }]
        }).sort({ createdAt: -1 });
        res.json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        next(err);
    }
};

// @desc    Create notification
// @route   POST /api/notifications
exports.createNotification = async (req, res, next) => {
    try {
        const saved = await sendNotification(req, req.body);
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        res.json({ success: true, data: notification });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/user/:userId/read-all
exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { 
               $or: [
                 { userId: req.params.userId }, 
                 { userId: { $exists: false } }
               ], 
               isRead: false 
            },
            { isRead: true }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        next(err);
    }
};
