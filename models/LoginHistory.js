const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional, as failed logins might not match a valid user
    },
    status: {
        type: String,
        enum: ['Success', 'Failed'],
        required: true
    },
    ipAddress: {
        type: String,
        default: 'Unknown'
    },
    userAgent: {
        type: String,
        default: 'Unknown'
    }
}, { timestamps: true });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
