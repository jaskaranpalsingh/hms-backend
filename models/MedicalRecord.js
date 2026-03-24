const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
        default: Date.now
    },
    diagnosis: {
        type: String,
        required: [true, 'Please add a diagnosis']
    },
    prescription: [{
        medicine: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    labTests: [{
        testName: String,
        status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
        result: String
    }],
    notes: String,
    symptoms: [String],
    followUpDate: Date
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
