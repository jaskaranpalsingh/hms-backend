const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Please add a patient ID']
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Please add a doctor ID']
    },
    testName: {
        type: String,
        required: [true, 'Please provide a test name'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Blood', 'Urine', 'Imaging', 'Pathology'],
        default: 'Blood'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    resultSummary: {
        type: String,
        default: 'Awaiting results'
    },
    attachment: {
        fileName: String,
        fileUrl: String, // Link to PDF/Image report
        uploadedAt: Date
    },
    dateRequested: {
        type: Date,
        default: Date.now
    },
    dateCompleted: Date
}, { timestamps: true });

module.exports = mongoose.model('LabReport', labReportSchema);
