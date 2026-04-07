const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.warn('⚠️ No token provided in request headers');
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.warn(`⚠️ User not found in database for ID: ${decoded.id}`);
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('❌ JWT Verification failed:', error.message);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Role-based authorization
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.warn('⚠️ Authorize middleware called without req.user set!');
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            console.warn(`🚫 Role '${req.user.role}' is not authorized to access this route. Allowed roles: [${roles.join(', ')}]`);
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
