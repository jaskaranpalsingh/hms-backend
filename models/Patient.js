const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientId: {
        type: String,
        unique: true
        // Auto-generated in controller as PT-XXXX
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add patient name'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    age: {
        type: Number,
        required: [true, 'Please add patient age'],
        min: [0, 'Age cannot be negative'],
        max: [150, 'Age cannot exceed 150']
    },
    gender: {
        type: String,
        required: [true, 'Please select gender'],
        enum: ['Male', 'Female', 'Other']
    },
    contact: {
        phone: {
            type: String,
            required: [true, 'Please add phone number'],
            maxlength: [15, 'Phone number cannot exceed 15 characters']
        },
        email: {
            type: String,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
        },
        emergencyContact: {
            type: String
        }
    },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String, default: 'India' }
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    medicalHistory: {
        allergies: [{ type: String }],
        chronicDiseases: [{ type: String }],
        pastSurgeries: [{
            name: { type: String },
            date: { type: Date },
            notes: { type: String }
        }],
        currentMedications: [{
            name: { type: String },
            dosage: { type: String },
            frequency: { type: String }
        }],
        familyHistory: { type: String }
    },
    status: {
        type: String,
        enum: ['Active', 'Admitted', 'Discharged', 'Inactive'],
        default: 'Active'
    },
    assignedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    treatmentType: {
        type: String,
        enum: ['Outpatient', 'Inpatient', 'Emergency'],
        default: 'Outpatient'
    },
    currentBed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bed'
    },
    admissionDate: { type: Date },
    dischargeDate: { type: Date },
    lastVisit: { type: Date },
    illness: { type: String },
    vitals: [{
        bloodPressure: { type: String },
        heartRate: { type: Number },
        temperature: { type: Number },
        respiratoryRate: { type: Number },
        spO2: { type: Number },
        weight: { type: Number },
        height: { type: Number },
        bmi: { type: Number },
        recordedAt: { type: Date, default: Date.now },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { timestamps: true });

// Auto-generate patientId before saving
patientSchema.pre('save', async function () {
    if (!this.patientId) {
        const lastPatient = await this.constructor.findOne().sort({ createdAt: -1 });
        let nextNum = 1001;

        if (lastPatient && lastPatient.patientId) {
            const num = parseInt(lastPatient.patientId.replace('PT-', ''));
            if (!isNaN(num)) nextNum = num + 1;
        }

        this.patientId = `PT-${nextNum}`;
    }
});

module.exports = mongoose.model('Patient', patientSchema);
