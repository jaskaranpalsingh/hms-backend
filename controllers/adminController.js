const Invoice = require('../models/Invoice');
const Staff = require('../models/Staff');
const User = require('../models/User'); 
const Inventory = require('../models/Inventory');
const asyncHandler = require('../middleware/asyncHandler');
const Patient = require('../models/Patient');

// ==================== INVOICES ====================

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (admin, staff, doctor)
exports.getInvoices = asyncHandler(async (req, res) => {
    const query = {};
    
    // Support filtering by patient ID if needed
    if (req.query.patientId) query.patientId = req.query.patientId;
    if (req.query.status) query.paymentStatus = req.query.status;

    const invoices = await Invoice.find(query)
        .populate('patientId', 'name age gender patientId')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        count: invoices.length,
        data: invoices
    });
});

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private (admin or staff)
exports.createInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.create(req.body);

    res.status(201).json({ success: true, data: invoice });
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('patientId', 'name age gender patientId address contact');

    if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
});

// @desc    Update invoice (payment/items)
// @route   PUT /api/invoices/:id
// @access  Private (admin or staff)
exports.updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private (admin only)
exports.deleteInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    await invoice.deleteOne();
    res.json({ success: true, message: 'Invoice deleted successfully' });
});

// ==================== STAFF MANAGEMENT ====================

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (admin only)
exports.getStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.find().sort({ name: 1 });

    res.json({
        success: true,
        count: staff.length,
        data: staff
    });
});

// @desc    Add new staff member (includes automatic user account creation)
// @route   POST /api/staff
// @access  Private (admin only)
exports.createStaff = asyncHandler(async (req, res) => {
    const { name, contact, password } = req.body;
    
    // 1. Check if user already exists
    const userExists = await User.findOne({ email: contact?.email || req.body.email });
    if (userExists) {
        return res.status(400).json({ success: false, message: 'A user with this email already exists in the system.' });
    }

    // 2. Create User first (Force role to 'staff' for technical access)
    const user = await User.create({
        name: name,
        email: contact?.email || req.body.email,
        password: password || 'Staff@123', // Default password protocol
        role: 'staff',
        phone: contact?.phone
    });

    // 3. Create Staff profile linked to the new user
    const staff = await Staff.create({
        ...req.body,
        userId: user._id
    });

    res.status(201).json({ success: true, data: staff });
});

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private (admin only)
exports.updateStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    res.json({ success: true, data: staff });
});

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (admin only)
exports.deleteStaff = asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    await staff.deleteOne();

    res.json({ success: true, message: 'Staff deleted successfully', data: {} });
});

// ==================== INVENTORY ====================

// @desc    Get all inventory
// @route   GET /api/inventory
// @access  Private (staff, admin)
exports.getInventory = asyncHandler(async (req, res) => {
    const items = await Inventory.find().sort({ category: 1, itemName: 1 });

    res.json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Update stock level
// @route   PUT /api/inventory/:id/stock
// @access  Private (staff, admin)
exports.updateStock = asyncHandler(async (req, res) => {
    const { quantityInStock } = req.body;
    
    const item = await Inventory.findByIdAndUpdate(req.params.id, { 
        quantityInStock 
    }, { new: true });

    if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({ success: true, data: item });
});

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (staff, admin)
exports.createInventoryItem = asyncHandler(async (req, res) => {
    const item = await Inventory.create(req.body);

    res.status(201).json({ success: true, data: item });
});

// @desc    Update full inventory item
// @route   PUT /api/inventory/:id
// @access  Private (staff, admin)
exports.updateInventoryItem = asyncHandler(async (req, res) => {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({ success: true, data: item });
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (admin only)
exports.deleteInventoryItem = asyncHandler(async (req, res) => {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
        return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    await item.deleteOne();

    res.json({ success: true, message: 'Inventory item deleted successfully' });
});
