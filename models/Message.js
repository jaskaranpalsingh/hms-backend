const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isPatientVisible: {
        type: Boolean,
        default: true
    },
    isDoctorVisible: {
        type: Boolean,
        default: true
    },
    attachment: {
        url: String,
        name: String,
        fileType: String, // 'image' or 'pdf'
        size: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
