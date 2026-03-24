const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if null it's a global notification
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Alert', 'Reminder', 'Info', 'Emergency', 'System'], default: 'Info' },
    isRead: { type: Boolean, default: false },
    link: { type: String } // optional link to related resource
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
