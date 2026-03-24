const Doctor = require('../models/Doctor');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
exports.getDoctors = asyncHandler(async (req, res) => {
    // Query filtering
    const query = {};
    if (req.query.specialization) query.specialization = req.query.specialization;
    if (req.query.status) query.status = req.query.status;

    // Search by name
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: 'i' };
    }

    const doctors = await Doctor.find(query)
        .populate('userId', 'name role')
        .sort({ specialization: 1, name: 1 });

    res.json({
        success: true,
        count: doctors.length,
        data: doctors
    });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
exports.getDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name role email');

    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
});

// @desc    Create new doctor (includes user registration)
// @route   POST /api/doctors
// @access  Private (admin only)
exports.createDoctor = asyncHandler(async (req, res) => {
    // 1. Check if user already exists
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 2. Create User first
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password || 'Doctor@123', // Default password if none provided
        role: 'doctor',
        phone: req.body.contact?.phone
    });

    // 3. Create Doctor profile linked to the new user
    const doctor = await Doctor.create({
        ...req.body,
        userId: user._id
    });

    res.status(201).json({ success: true, data: doctor });
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (admin or the doctor themselves)
exports.updateDoctor = asyncHandler(async (req, res) => {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Role check: Only admin or the doctor themselves can update
    if (req.user.role !== 'admin' && doctor.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this doctor profile' });
    }

    doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.json({ success: true, data: doctor });
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (admin only)
exports.deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await doctor.deleteOne();

    res.json({ success: true, message: 'Doctor profile deleted' });
});
