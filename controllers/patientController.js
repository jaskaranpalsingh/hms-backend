const Patient = require('../models/Patient');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = asyncHandler(async (req, res) => {
    // Support query filters
    const query = {};

    // Search by name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by status
    if (req.query.status) {
        query.status = req.query.status;
    }

    // Filter by gender
    if (req.query.gender) {
        query.gender = req.query.gender;
    }

    // Filter by blood group
    if (req.query.bloodGroup) {
        query.bloodGroup = req.query.bloodGroup;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
        .populate('assignedDoctor', 'name specialization')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        count: patients.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: patients
    });
});

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id)
        .populate('assignedDoctor', 'name specialization phone')
        .populate('currentBed');

    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
});

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private (admin, doctor, staff)
exports.createPatient = asyncHandler(async (req, res) => {
    // Normalization: Ensure contact object exists and is populated
    if (!req.body.contact) req.body.contact = {};
    if (!req.body.contact.phone && req.body.phone) req.body.contact.phone = req.body.phone;
    if (!req.body.contact.email && req.body.email) req.body.contact.email = req.body.email;
    
    const { name, age, gender, contact } = req.body;

    // Validation
    if (!name || !age || !gender) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, age, and gender'
        });
    }

    if (!contact || !contact.phone) {
        return res.status(400).json({
            success: false,
            message: 'Please provide contact phone number'
        });
    }

    // patientId is auto-generated via pre-save hook
    const patient = await Patient.create(req.body);

    res.status(201).json({ success: true, data: patient });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (admin, doctor, staff)
exports.updatePatient = asyncHandler(async (req, res) => {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.json({ success: true, data: patient });
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (admin only)
exports.deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient deleted successfully', data: {} });
});

// @desc    Add patient vitals
// @route   POST /api/patients/:id/vitals
// @access  Private (admin, doctor, staff)
exports.addVitals = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Add vitals to the array
    patient.vitals.push({
        ...req.body,
        recordedBy: req.user.id
    });

    await patient.save();

    res.status(200).json({ success: true, data: patient.vitals[patient.vitals.length - 1] });
});
