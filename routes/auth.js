const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    updatePassword,
    getUsers,
    forgotPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Private routes (any authenticated user)
router.get('/me', protect, getMe);
router.put('/me', protect, upload.single('profileImage'), updateProfile);
router.put('/update-password', protect, updatePassword);

// Admin-only routes
router.get('/users', protect, authorize('admin'), getUsers);

module.exports = router;
