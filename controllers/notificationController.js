const Notification = require('../models/Notification');

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
        const notification = new Notification(req.body);
        const saved = await notification.save();
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
