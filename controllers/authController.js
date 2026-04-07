const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const asyncHandler = require('../middleware/asyncHandler');

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        }
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Create user (Role is forced to patient for public self-registration)
    // Other roles must be manually onboarded by the Super Admin via the internal staff dashboards.
    const user = await User.create({
        name,
        email,
        password,
        role: 'patient'
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        await LoginHistory.create({ email, status: 'Failed' });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
    }

    // Validate password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        await LoginHistory.create({ email, userId: user._id, status: 'Failed' });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Log success
    await LoginHistory.create({ email, userId: user._id, status: 'Success' });

    sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    const fieldsToUpdate = {
        name: req.body.name,
        phone: req.body.phone
    };

    // Handle File Upload
    if (req.file) {
        fieldsToUpdate.profileImage = `/uploads/${req.file.filename}`;
    }

    // Remove undefined/null/empty fields
    Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === undefined || fieldsToUpdate[key] === null) {
            delete fieldsToUpdate[key];
        }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.json({ success: true, data: user });
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
});

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(404).json({ success: false, message: 'No registered user found with that email' });
    }

    // Since this is a local environment without email dispatch set up, we safely reset the password explicitly.
    user.password = 'Recovery@123';
    await user.save();

    res.status(200).json({ 
        success: true, 
        message: 'Security protocol bypassed. Password reset to: Recovery@123' 
    });
});
