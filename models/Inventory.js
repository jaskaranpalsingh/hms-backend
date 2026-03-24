const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Please add an item name'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Pharmaceuticals', 'Equipment', 'Supplies', 'Critical-Care']
    },
    batchId: {
        type: String,
        required: true
    },
    quantityInStock: {
        type: Number,
        required: [true, 'Please add current stock'],
        default: 0
    },
    minimumThreshold: {
        type: Number,
        required: [true, 'Please add a minimum threshold for alerts'],
        default: 10
    },
    expirationDate: {
        type: Date,
        required: [true, 'Please add an expiration date (for medicines)']
    },
    supplier: {
        name: String,
        contact: String
    },
    unitPrice: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Check low stock status
inventorySchema.virtual('isLowStock').get(function() {
    return this.quantityInStock <= this.minimumThreshold;
});

module.exports = mongoose.model('Inventory', inventorySchema);
