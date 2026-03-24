const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
    wardNumber: {
        type: String,
        required: [true, 'Please add a ward number'],
        unique: true
    },
    wardType: {
        type: String,
        required: [true, 'Please select ward type'],
        enum: ['General', 'ICU', 'Emergency', 'Pediatric', 'Maternity', 'Private']
    },
    capacity: {
        type: Number,
        required: [true, 'Please add capacity']
    },
    floor: Number,
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Ward', wardSchema);
