const express = require('express');
const router = express.Router();
const { 
    getInvoices, createInvoice, getInvoice, updateInvoice, deleteInvoice,
    getStaff, createStaff, updateStaff, deleteStaff,
    getInventory, createInventoryItem, updateStock,
    updateInventoryItem, deleteInventoryItem
} = require('../controllers/adminController');

// Invoices
router.route('/invoices').get(getInvoices).post(createInvoice);
router.route('/invoices/:id').get(getInvoice).put(updateInvoice).delete(deleteInvoice);

// Staff
router.route('/staff').get(getStaff).post(createStaff);
router.route('/staff/:id').put(updateStaff).delete(deleteStaff);

// Inventory
router.route('/inventory').get(getInventory).post(createInventoryItem);
router.route('/inventory/:id').put(updateInventoryItem).delete(deleteInventoryItem);
router.put('/inventory/:id/stock', updateStock);

module.exports = router;
