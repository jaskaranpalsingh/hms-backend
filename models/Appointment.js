const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Simple numeric ID
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please add a patient ID']
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Please add a doctor ID']
    },
    date: {
        type: Date,
        required: [true, 'Please add an appointment date']
    },
    timeSlot: {
        type: String,
        required: [true, 'Please select a time slot (e.g., 09:00 - 10:00)']
    },
    reason: {
        type: String,
        required: [true, 'Please provide reason for visit']
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    type: {
        type: String,
        enum: ['General Checkup', 'Specialist Consultation', 'Emergency', 'Follow-up'],
        default: 'General Checkup'
    },
    notes: String,
    cancellationReason: String
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
