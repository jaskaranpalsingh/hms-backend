const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if null it's a global notification
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Alert', 'Reminder', 'Info', 'Emergency', 'System'], default: 'Info' },
    isRead: { type: Boolean, default: false },
    link: { type: String } // optional link to related resource
}, { timestamps: true });

// Post-save middleware to emit socket event
notificationSchema.post('save', function(doc) {
    try {
        // We can't easily get 'app' here without passing it or requiring it in a way that might cause circular dependency
        // However, we can use a small trick: emit the event from the controller after creation,
        // OR use a global event emitter.
        // Given the current structure, let's keep it in the controllers or add a shared utility.
    } catch (err) {
        console.error('Socket emission error in model:', err);
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
