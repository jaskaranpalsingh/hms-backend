const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Please add a specialization'],
        enum: [
            'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 
            'Dermatologist', 'General Physician', 'Gynecologist', 'Oncologist'
        ]
    },
    qualification: {
        type: String,
        required: [true, 'Please add qualifications (e.g., MBBS, MD)']
    },
    experience: {
        type: Number,
        required: [true, 'Please add years of experience']
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Please add a contact number']
        },
        email: {
            type: String,
            required: [true, 'Please add an email']
        }
    },
    availability: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        startTime: String, // e.g., "09:00"
        endTime: String    // e.g., "17:00"
    }],
    consultationFee: {
        type: Number,
        required: [true, 'Please add consultation fee']
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active'
    },
    about: {
        type: String,
        maxlength: [500, 'About section cannot exceed 500 characters']
    }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
