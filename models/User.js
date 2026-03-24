const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false  // Don't return password by default in queries
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'patient', 'staff'],
        default: 'patient'
    },
    phone: {
        type: String,
        maxlength: [15, 'Phone number cannot be longer than 15 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profileImage: {
        type: String, // URL/Path to the image
        default: null
    }
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function () {
    // Only hash if password was modified
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = mongoose.model('User', userSchema);
