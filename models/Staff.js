const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Staff members can have login access
    },
    name: {
        type: String,
        required: [true, 'Please add a staff name'],
        trim: true
    },
    role: {
        type: String,
        enum: ['Nurse', 'Admin', 'Receptionist', 'Technician', 'Pharmacist', 'Janitor'],
        required: [true, 'Please select a role']
    },
    department: {
        type: String,
        required: [true, 'Please select a department']
    },
    shift: {
        type: String,
        enum: ['Morning', 'Evening', 'Night', 'Rotating'],
        required: [true, 'Please assign a shift']
    },
    salary: {
        type: Number,
        default: 0
    },
    hireDate: {
        type: Date,
        default: Date.now
    },
    contact: {
        phone: String,
        email: String
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
