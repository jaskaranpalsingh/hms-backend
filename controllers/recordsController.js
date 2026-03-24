const MedicalRecord = require('../models/MedicalRecord');
const LabReport = require('../models/LabReport');
const Patient = require('../models/Patient');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all medical records
// @route   GET /api/medical-records
// @access  Private (admin/doctor)
exports.getRecords = asyncHandler(async (req, res) => {
    const query = {};
    
    // If patient, they shouldn't use this route (redirect to getPatientRecords)
    if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.id });
        if (patient) query.patientId = patient._id;
    }

    const records = await MedicalRecord.find(query)
        .populate('patientId', 'name patientId')
        .populate('doctorId', 'name specialization')
        .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
});

// ==================== MEDICAL RECORDS ====================

// @desc    Get all records for a patient
// @route   GET /api/medical-records/patient/:patientId
// @access  Private
exports.getPatientRecords = asyncHandler(async (req, res) => {
    // Role Check
    if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.id });
        if (!patient || patient._id.toString() !== req.params.patientId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
    }

    const records = await MedicalRecord.find({ patientId: req.params.patientId })
        .populate('doctorId', 'name specialization')
        .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
});

// @desc    Create new medical record (with optional file upload)
// @route   POST /api/medical-records
// @access  Private (doctor/admin)
exports.createRecord = asyncHandler(async (req, res) => {
    if (req.user.role === 'patient') {
        return res.status(403).json({ success: false, message: 'Patients can not write records' });
    }

    const recordData = req.body;

    // Handle File Upload Metadata
    if (req.file) {
        recordData.attachments = [{
            fileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype
        }];
    }

    const record = await MedicalRecord.create(recordData);

    res.status(201).json({ success: true, data: record });
});

// @desc    Get single record
// @route   GET /api/medical-records/:id
// @access  Private
exports.getRecord = asyncHandler(async (req, res) => {
    const record = await MedicalRecord.findById(req.params.id)
        .populate('patientId', 'name patientId')
        .populate('doctorId', 'name specialization');

    if (!record) {
        return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, data: record });
});

// @desc    Update medical record
// @route   PUT /api/medical-records/:id
// @access  Private (doctor/admin)
exports.updateRecord = asyncHandler(async (req, res) => {
    let record = await MedicalRecord.findById(req.params.id);

    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    // Handle File Update
    if (req.file) {
        req.body.attachments = [{
            fileName: req.file.originalname,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype
        }];
    }

    record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.json({ success: true, data: record });
});

// ==================== LAB REPORTS ====================

exports.getLabReports = asyncHandler(async (req, res) => {
    const query = {};
    if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ userId: req.user.id });
        if (patient) query.patientId = patient._id;
    }

    const reports = await LabReport.find(query)
        .populate('patientId', 'name')
        .populate('requestedBy', 'name');

    res.json({ success: true, count: reports.length, data: reports });
});

exports.createLabReport = asyncHandler(async (req, res) => {
    const report = await LabReport.create(req.body);
    res.status(201).json({ success: true, data: report });
});

exports.updateLabReport = asyncHandler(async (req, res) => {
    const report = await LabReport.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!report) return res.status(404).json({ success: false, message: 'Lab report not found' });

    res.json({ success: true, data: report });
});
