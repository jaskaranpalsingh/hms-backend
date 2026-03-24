const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    bedNumber: {
        type: String,
        required: [true, 'Please add a bed number']
    },
    wardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
        required: [true, 'Please select a ward']
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance', 'Cleaning'],
        default: 'Available'
    },
    currentPatientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        default: null
    },
    bedType: {
        type: String,
        enum: ['Manual', 'Semi-Electric', 'Full-Electric', 'ICU-Special'],
        default: 'Manual'
    },
    pricePerDay: {
        type: Number,
        default: 500
    }
}, { timestamps: true });

// Ensure bed numbers are unique within a ward (simplified)
bedSchema.index({ bedNumber: 1, wardId: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
