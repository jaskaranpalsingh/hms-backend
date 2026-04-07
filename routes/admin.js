const express = require('express');
const router = express.Router();
const { 
    getInvoices, createInvoice, getInvoice, updateInvoice, deleteInvoice,
    getStaff, createStaff, updateStaff, deleteStaff,
    getInventory, createInventoryItem, updateStock,
    updateInventoryItem, deleteInventoryItem
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// ── RBAC: All admin routes require authentication ──
router.use(protect);

// Invoices — admin + staff can view, only admin can create/update/delete
router.route('/invoices')
    .get(authorize('admin', 'staff'), getInvoices)
    .post(authorize('admin'), createInvoice);
router.route('/invoices/:id')
    .get(authorize('admin', 'staff'), getInvoice)
    .put(authorize('admin'), updateInvoice)
    .delete(authorize('admin'), deleteInvoice);

// Staff — admin only (full CRUD)
router.route('/staff')
    .get(authorize('admin'), getStaff)
    .post(authorize('admin'), createStaff);
router.route('/staff/:id')
    .put(authorize('admin'), updateStaff)
    .delete(authorize('admin'), deleteStaff);

// Inventory — admin + staff can view/update stock, only admin can create/delete
router.route('/inventory')
    .get(authorize('admin', 'staff'), getInventory)
    .post(authorize('admin'), createInventoryItem);
router.route('/inventory/:id')
    .put(authorize('admin'), updateInventoryItem)
    .delete(authorize('admin'), deleteInventoryItem);
router.put('/inventory/:id/stock', authorize('admin', 'staff'), updateStock);

module.exports = router;
